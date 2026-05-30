import {
  WebIO, VertexLayout, type Accessor, type Document, type GLTF, type Primitive, type TextureInfo
} from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { PathtracingSceneData, Light, VERTEX_STRIDE, type SceneTextureLike } from '../scene_data';
import { MaterialData } from '../material';
import { normalizeExternalAssetUrl } from './url_normalization';
import { CachedWebIO } from './cached_web_io';

export interface LoadedPathtracingScene {
  scene: PathtracingSceneData;
}

export async function loadSceneFromBlobs(files: [string, File][]): Promise<LoadedPathtracingScene> {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;

  const io = new CachedWebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

  const doc = await readDocumentFromFiles(io, files);
  await doc.transform(dequantize());
  return createSceneFromDocument(doc);
}

export async function loadSceneFromUrl(url: string): Promise<LoadedPathtracingScene> {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;

  const io = new CachedWebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

  const doc = await io.read(normalizeExternalAssetUrl(url));
  await doc.transform(dequantize());
  return createSceneFromDocument(doc);
}

async function readDocumentFromFiles(io: WebIO, files: [string, File][]): Promise<Document> {
  const byExt = new Map<string, File>();
  for (const [, file] of files) byExt.set(file.name.split('.').pop() ?? '', file);

  const glb = byExt.get('glb');
  if (glb) return io.readBinary(new Uint8Array(await glb.arrayBuffer()));

  const gltf = byExt.get('gltf');
  if (!gltf) throw new Error('No glTF scene found in dropped files.');

  const resources: Record<string, Uint8Array<ArrayBuffer>> = {};
  let json: GLTF.IGLTF | null = null;
  for (const [path, file] of files) {
    if (file.name.endsWith('.gltf')) {
      json = JSON.parse(await file.text()) as GLTF.IGLTF;
    } else {
      const buffer: ArrayBuffer = await file.arrayBuffer();
      resources[path.slice(1)] = new Uint8Array(buffer);
    }
  }
  if (!json) throw new Error('No glTF scene found in dropped files.');
  return io.readJSON({ json, resources });
}

async function createSceneFromDocument(doc: Document): Promise<LoadedPathtracingScene> {
  const root = doc.getRoot();
  const gltfScene = root.listScenes()[0];
  if (!gltfScene) throw new Error('This model contains no scene.');

  console.time('Scene parsing');
  const scene = new PathtracingSceneData();

  // --- Texture cache ---
  const textureCache = new Map<string, Promise<number>>();
  const ensureTexture = async (
    texture: unknown,
    textureInfo: TextureInfo | null,
    colorSpace: 'linear' | 'srgb',
  ): Promise<number> => {
    if (!texture) return -1;
    const tex = texture as { getImage?: () => Uint8Array | null; getMimeType?: () => string; getURI?: () => string; getName?: () => string };
    const key = getTextureCacheKey(tex, textureInfo, colorSpace);
    if (!textureCache.has(key)) {
      textureCache.set(key, createSceneTexture(tex, textureInfo, colorSpace).then(t => scene.addTexture(t)));
    }
    return textureCache.get(key)!;
  };

  // --- Count total non-indexed vertices (full DFS) ---
  function countVertices(node: any): number {
    let n = 0;
    const mesh = node.getMesh?.();
    if (mesh) {
      for (const prim of mesh.listPrimitives()) {
        const idx = prim.getIndices();
        if (idx) n += idx.getCount();
      }
    }
    for (const child of node.listChildren()) n += countVertices(child);
    return n;
  }
  let totalVertices = 0;
  for (const node of gltfScene.listChildren()) totalVertices += countVertices(node);

  const combinedBuffer = new Float32Array(totalVertices * VERTEX_STRIDE);
  let vertexOffset = 0;

  // --- Traverse scene graph ---
  const matCache = new Map<unknown, Promise<number>>();
  const ensureMaterial = (mat: unknown) => {
    if (!matCache.has(mat)) {
      matCache.set(mat, createMaterialData(mat, ensureTexture).then(m => scene.addMaterial(m)));
    }
    return matCache.get(mat)!;
  };

  const stack: Array<{ node: any; parentMatrix: Float32Array }> = [];
  for (const node of gltfScene.listChildren()) {
    stack.push({ node, parentMatrix: identityMatrix() });
  }

  while (stack.length > 0) {
    const { node, parentMatrix } = stack.pop()!;
    const localMatrix = node.getMatrix() ? new Float32Array(node.getMatrix()!) : nodeToMatrix(node);
    const worldMatrix = multiplyMat4(parentMatrix, localMatrix);

    for (const child of node.listChildren()) {
      stack.push({ node: child, parentMatrix: worldMatrix });
    }

    const mesh = node.getMesh();
    if (!mesh) continue;

    const light = (node as any).getLight?.();
    if (light) {
      const l = new Light();
      l.position = [worldMatrix[12] ?? 0, worldMatrix[13] ?? 0, worldMatrix[14] ?? 0];
      l.type = light.getType?.() === 'point' ? 0 : 1;
      const color = light.getColor?.() ?? [1, 1, 1];
      const intensity = light.getIntensity?.() ?? 1.0;
      l.emission = [color[0] * intensity, color[1] * intensity, color[2] * intensity];
      scene.addLight(l);
    }

    for (const prim of mesh.listPrimitives()) {
      const matGltf = prim.getMaterial();
      const matIdx = matGltf ? await ensureMaterial(matGltf) : 0;
      vertexOffset += packPrimitive(prim, worldMatrix, matIdx, combinedBuffer, vertexOffset);
    }
  }

  scene.triangleBuffer = combinedBuffer.slice(0, vertexOffset * VERTEX_STRIDE);
  console.timeEnd('Scene parsing');

  return { scene };
}

