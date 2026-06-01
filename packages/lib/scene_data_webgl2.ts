import * as glu from './gl_utils';
import { PathtracingSceneData } from './scene_data';

export class PathtracingSceneDataWebGL2 {
  private gl: WebGL2RenderingContext;
  private _sceneData: PathtracingSceneData;
  public get sceneData() { return this._sceneData; }

  private _triangleDataTexture?: WebGLTexture;
  public get triangleDataTexture() { return this._triangleDataTexture; }
  private _triangleIndexTexture?: WebGLTexture;
  public get triangleIndexTexture() { return this._triangleIndexTexture; }

  private _materialDataTexture?: WebGLTexture;
  public get materialDataTexture() { return this._materialDataTexture; }
  private _materialBufferShaderChunk: string = "";
  public get materialBufferShaderChunk() { return this._materialBufferShaderChunk; }

  private _textureInfoDataTexture?: WebGLTexture;
  public get textureInfoDataTexture() { return this._textureInfoDataTexture; }
  private _texAccessorShaderChunk: string = "";
  public get texAccessorShaderChunk() { return this._texAccessorShaderChunk; }

  private _texArrayTextures: { [k: string]: WebGLTexture | null } = {};
  public get texArrayTextures() { return this._texArrayTextures; }
  private _defaultTextureArray?: WebGLTexture;

  private _lightShaderChunk: string = "";
  public get lightShaderChunk() { return this._lightShaderChunk; }

  private _textureDataUsage = 0;
  private _geometryDataUsage = 0;
  public get memoryUsage() {
    return {
      textureBytes: this._textureDataUsage,
      geometryBytes: this._geometryDataUsage,
      totalBytes: this._textureDataUsage + this._geometryDataUsage,
    };
  }

  constructor(gl: WebGL2RenderingContext, sceneData: PathtracingSceneData) {
    this.gl = gl;
    this._sceneData = sceneData;
  }

  public clear() {
    const gl = this.gl;
    if (this._triangleDataTexture) gl.deleteTexture(this._triangleDataTexture);
    if (this._triangleIndexTexture) gl.deleteTexture(this._triangleIndexTexture);
    if (this._materialDataTexture) gl.deleteTexture(this._materialDataTexture);
    if (this._textureInfoDataTexture) gl.deleteTexture(this._textureInfoDataTexture);

    const deletedTextures = new Set<WebGLTexture>();
    for (let t in this._texArrayTextures) {
      const texture = this._texArrayTextures[t];
      if (texture && !deletedTextures.has(texture)) {
        gl.deleteTexture(texture);
        deletedTextures.add(texture);
      }
    }
    this._texArrayTextures = {};
    this._materialDataTexture = undefined;
    this._triangleDataTexture = undefined;
    this._triangleIndexTexture = undefined;
    this._textureInfoDataTexture = undefined;
    this._defaultTextureArray = undefined;
    this._materialBufferShaderChunk = "";
    this._texAccessorShaderChunk = "";
    this._lightShaderChunk = "";
    this._textureDataUsage = 0;
    this._geometryDataUsage = 0;
  }

  public init() {
    const start = performance.now();
    const gl = this.gl;
    this.clear();

    this._triangleDataTexture = glu.createDataTexture(gl, this._sceneData.vertexBuffer!);
    this._triangleIndexTexture = this.createIndexTexture(this._sceneData.triangleIndexBuffer!);

    this.generateTextureArrays();
    this.generateMaterialDataTexture()
    this.generateLightBuffers();

    const generateMs = performance.now() - start;

    this._geometryDataUsage = (
      this._sceneData!.vertexBuffer!.byteLength +
      this._sceneData!.triangleIndexBuffer!.byteLength
    );
    const textureUsage = this._textureDataUsage! / (1024 * 1024);
    const geometryUsage = this._geometryDataUsage / (1024 * 1024);
    console.log(`Generate gpu data buffers: ${generateMs.toFixed(1)}ms
GPU Memory Consumption (MB):
    Texture: ${textureUsage.toFixed(2)}
    Geometry: ${geometryUsage.toFixed(2)}
    Total:    ${(textureUsage + geometryUsage).toFixed(2)}
    `);
  }

  private createIndexTexture(data: Uint32Array) {
    const gl = this.gl;
    const maxSize = glu.getMaxTextureSize(gl);
    const indexCount = Math.max(1, data.length);
    const width = Math.min(indexCount, maxSize);
    const height = Math.max(1, Math.ceil(data.length / maxSize));
    const padded = width * height > data.length
      ? (() => { const p = new Int32Array(width * height); p.set(data); return p; })()
      : new Int32Array(data.buffer, data.byteOffset, data.length);

    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32I, width, height, 0, gl.RED_INTEGER, gl.INT, padded);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  public updateMaterial(idx: number) {
    if (idx < 0 || idx >= this._sceneData.materials.length) return;
    this.uploadMaterialDataTexture();
  }

