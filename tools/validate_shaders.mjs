import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shaderRoot = path.join(root, 'packages/lib/shader');
const outDir = mkdtempSync(path.join(tmpdir(), 'dspbr-pt-shader-validation-'));

const readShader = relativePath => readFileSync(path.join(shaderRoot, relativePath), 'utf8');

function buildCommonChunks(materialProfile) {
  return {
  structs: readShader('structs.glsl'),
  rng: readShader('rng.glsl'),
  constants: readShader('constants.glsl'),
  lights: '',
  utils: readShader('utils.glsl'),
  material: readShader('material.glsl'),
  buffer_accessor: `
const uint MAX_TEXTURE_SIZE = 4096u;
ivec2 getStructParameterTexCoord(uint structIdx, uint paramIdx, uint structStride) {
  return ivec2((structIdx * structStride + paramIdx) % MAX_TEXTURE_SIZE,
               (structIdx * structStride + paramIdx) / MAX_TEXTURE_SIZE);
}
`,
  texture_accessor: `
uniform sampler2D u_sampler_texture_info;
TexInfo get_texture_info(int idx) {
  TexInfo info;
  info.offset = vec2(0.0);
  info.tex_array_idx = 255.0;
  info.tex_idx = 255.0;
  info.scale = vec2(1.0);
  info.uv_set = 0.0;
  info.pad = 0.0;
  return info;
}
vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) {
  return vec4(1.0);
}
vec4 get_texture_value(float tex_info_id, vec2 uv) {
  return vec4(1.0);
}
vec4 get_texture_value(float tex_info_id, vec2 uv0, vec2 uv1) {
  return vec4(1.0);
}
`,
  material_block: `
uniform sampler2D u_sampler_material_data;
vec4 fetch_material_data(uint matIdx, uint slot) {
  return vec4(0.0);
}
MaterialData get_material(uint idx) {
  MaterialData data;
  data.baseColorFactor = vec3(1.0);
  data.metallicFactor = 0.0;
  data.roughnessFactor = 0.5;
  data.anisotropy = 0.0;
  data.anisotropyRotation = 0.0;
  data.transmissionFactor = 0.0;
  data.cutoutOpacity = 1.0;
  data.doubleSided = true;
  data.normalScale = 1.0;
  data.ior = 1.5;
  data.specularColorFactor = vec3(1.0);
  data.specularFactor = 1.0;
  data.sheenColorFactor = vec3(0.0);
  data.sheenRoughnessFactor = 0.0;
  data.emissiveFactor = vec3(0.0);
  data.clearcoatNormalTextureScale = 1.0;
  data.clearcoatFactor = 0.0;
  data.clearcoatRoughnessFactor = 0.0;
  data.diffuseTransmissionFactor = 0.0;
  data.alphaCutoff = 1.0;
  data.attenuationColor = vec3(1.0);
  data.attenuationDistance = 0.0;
  data.multiscatterColorFactor = vec3(1.0);
  data.thinWalled = false;
  data.anisotropyDirection = vec3(1.0, 0.0, 0.0);
  data.diffuseTransmissionTextureId = -1.0;
  data.iridescenceFactor = 0.0;
  data.iridescenceIor = 1.3;
  data.iridescenceThicknessMinimum = 100.0;
  data.iridescenceThicknessMaximum = 400.0;
  data.baseColorTextureId = -1.0;
  data.metallicRoughnessTextureId = -1.0;
  data.normalTextureId = -1.0;
  data.emissiveTextureId = -1.0;
  data.specularTextureId = -1.0;
  data.specularColorTextureId = -1.0;
  data.transmissionTextureId = -1.0;
  data.clearcoatTextureId = -1.0;
  data.clearcoatRoughnessTextureId = -1.0;
  data.clearcoatNormalTextureId = -1.0;
  data.sheenColorTextureId = -1.0;
  data.sheenRoughnessTextureId = -1.0;
  data.anisotropyTextureId = -1.0;
  data.anisotropyDirectionTextureId = -1.0;
  data.iridescenceTextureId = -1.0;
  data.iridescenceThicknessTextureId = -1.0;
  data.diffuseTransmissionColorFactor = vec3(1.0);
  data.diffuseTransmissionColorTextureId = -1.0;
  data.dispersion = 0.0;
  return data;
}
`,
  pbr_kernel: readShader(`generated/slang_materials/${materialProfile}/material_kernel.glsl`),
  pbr_material_adapter: readShader('pbr_material_adapter.glsl'),
  bvh: readShader('bvh.glsl'),
  lighting: readShader('lighting.glsl'),
  mesh_constants: `
const uint VERTEX_STRIDE = 5u;
const uint TRIANGLE_INDEX_STRIDE = 3u;
const uint POSITION_OFFSET = 0u;
const uint NORMAL_OFFSET = 1u;
const uint UV_OFFSET = 2u;
const uint TANGENT_OFFSET = 3u;
const uint COLOR_OFFSET = 4u;
#define NUM_TRIANGLES uint(u_scene_counts.x)
#define NUM_BVH_NODES int(u_scene_counts.y)
#define NUM_BVH_INDICES int(u_scene_counts.z)
`,
  };
}

const variants = [
  {
    name: 'debug',
    profile: 'webgl-lean',
    chunks: {
      ...buildCommonChunks('webgl-lean'),
      integrator: readShader('integrator/debug.glsl'),
    },
  },
  {
    name: 'misptdl',
    profile: 'webgl-lean',
    chunks: {
      ...buildCommonChunks('webgl-lean'),
      integrator: readShader('integrator/misptdl.glsl'),
    },
  },
  {
    name: 'debug-full',
    profile: 'webgl-full',
    chunks: {
      ...buildCommonChunks('webgl-full'),
      integrator: readShader('integrator/debug.glsl'),
    },
  },
  {
    name: 'misptdl-full',
    profile: 'webgl-full',
    chunks: {
      ...buildCommonChunks('webgl-full'),
      integrator: readShader('integrator/misptdl.glsl'),
    },
  },
];

function assembleFragmentShader(chunks) {
  let source = readShader('renderer.frag');
  for (const [id, chunk] of Object.entries(chunks)) {
    source = source.replace(`#include <${id}>`, chunk);
  }
  return source;
}

for (const variant of variants) {
  const outPath = path.join(outDir, `${variant.name}.frag`);
  writeFileSync(outPath, assembleFragmentShader(variant.chunks));
  const result = spawnSync('glslangValidator', ['--glsl-version', '300es', '-S', 'frag', outPath], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  console.log(`Validated ${variant.name} shader`);
}