// --- Primitive packing ---

function packPrimitive(
  prim: Primitive,
  worldMatrix: Float32Array,
  matIdx: number,
  buffer: Float32Array,
  vertexOffset: number,
): number {
  const indices = prim.getIndices();
  if (!indices) return 0;

  const posAcc = prim.getAttribute('POSITION');
  const normAcc = prim.getAttribute('NORMAL');
  const uvAcc = prim.getAttribute('TEXCOORD_0');
  const uv1Acc = prim.getAttribute('TEXCOORD_1');
  const tangentAcc = prim.getAttribute('TANGENT');
  const colorAcc = prim.getAttribute('COLOR_0');

  if (!posAcc) return 0;

  const positions = toFloat32(posAcc);
  const normals = normAcc ? toFloat32(normAcc) : null;
  const uvs = uvAcc ? toFloat32(uvAcc) : null;
  const uv1s = uv1Acc ? toFloat32(uv1Acc) : null;
  const tangents = tangentAcc ? toFloat32(tangentAcc) : null;
  const colors = colorAcc ? normalizeColors(colorAcc) : null;
  const indexArray = toUint32(indices);

  const normalMatrix = getNormalMatrix(worldMatrix);
  const vertexCount = indexArray.length;

  for (let i = 0; i < vertexCount; i++) {
    const vi = indexArray[i]!;
    const dst = (vertexOffset + i) * VERTEX_STRIDE;

    // position (world space)
    const px = positions[vi * 3 + 0]!;
    const py = positions[vi * 3 + 1]!;
    const pz = positions[vi * 3 + 2]!;
    const [wx, wy, wz] = transformPoint(px, py, pz, worldMatrix);
    buffer[dst + 0] = wx;
    buffer[dst + 1] = wy;
    buffer[dst + 2] = wz;
    buffer[dst + 3] = matIdx;

    // normal (world space, normal matrix)
    if (normals) {
      const nx = normals[vi * 3 + 0]!;
      const ny = normals[vi * 3 + 1]!;
      const nz = normals[vi * 3 + 2]!;
      const [wnx, wny, wnz] = transformDir(nx, ny, nz, normalMatrix);
      buffer[dst + 4] = wnx;
      buffer[dst + 5] = wny;
      buffer[dst + 6] = wnz;
    }
    buffer[dst + 7] = 0.0;

    // uv0
    buffer[dst + 8]  = uvs ? (uvs[vi * 2 + 0] ?? 0) : 0;
    buffer[dst + 9]  = uvs ? (uvs[vi * 2 + 1] ?? 0) : 0;
    // uv1
    buffer[dst + 10] = uv1s ? (uv1s[vi * 2 + 0] ?? 0) : 0;
    buffer[dst + 11] = uv1s ? (uv1s[vi * 2 + 1] ?? 0) : 0;

    // tangent (xyz + handedness) — transform xyz by normal matrix
    if (tangents) {
      const tx = tangents[vi * 4 + 0]!;
      const ty = tangents[vi * 4 + 1]!;
      const tz = tangents[vi * 4 + 2]!;
      const tw = tangents[vi * 4 + 3]!;
      const [wtx, wty, wtz] = transformDir(tx, ty, tz, normalMatrix);
      buffer[dst + 12] = wtx;
      buffer[dst + 13] = wty;
      buffer[dst + 14] = wtz;
      buffer[dst + 15] = tw;
    }

    // color (rgba)
    buffer[dst + 16] = colors ? (colors[vi * 4 + 0] ?? 1) : 1;
    buffer[dst + 17] = colors ? (colors[vi * 4 + 1] ?? 1) : 1;
    buffer[dst + 18] = colors ? (colors[vi * 4 + 2] ?? 1) : 1;
    buffer[dst + 19] = colors ? (colors[vi * 4 + 3] ?? 1) : 1;
  }

  return vertexCount;
}