  private uploadFloatDataTexture(texture: WebGLTexture, data: Float32Array) {
    const gl = this.gl;
    const maxSize = glu.getMaxTextureSize(gl);
    const numBlocks = Math.max(1, (data.length / 4) | 0);
    const width = Math.min(numBlocks, maxSize);
    const height = Math.max(1, Math.ceil(numBlocks / maxSize));
    const paddedLen = width * height * 4;
    const upload = paddedLen > data.length
      ? (() => { const p = new Float32Array(paddedLen); p.set(data); return p; })()
      : data;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, upload);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  private uploadMaterialDataTexture() {
    if (!this._materialDataTexture) return;
    const materialData = this._sceneData.num_materials > 0
      ? this._sceneData.getFlatMaterialBuffer()
      : new Float32Array(68);
    this.uploadFloatDataTexture(this._materialDataTexture, materialData);
  }

  private generateMaterialDataTexture() {
    const gl = this.gl;
    this._materialDataTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this._materialDataTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.uploadMaterialDataTexture();

    this._materialBufferShaderChunk += `
    uniform sampler2D u_sampler_material_data;

    vec4 fetch_material_data(uint matIdx, uint slot) {
      uint texel = matIdx * 17u + slot;
      return texelFetch(u_sampler_material_data, ivec2(int(texel % MAX_TEXTURE_SIZE), int(texel / MAX_TEXTURE_SIZE)), 0);
    }

    MaterialData get_material(uint idx) {
      MaterialData data;
      vec4 m0 = fetch_material_data(idx, 0u);
      vec4 m1 = fetch_material_data(idx, 1u);
      vec4 m2 = fetch_material_data(idx, 2u);
      vec4 m3 = fetch_material_data(idx, 3u);
      vec4 m4 = fetch_material_data(idx, 4u);
      vec4 m5 = fetch_material_data(idx, 5u);
      vec4 m6 = fetch_material_data(idx, 6u);
      vec4 m7 = fetch_material_data(idx, 7u);
      vec4 m8 = fetch_material_data(idx, 8u);
      vec4 m9 = fetch_material_data(idx, 9u);
      vec4 m10 = fetch_material_data(idx, 10u);
      vec4 m11 = fetch_material_data(idx, 11u);
      vec4 m12 = fetch_material_data(idx, 12u);
      vec4 m13 = fetch_material_data(idx, 13u);
      vec4 m14 = fetch_material_data(idx, 14u);
      vec4 m15 = fetch_material_data(idx, 15u);
      vec4 m16 = fetch_material_data(idx, 16u);

      data.albedo = m0.xyz; data.metallic = m0.w;
      data.roughness = m1.x; data.anisotropy = m1.y; data.anisotropyRotation = m1.z; data.transparency = m1.w;
      data.cutoutOpacity = m2.x; data.doubleSided = m2.y > 0.5; data.normalScale = m2.z; data.ior = m2.w;
      data.specularTint = m3.xyz; data.specular = m3.w;
      data.sheenColor = m4.xyz; data.sheenRoughness = m4.w;
      data.emission = m5.xyz; data.normalScaleClearcoat = m5.w;
      data.clearcoat = m6.x; data.clearcoatRoughness = m6.y; data.translucency = m6.z; data.alphaCutoff = m6.w;
      data.attenuationColor = m7.xyz; data.attenuationDistance = m7.w;
      data.subsurfaceColor = m8.xyz; data.thinWalled = m8.w > 0.5;
      data.anisotropyDirection = m9.xyz; data.translucencyTextureId = m9.w;
      data.iridescence = m10.x; data.iridescenceIor = m10.y; data.iridescenceThicknessMinimum = m10.z; data.iridescenceThicknessMaximum = m10.w;
      data.albedoTextureId = m11.x; data.metallicRoughnessTextureId = m11.y; data.normalTextureId = m11.z; data.emissionTextureId = m11.w;
      data.specularTextureId = m12.x; data.specularColorTextureId = m12.y; data.transmissionTextureId = m12.z; data.clearcoatTextureId = m12.w;
      data.clearcoatRoughnessTextureId = m13.x; data.clearcoatNormalTextureId = m13.y; data.sheenColorTextureId = m13.z; data.sheenRoughnessTextureId = m13.w;
      data.anisotropyTextureId = m14.x; data.anisotropyDirectionTextureId = m14.y; data.iridescenceTextureId = m14.z; data.iridescenceThicknessTextureId = m14.w;
      data.translucencyColor = m15.xyz; data.translucencyColorTextureId = m15.w;
      data.dispersion = m16.x;
      return data;
    }
    `;
  }

