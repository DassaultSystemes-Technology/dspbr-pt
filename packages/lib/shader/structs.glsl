

struct MaterialData {
  vec3 baseColorFactor; // 0
  float metallicFactor; // 3

  float roughnessFactor; //4
  float anisotropy;
  float anisotropyRotation;
  float transmissionFactor;

  float cutoutOpacity; // 8
  bool doubleSided;
  float normalScale;
  float ior;

  vec3 specularColorFactor; // 12
  float specularFactor; // 15

  vec3 sheenColorFactor; // 16
  float sheenRoughnessFactor; // 19

  vec3 emissiveFactor; // 20
  float clearcoatNormalTextureScale; // 23

  float clearcoatFactor; // 24
  float clearcoatRoughnessFactor;
  float diffuseTransmissionFactor;
  float alphaCutoff;

  vec3 attenuationColor; // 28
  float attenuationDistance; // 31

  vec3 multiscatterColorFactor; // 32
  bool thinWalled; // 35

  vec3 anisotropyDirection; // 36
  float diffuseTransmissionTextureId; // 39

  // 11
  float iridescenceFactor; // 40
  float iridescenceIor;
  float iridescenceThicknessMinimum;
  float iridescenceThicknessMaximum;

  float baseColorTextureId; //44
  float metallicRoughnessTextureId;
  float normalTextureId;
  float emissiveTextureId;

  float specularTextureId; //48
  float specularColorTextureId;
  float transmissionTextureId;
  float clearcoatTextureId;

  float clearcoatRoughnessTextureId; //52
  float clearcoatNormalTextureId;
  float sheenColorTextureId;
  float sheenRoughnessTextureId;

  float anisotropyTextureId; // 56
  float anisotropyDirectionTextureId;
  float iridescenceTextureId;
  float iridescenceThicknessTextureId;

  vec3 diffuseTransmissionColorFactor; // 60
  float diffuseTransmissionColorTextureId;

  float dispersion; // 64
};

struct TexInfo {
  vec2 offset;
  float tex_array_idx;
  float tex_idx;
  vec2 scale;
  float uv_set;
  float pad;
};


struct MaterialClosure {
  PbrGltfMaterial material;
  float cutout_opacity;
  bool thin_walled;
  bool double_sided;
  bool backside;
  vec3 n;
  vec3 ng;
  vec4 t;
  int event_type;
  vec3 anisotropyTangent;
};

struct RenderState {
  vec3 hitPos;
  vec3 n;
  vec3 ng;
  vec4 tangent;
  vec3 wo;
  vec3 wi;
  vec2 uv0;
  vec2 uv1;
  MaterialClosure closure;
};


// struct Light {
//     vec3 position;
//     float type;
//     vec3 emission;
//     float pad;
// };
// void unpackLightData(uint lightIdx, out Light light) {
//     vec4 val;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 0u, LIGHT_SIZE),
//     0); light.position = val.xyz; light.type = val.w; val = texelFetch(u_sampler2D_LightData,
//     getStructParameterTexCoord(lightIdx, 1u, LIGHT_SIZE), 0); light.emission = val.xyz;
// }