// --- Material parsing ---

async function createMaterialData(
  material: unknown,
  ensureTexture: (tex: unknown, info: TextureInfo | null, cs: 'linear' | 'srgb') => Promise<number>,
): Promise<MaterialData> {
  const mat = new MaterialData();
  const m = material as any;
  mat.name = m.getName?.() ?? 'material';

  const baseColor = m.getBaseColorFactor?.() ?? [1, 1, 1, 1];
  mat.albedo = [baseColor[0], baseColor[1], baseColor[2]];

  const alphaMode = m.getAlphaMode?.() ?? 'OPAQUE';
  const baseAlpha = baseColor[3] ?? 1.0;
  mat.cutoutOpacity = alphaMode === 'OPAQUE' ? 1.0 : baseAlpha;
  mat.alphaCutoff   = alphaMode === 'MASK'   ? (m.getAlphaCutoff?.() ?? 0.5)
                    : alphaMode === 'OPAQUE'  ? 1.0 : 0.0;

  mat.metallic    = m.getMetallicFactor?.() ?? 0.0;
  mat.roughness   = m.getRoughnessFactor?.() ?? 1.0;
  mat.normalScale = m.getNormalScale?.() ?? 1.0;
  mat.emission    = m.getEmissiveFactor?.() ?? [0, 0, 0];
  mat.doubleSided = m.getDoubleSided?.() ? 1 : 0;

  mat.albedoTextureId = await ensureTexture(m.getBaseColorTexture?.() ?? null, m.getBaseColorTextureInfo?.() ?? null, 'srgb');
  mat.metallicRoughnessTextureId = await ensureTexture(m.getMetallicRoughnessTexture?.() ?? null, m.getMetallicRoughnessTextureInfo?.() ?? null, 'linear');
  mat.normalTextureId = await ensureTexture(m.getNormalTexture?.() ?? null, m.getNormalTextureInfo?.() ?? null, 'linear');
  mat.emissionTextureId = await ensureTexture(m.getEmissiveTexture?.() ?? null, m.getEmissiveTextureInfo?.() ?? null, 'srgb');

  // KHR_materials_emissive_strength
  const emissiveStrength = m.getExtension?.('KHR_materials_emissive_strength');
  if (emissiveStrength) {
    const s = emissiveStrength.getEmissiveStrength?.() ?? 1.0;
    mat.emission = mat.emission.map((c: number) => c * s);
  }

  // KHR_materials_ior
  const ior = m.getExtension?.('KHR_materials_ior');
  if (ior) mat.ior = ior.getIOR?.() ?? mat.ior;

  // KHR_materials_specular
  const specular = m.getExtension?.('KHR_materials_specular');
  if (specular) {
    mat.specular = specular.getSpecularFactor?.() ?? 1.0;
    mat.specularTint = specular.getSpecularColorFactor?.() ?? [1, 1, 1];
    mat.specularTextureId = await ensureTexture(specular.getSpecularTexture?.() ?? null, specular.getSpecularTextureInfo?.() ?? null, 'linear');
    mat.specularColorTextureId = await ensureTexture(specular.getSpecularColorTexture?.() ?? null, specular.getSpecularColorTextureInfo?.() ?? null, 'srgb');
  }

  // KHR_materials_transmission
  const transmission = m.getExtension?.('KHR_materials_transmission');
  if (transmission) {
    mat.transparency = transmission.getTransmissionFactor?.() ?? 0.0;
    mat.transmissionTextureId = await ensureTexture(transmission.getTransmissionTexture?.() ?? null, transmission.getTransmissionTextureInfo?.() ?? null, 'linear');
  }

  // KHR_materials_volume
  const volume = m.getExtension?.('KHR_materials_volume');
  if (volume) {
    const thickness = volume.getThicknessFactor?.() ?? 0;
    mat.thinWalled = thickness === 0 ? 1 : 0;
    mat.attenuationColor = volume.getAttenuationColor?.() ?? [1, 1, 1];
    const dist = volume.getAttenuationDistance?.();
    mat.attenuationDistance = !dist || dist === 0 ? Number.MAX_VALUE : dist;
  }

  // KHR_materials_clearcoat
  const clearcoat = m.getExtension?.('KHR_materials_clearcoat');
  if (clearcoat) {
    mat.clearcoat = clearcoat.getClearcoatFactor?.() ?? 0.0;
    mat.clearcoatRoughness = clearcoat.getClearcoatRoughnessFactor?.() ?? 0.0;
    mat.normalScaleClearcoat = clearcoat.getClearcoatNormalScale?.() ?? 1.0;
    mat.clearcoatTextureId = await ensureTexture(clearcoat.getClearcoatTexture?.() ?? null, clearcoat.getClearcoatTextureInfo?.() ?? null, 'linear');
    mat.clearcoatRoughnessTextureId = await ensureTexture(clearcoat.getClearcoatRoughnessTexture?.() ?? null, clearcoat.getClearcoatRoughnessTextureInfo?.() ?? null, 'linear');
    mat.clearcoatNormalTextureId = await ensureTexture(clearcoat.getClearcoatNormalTexture?.() ?? null, clearcoat.getClearcoatNormalTextureInfo?.() ?? null, 'linear');
  }

  // KHR_materials_sheen
  const sheen = m.getExtension?.('KHR_materials_sheen');
  if (sheen) {
    mat.sheenColor = sheen.getSheenColorFactor?.() ?? [0, 0, 0];
    mat.sheenRoughness = sheen.getSheenRoughnessFactor?.() ?? 0.0;
    mat.sheenColorTextureId = await ensureTexture(sheen.getSheenColorTexture?.() ?? null, sheen.getSheenColorTextureInfo?.() ?? null, 'srgb');
    mat.sheenRoughnessTextureId = await ensureTexture(sheen.getSheenRoughnessTexture?.() ?? null, sheen.getSheenRoughnessTextureInfo?.() ?? null, 'linear');
  }

  // KHR_materials_anisotropy
  const anisotropy = m.getExtension?.('KHR_materials_anisotropy');
  if (anisotropy) {
    const rotation = anisotropy.getAnisotropyRotation?.() ?? 0.0;
    mat.anisotropy = anisotropy.getAnisotropyStrength?.() ?? 0.0;
    mat.anisotropyDirection = [Math.cos(rotation), Math.sin(rotation), 0.0];
    mat.anisotropyTextureId = await ensureTexture(anisotropy.getAnisotropyTexture?.() ?? null, anisotropy.getAnisotropyTextureInfo?.() ?? null, 'linear');
  }

  // KHR_materials_iridescence
  const iridescence = m.getExtension?.('KHR_materials_iridescence');
  if (iridescence) {
    mat.iridescence = iridescence.getIridescenceFactor?.() ?? 0.0;
    mat.iridescenceIOR = iridescence.getIOR?.() ?? mat.iridescenceIOR;
    mat.iridescenceThicknessMinimum = iridescence.getIridescenceThicknessMinimum?.() ?? mat.iridescenceThicknessMinimum;
    mat.iridescenceThicknessMaximum = iridescence.getIridescenceThicknessMaximum?.() ?? mat.iridescenceThicknessMaximum;
    mat.iridescenceTextureId = await ensureTexture(iridescence.getIridescenceTexture?.() ?? null, iridescence.getIridescenceTextureInfo?.() ?? null, 'linear');
    mat.iridescenceThicknessTextureId = await ensureTexture(iridescence.getIridescenceThicknessTexture?.() ?? null, iridescence.getIridescenceThicknessTextureInfo?.() ?? null, 'linear');
  }

  // KHR_materials_diffuse_transmission (replaces legacy KHR_materials_translucency)
  const diffTrans = m.getExtension?.('KHR_materials_diffuse_transmission');
  if (diffTrans) {
    mat.translucency = diffTrans.getDiffuseTransmissionFactor?.() ?? 0.0;
    mat.translucencyColor = diffTrans.getDiffuseTransmissionColorFactor?.() ?? [1, 1, 1];
    mat.translucencyTextureId = await ensureTexture(diffTrans.getDiffuseTransmissionTexture?.() ?? null, diffTrans.getDiffuseTransmissionTextureInfo?.() ?? null, 'linear');
    mat.translucencyColorTextureId = await ensureTexture(diffTrans.getDiffuseTransmissionColorTexture?.() ?? null, diffTrans.getDiffuseTransmissionColorTextureInfo?.() ?? null, 'srgb');
  }

  mat.dirty = false;
  return mat;
}

