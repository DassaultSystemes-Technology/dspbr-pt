/* @license
 * Copyright 2020  Dassault Systemes - All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const int E_DIFFUSE = 1 << 0;
const int E_SINGULAR = 1 << 1;
const int E_REFLECTION = 1 << 2;
const int E_TRANSMISSION = 1 << 3;
const int E_COATING = 1 << 4;
const int E_STRAIGHT = 1 << 5;


// Convert from roughness and anisotropy to 2d anisotropy.
vec2 roughness_conversion(float roughness, float anisotropy) {
  vec2 a = vec2(roughness * (1.0 + anisotropy), roughness * (1.0 - anisotropy));
  return max(a * a, vec2(MINIMUM_ROUGHNESS));
}

vec4 get_texture_value(float tex_info_id, vec2 uv) {
  return tex_info_id < 0.0 ? vec4(1,1,1,1) : evaluateMaterialTextureValue(u_tex_infos[int(tex_info_id)], uv);
}

void configure_material(const in uint matIdx, in RenderState rs, out MaterialClosure c, vec4 vertexColor) {
  vec2 uv = rs.uv0;

  MaterialData matData = get_material(matIdx);

  vec4 albedo = get_texture_value(matData.albedoTextureId, uv);
  c.albedo = matData.albedo * to_linear_rgb(albedo.xyz);
  float opacity = albedo.w;

  if (length(vertexColor) > 0.0) {
    c.albedo *= vertexColor.xyz;
    opacity *= vertexColor.w;
  }

  c.cutout_opacity = matData.cutoutOpacity * opacity;
  if (matData.alphaCutoff > 0.0) { // MASK
    c.cutout_opacity = step(matData.alphaCutoff, c.cutout_opacity);
  }
  if (matData.alphaCutoff == 1.0) { // OPAQUE
    c.cutout_opacity = 1.0;
  }

  vec4 transmission = get_texture_value(matData.transmissionTextureId, uv);
  c.transparency = matData.transparency * transmission.x;

  c.translucency = matData.translucency;

  c.thin_walled = matData.thinWalled;
  c.ior = matData.ior;

  c.double_sided = matData.doubleSided;

  vec4 occlusionRoughnessMetallic = get_texture_value(matData.metallicRoughnessTextureId, uv);
  c.metallic = matData.metallic * occlusionRoughnessMetallic.z;
  float roughness = matData.roughness * occlusionRoughnessMetallic.y;

  float anisotropy = get_texture_value(matData.anisotropyTextureId, uv).x * 2.0 - 1.0;
  c.alpha = roughness_conversion(roughness, matData.anisotropy * anisotropy);

  vec4 specularColor = get_texture_value(matData.specularColorTextureId, rs.uv0);
  c.specular_tint = matData.specularTint * pow(specularColor.rgb, vec3(2.2));
  vec4 specular = get_texture_value(matData.specularTextureId, rs.uv0);
  c.specular = matData.specular * specular.a;

  vec4 sheenColor = get_texture_value(matData.sheenColorTextureId, rs.uv0);
  vec4 sheenRoughness = get_texture_value(matData.sheenRoughnessTextureId, rs.uv0);
  c.sheen_roughness = matData.sheenRoughness * sheenRoughness.x;
  c.sheen_color = matData.sheenColor * sheenColor.xyz;

  c.n = rs.n;
  c.ng = rs.ng;
  c.t = vec4(rs.tangent.xyz, rs.tangent.w);

  if (matData.normalTextureId >= 0.0) {
    mat3 to_world = get_onb(c.n, c.t.xyz);
    vec3 n = normalize(get_texture_value(matData.normalTextureId, uv).xyz * 2.0 - vec3(1.0));
    n = normalize(n * vec3(matData.normalScale, matData.normalScale, 1.0));
    c.n = to_world * n;

    // ensure orthonormal tangent after changing normal
    vec3 b = normalize(cross(c.n, c.t.xyz)) * c.t.w;
    c.t.xyz = cross(b, c.n);
  }

  // ensure n and ng point into the same hemisphere as wi
  // remember whether we hit from backside
  vec3 wi = rs.wi;
  c.backside = fix_normals(c.n, c.ng, wi);

  vec3 ansiotropyDirection = matData.anisotropyDirection;
  if(matData.anisotropyDirectionTextureId >= 0.0)
    ansiotropyDirection = get_texture_value(matData.anisotropyDirectionTextureId, uv).xyz * 2.0 - vec3(1);
  ansiotropyDirection.z = 0.0;

  float anisotropyRotation = atan(ansiotropyDirection.y, ansiotropyDirection.x) + PI;
  c.t = rotation_to_tangent(anisotropyRotation, c.n, c.t);

  if (c.backside) {
    c.f0 = ((1.0 - c.ior) / (1.0 + c.ior)) * ((1.0 - c.ior) / (1.0 + c.ior));
  } else {
    c.f0 = ((c.ior - 1.0) / (c.ior + 1.0)) * ((c.ior - 1.0) / (c.ior + 1.0));
  }
  c.specular_f0 = (1.0 - c.metallic) * c.specular * c.f0 * c.specular_tint + c.metallic * c.albedo;
  c.specular_f90 = vec3((1.0 - c.metallic) * c.specular + c.metallic);

  vec3 emission = get_texture_value(matData.emissionTextureId, uv).xyz;
  c.emission = matData.emission.xyz * to_linear_rgb(emission);

  vec4 clearcoat = get_texture_value(matData.clearcoatTextureId, uv);
  c.clearcoat = matData.clearcoat * clearcoat.y;
  vec4 clearcoatRoughness = get_texture_value(matData.clearcoatRoughnessTextureId, uv);
  float clearcoat_alpha =
      matData.clearcoatRoughness * matData.clearcoatRoughness * clearcoatRoughness.x * clearcoatRoughness.x;
  c.clearcoat_alpha = max(clearcoat_alpha, MINIMUM_ROUGHNESS);

  c.attenuationColor =  matData.attenuationColor;
  c.attenuationDistance = matData.attenuationDistance;

  c.iridescence = matData.iridescence * get_texture_value(matData.iridescenceTextureId, uv).x;
  c.iridescence_ior = matData.iridescenceIor;
  c.iridescence_thickness = mix(matData.iridescenceThicknessMinimum, matData.iridescenceThicknessMaximum, get_texture_value(matData.iridescenceThicknessTextureId, uv).y);
}