  private createDefaultTextureArray() {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]));
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    return tex;
  }

  private materialTextureArrayCapacity() {
    const maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS) as number;
    // Path tracing pass uses 6 static data textures, 5 IBL textures, and 1 previous-frame texture.
    return Math.max(1, maxTextureUnits - 12);
  }

  private generateTextureArrays() {
    const gl = this.gl;
    const texArrays = this._sceneData.texArrays;

    const getImageData = (image: CanvasImageSource) => {
      const w = (image as HTMLCanvasElement).width;
      const h = (image as HTMLCanvasElement).height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Couldn't get 2D context for texture");
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, w, h);
    };

    this._defaultTextureArray = this.createDefaultTextureArray();

    const textureArrayCapacity = this.materialTextureArrayCapacity();
    if (texArrays.size > textureArrayCapacity) {
      throw new Error(`Scene uses ${texArrays.size} material texture arrays, but this WebGL context supports ${textureArrayCapacity}`);
    }

    for (let i = 0; i < textureArrayCapacity; i++) {
      this._texArrayTextures[`u_sampler2DArray_MaterialTextures_${i}`] = this._defaultTextureArray;
      this._texAccessorShaderChunk += `
      uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};
      `;
    }

    let i = 0;
    for (const textureList of texArrays.values()) {
      const firstImage = textureList[0]!.image as HTMLCanvasElement;
      const width = firstImage.width;
      const height = firstImage.height;
      const texSize = width * height * 4;
      let data = new Uint8Array(texSize * textureList.length);

      this._textureDataUsage += data.length;

      data.set(getImageData(textureList[0]!.image as CanvasImageSource).data);
      for (let t = 1; t < textureList.length; t++) {
        data.set(getImageData(textureList[t]!.image as CanvasImageSource).data, texSize * t);
      }

      let texArray = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArray);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);

      gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        width,
        height,
        textureList.length,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

      console.log(`Create material texture array: ${width} x ${height} x ${textureList.length}`)

      this._texArrayTextures[`u_sampler2DArray_MaterialTextures_${i}`] = texArray;

      i++;
    }

    this._textureInfoDataTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this._textureInfoDataTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    const texInfoListFlat = this._sceneData.num_textures > 0
      ? this._sceneData.getFlatTextureInfoBuffer()
      : new Float32Array([0, 0, 255, 255, 1, 1, 255, 0]);
    this.uploadFloatDataTexture(this._textureInfoDataTexture, texInfoListFlat);

    this._texAccessorShaderChunk += `
    uniform sampler2D u_sampler_texture_info;

    TexInfo get_texture_info(int idx) {
      int texel = idx * 2;
      vec4 t0 = texelFetch(u_sampler_texture_info, ivec2(texel % int(MAX_TEXTURE_SIZE), texel / int(MAX_TEXTURE_SIZE)), 0);
      vec4 t1 = texelFetch(u_sampler_texture_info, ivec2((texel + 1) % int(MAX_TEXTURE_SIZE), (texel + 1) / int(MAX_TEXTURE_SIZE)), 0);
      TexInfo info;
      info.offset = t0.xy;
      info.tex_array_idx = t0.z;
      info.tex_idx = t0.w;
      info.scale = t1.xy;
      info.uv_set = t1.z;
      info.pad = t1.w;
      return info;
    }
    `;

    this._texAccessorShaderChunk += `
    vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) {
    `;

    for (let i = 0; i < textureArrayCapacity; i++) {
      this._texAccessorShaderChunk += `
      if(int(texInfo.tex_array_idx) == ${i}) {
        vec2 tuv = texCoord * texInfo.scale + texInfo.offset;
        return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.tex_idx));
      }`;
    }

    this._texAccessorShaderChunk += `
      return vec4(1.0);
    }`

    this._texAccessorShaderChunk += `
    vec4 get_texture_value(float tex_info_id, vec2 uv) {
      return tex_info_id < 0.0 ? vec4(1,1,1,1) : evaluateMaterialTextureValue(get_texture_info(int(tex_info_id)), uv);
    }

    vec4 get_texture_value(float tex_info_id, vec2 uv0, vec2 uv1) {
      if (tex_info_id < 0.0) return vec4(1,1,1,1);
      TexInfo info = get_texture_info(int(tex_info_id));
      vec2 uv = info.uv_set > 0.5 ? uv1 : uv0;
      return evaluateMaterialTextureValue(info, uv);
    }
    `;
  }

  private generateLightBuffers() {
    const lights = this._sceneData.lights;
    this._lightShaderChunk = "";
  }
}