// --- Texture helpers ---

const SUPPORTED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);

function toArrayBufferBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

async function createSceneTexture(
  texture: any,
  textureInfo: TextureInfo | null,
  colorSpace: 'linear' | 'srgb',
): Promise<SceneTextureLike> {
  const imageBytes = texture.getImage?.() as Uint8Array | undefined;
  const mimeType = texture.getMimeType?.() ?? '';
  if (!imageBytes || !SUPPORTED_MIME.has(mimeType)) {
    throw new Error(`Unsupported texture "${texture.getName?.() ?? ''}" (${mimeType || 'unknown mime'})`);
  }

  const blob = new Blob([toArrayBufferBytes(imageBytes)], { type: mimeType });
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, bitmap.width);
  canvas.height = Math.max(1, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const transform = textureInfo?.getExtension?.('KHR_texture_transform') as any;
  const offset = transform?.getOffset?.() ?? [0, 0];
  const scale  = transform?.getScale?.()  ?? [1, 1];
  const uvSet  = textureInfo?.getTexCoord?.() ?? 0;

  return {
    uuid: `${texture.getName?.() ?? texture.getURI?.() ?? 'tex'}:${mimeType}:${colorSpace}:${bitmap.width}x${bitmap.height}:${hashBytes(imageBytes)}`,
    image: canvas,
    colorSpace,
    offset: { x: offset[0] ?? 0, y: offset[1] ?? 0 },
    repeat: { x: scale[0] ?? 1, y: scale[1] ?? 1 },
    uvSet,
  };
}

