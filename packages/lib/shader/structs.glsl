

struct MaterialData {
  vec3 albedo; // 0
  float metallic; // 3

  float roughness; //4
  float anisotropy;
  float anisotropyRotation;
  float transparency;

  float cutoutOpacity; // 8
  bool doubleSided;
  float normalScale;
  float ior;

  vec3 specularTint; // 12
  float specular; // 15

  vec3 sheenColor; // 16
  float sheenRoughness; // 19

  vec3 emission; // 20
  float normalScaleClearcoat; // 23

  float clearcoat; // 24
  float clearcoatRoughness;
  float translucency;
  float alphaCutoff;

  vec3 attenuationColor; // 28
  float attenuationDistance; // 31

  vec3 subsurfaceColor; // 32
  bool thinWalled; // 35

  vec3 anisotropyDirection; // 36
  float pad; // 39

  // 11
  float iridescence; // 40
  float iridescenceIor;
  float iridescenceThicknessMinimum;
  float iridescenceThicknessMaximum;

  float albedoTextureId; //44
  float metallicRoughnessTextureId;
  float normalTextureId;
  float emissionTextureId;

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
  vec3 albedo;
  float transparency;
  float translucency;
  float cutout_opacity;
  float metallic;
  float specular;
  float f0;
  vec3 specular_f0;
  vec3 specular_f90;
  vec3 specular_tint;
  vec3 emission;
  vec3 normal;
  float sheen_roughness;
  vec3 sheen_color;
  vec2 alpha;
  float clearcoat;
  float clearcoat_alpha;
  bool thin_walled;
  bool double_sided;
  float attenuationDistance;
  vec3 attenuationColor;
  float ior;
  bool backside;
  vec3 n;
  vec3 ng;
  vec4 t;
  int event_type;
  float bsdf_selection_pdf;
  float iridescence;
  float iridescence_ior;
  float iridescence_thickness;
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