function getTextureCacheKey(texture: any, textureInfo: TextureInfo | null, colorSpace: string): string {
  const bytes = texture.getImage?.() as Uint8Array | undefined;
  const id = `${texture.getName?.() ?? ''}:${texture.getMimeType?.() ?? ''}:${colorSpace}:${bytes ? hashBytes(bytes) : 'noimage'}`;
  const transform = textureInfo?.getExtension?.('KHR_texture_transform') as any;
  const offset = transform?.getOffset?.() ?? [0, 0];
  const scale = transform?.getScale?.() ?? [1, 1];
  const uvSet = textureInfo?.getTexCoord?.() ?? 0;
  return `${id}|uv=${uvSet}|off=${offset[0] ?? 0},${offset[1] ?? 0}|scale=${scale[0] ?? 1},${scale[1] ?? 1}`;
}

function hashBytes(bytes: Uint8Array): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]!; h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16);
}

// --- Math helpers ---

function identityMatrix(): Float32Array {
  const m = new Float32Array(16);
  m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
  return m;
}

function nodeToMatrix(node: any): Float32Array {
  const m = identityMatrix();
  const t = node.getTranslation?.() ?? [0, 0, 0];
  const r = node.getRotation?.() ?? [0, 0, 0, 1];
  const s = node.getScale?.() ?? [1, 1, 1];
  const [qx, qy, qz, qw] = r;
  const [sx, sy, sz] = s;
  const x2 = qx * 2, y2 = qy * 2, z2 = qz * 2;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;
  m[0] = (1 - (yy + zz)) * sx; m[1] = (xy + wz) * sx; m[2] = (xz - wy) * sx;
  m[4] = (xy - wz) * sy; m[5] = (1 - (xx + zz)) * sy; m[6] = (yz + wx) * sy;
  m[8] = (xz + wy) * sz; m[9] = (yz - wx) * sz; m[10] = (1 - (xx + yy)) * sz;
  m[12] = t[0]; m[13] = t[1]; m[14] = t[2]; m[15] = 1;
  return m;
}

function multiplyMat4(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[row + k * 4]! * b[k + col * 4]!;
      out[row + col * 4] = sum;
    }
  }
  return out;
}

function getNormalMatrix(worldMatrix: Float32Array): Float32Array {
  const e = worldMatrix;
  const a00 = e[0]!, a01 = e[4]!, a02 = e[8]!;
  const a10 = e[1]!, a11 = e[5]!, a12 = e[9]!;
  const a20 = e[2]!, a21 = e[6]!, a22 = e[10]!;
  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;
  let det = a00 * b01 + a01 * b11 + a02 * b21;
  if (Math.abs(det) <= 1e-12) return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  det = 1 / det;
  return new Float32Array([
    b01 * det, (-a22 * a01 + a02 * a21) * det, (a12 * a01 - a02 * a11) * det,
    b11 * det, (a22 * a00 - a02 * a20) * det, (-a12 * a00 + a02 * a10) * det,
    b21 * det, (-a21 * a00 + a01 * a20) * det, (a11 * a00 - a01 * a10) * det,
  ]);
}

function transformPoint(x: number, y: number, z: number, m: Float32Array): [number, number, number] {
  return [
    m[0]! * x + m[4]! * y + m[8]!  * z + m[12]!,
    m[1]! * x + m[5]! * y + m[9]!  * z + m[13]!,
    m[2]! * x + m[6]! * y + m[10]! * z + m[14]!,
  ];
}

function transformDir(x: number, y: number, z: number, n: Float32Array): [number, number, number] {
  const rx = n[0]! * x + n[3]! * y + n[6]! * z;
  const ry = n[1]! * x + n[4]! * y + n[7]! * z;
  const rz = n[2]! * x + n[5]! * y + n[8]! * z;
  const len = Math.sqrt(rx * rx + ry * ry + rz * rz);
  return len > 1e-8 ? [rx / len, ry / len, rz / len] : [rx, ry, rz];
}

function toFloat32(acc: Accessor): Float32Array {
  const a = acc.getArray();
  return a instanceof Float32Array ? new Float32Array(a) : new Float32Array(a as ArrayLike<number>);
}

function toUint32(acc: Accessor): Uint32Array {
  const a = acc.getArray();
  return a instanceof Uint32Array ? new Uint32Array(a) : Uint32Array.from(a as ArrayLike<number>);
}

function normalizeColors(acc: Accessor): Float32Array {
  const raw = toFloat32(acc);
  const stride = acc.getElementSize();
  if (stride === 4) return raw;
  const out = new Float32Array((raw.length / stride) * 4);
  for (let src = 0, dst = 0; src < raw.length; src += stride, dst += 4) {
    out[dst] = raw[src] ?? 1; out[dst + 1] = raw[src + 1] ?? 1;
    out[dst + 2] = raw[src + 2] ?? 1; out[dst + 3] = 1;
  }
  return out;
}
