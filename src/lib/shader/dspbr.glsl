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

uniform int u_int_SheenG;

const int E_REFLECTION_DIFFUSE = 1 << 0;  // Lambert
const int E_REFLECTION_GLOSSY = 1 << 1;   // Microfacet 
const int E_REFLECTION_SINGULAR = 1 << 2; // Singular reflection and microfacet 

const int E_TRANSMISSION_DIFFUSE = 1 << 3;  // Translucency
const int E_TRANSMISSION_GLOSSY = 1 << 4;   // Thin and Volumetric Microfacet 
const int E_TRANSMISSION_SINGULAR = 1 << 5; // Volumetric Microfacet
const int E_TRANSMISSION_STRAIGHT =
    1 << 6; // Thin Microfacet, Volumetric Microfacet with alpha == MINIMUM_ROUGHNESS and IOR=1 (no refraction)

const int E_REFLECTION = E_REFLECTION_DIFFUSE | E_REFLECTION_GLOSSY | E_REFLECTION_SINGULAR;
const int E_TRANSMISSION =
    E_TRANSMISSION_DIFFUSE | E_TRANSMISSION_GLOSSY | E_TRANSMISSION_SINGULAR | E_TRANSMISSION_STRAIGHT;

const int E_DIFFUSE = E_REFLECTION_DIFFUSE | E_TRANSMISSION_DIFFUSE;
const int E_GLOSSY = E_REFLECTION_GLOSSY | E_TRANSMISSION_GLOSSY;
const int E_SINGULAR = E_REFLECTION_SINGULAR | E_TRANSMISSION_SINGULAR;
const int E_STRAIGHT = E_TRANSMISSION_STRAIGHT;

vec3 fresnel_schlick(vec3 f0, vec3 f90, float theta) {
  return f0 + (f90 - f0) * pow(abs(1.0 - theta), 5.0);
}

float fresnel_schlick(float f0, float f90, float theta) {
  return f0 + (f90 - f0) * pow(abs(1.0 - theta), 5.0);
}

vec3 fresnel_schlick_dielectric(float cos_theta, vec3 f0, vec3 f90, float ni, float nt, bool thin_walled) {
  bool tir = false;
  if (ni > nt && !thin_walled) {
    float inv_eta = ni / nt;
    float sin_theta2 = sqr(inv_eta) * (1.0 - sqr(cos_theta));
    if (sin_theta2 >= 1.0) {
      // return vec3(1.0); // TIR
      tir = true;
    }
    //     // https://seblagarde.wordpress.com/2013/04/29/memo-on-fresnel-equations/,
    cos_theta = sqrt(1.0 - sin_theta2);
  }

  return tir ? vec3(1.0) : fresnel_schlick(f0, f90, cos_theta);
}

// Eric Heitz. Understanding the Masking-Shadowing Function in Microfacet-Based
// BRDFs. Journal of Computer Graphics TechniquesVol. 3, No. 2, 2014
// http://jcgt.org/published/0003/02/03/paper.pdf

// Roughness projected onto the outgoing direction - eq. 80
float projected_roughness(vec2 alpha, vec3 w, Geometry g) {
  float sin_theta_2 = 1.0 - sqr(dot(w, g.n));
  float inv_sin_theta_2 = 1.0 / sin_theta_2;
  float cos_phi_2 = sqr(dot(w, g.t)) * inv_sin_theta_2;
  float sin_phi_2 = sqr(dot(w, g.b)) * inv_sin_theta_2;

  return sqrt(cos_phi_2 * sqr(alpha.x) + sin_phi_2 * sqr(alpha.y));
}

// eq. 86
float ggx_smith_lambda(vec2 alpha, vec3 w, Geometry g) {
  float sin_theta_2 = 1.0 - sqr(dot(w, g.n));

  if (sin_theta_2 < EPSILON) {
    return 0.0;
  }

  float alpha_w = projected_roughness(alpha, w, g);

  float tan_theta = sqrt(sin_theta_2) / abs(dot(w, g.n));
  float a = 1.0 / (alpha_w * tan_theta);

  return 0.5 * (-1.0 + sqrt(1.0 + 1.0 / sqr(a)));
}

// Generalized form of the Smith masking function eq. 43
float ggx_smith_g1(vec2 alpha, vec3 w, vec3 wh, Geometry g) {
  // if (dot(w, wh) < 0.0) {
  //   return 0.0;
  // }

  return 1.0 / (1.0 + ggx_smith_lambda(alpha, w, g));
}

// Height-Correlated Masking and Shadowing - eq. 99
float ggx_smith_g2(vec2 alpha, vec3 wi, vec3 wo, vec3 wh, Geometry g, bool transmit) {
  if (transmit) {
    wo = -wo;
  }

  if (dot(wo, wh) * dot(wi, wh) < 0.0) {
    return 0.0;
  }

  float lambda_wi = ggx_smith_lambda(alpha, wi, g);
  float lambda_wo = ggx_smith_lambda(alpha, wo, g);

  return 1.0 / (1.0 + lambda_wi + lambda_wo);
}

// Anisotropic GGX distribution, eq. 85
float ggx_eval(vec2 alpha, vec3 wh, Geometry g) {
  float cos_theta = dot(wh, g.n);
  if (cos_theta < EPS_COS) {
    return 0.0;
  }

  float cos_theta_2 = sqr(cos_theta);
  float cos_theta_4 = sqr(cos_theta_2);
  float sin_theta_2 = 1.0 - cos_theta_2;
  float tan_theta_2 = sqr(sqrt(sin_theta_2) / cos_theta);

  if (sin_theta_2 < EPSILON) {
    // avoid 0 * inf
    return 1.0 / (PI * alpha.x * alpha.y * cos_theta_4);
  }

  float inv_sin_theta_2 = 1.0 / sin_theta_2;
  float cos_phi_2 = sqr(dot(wh, g.t)) * inv_sin_theta_2;
  float sin_phi_2 = sqr(dot(wh, g.b)) * inv_sin_theta_2;

  return 1.0 / (PI * alpha.x * alpha.y * cos_theta_4 *
                sqr(1.0 + tan_theta_2 * (cos_phi_2 / sqr(alpha.x) + sin_phi_2 / sqr(alpha.y))));
}

// GGX distribution of visible normals, eq. 16
// http://www.jcgt.org/published/0007/04/01/paper.pdf
float ggx_eval_vndf(vec2 alpha, vec3 wi, vec3 wh, Geometry g) {
  float d = ggx_eval(alpha, wh, g);
  float g1 = ggx_smith_g1(alpha, wi, wh, g);
  return g1 * abs(dot(wi, wh)) * d / abs(dot(wi, g.n));
}

// Eric Heitz. A Simpler and Exact Sampling Routine for the GGX Distribution
// of Visible Normals. [Research Report] Unity Technologies. 2017.
// https://hal.archives-ouvertes.fr/hal-01509746/document
vec3 ggx_sample_vndf(vec2 alpha, vec3 wi_, vec2 uv) {
  // stretch view
  vec3 wi = normalize(vec3(alpha.x * wi_.x, alpha.y * wi_.y, wi_.z));
  // orthonormal basis
  vec3 t1 = (wi.z < 0.9999) ? normalize(cross(wi, vec3(0, 1, 0))) : vec3(1, 0, 0);
  vec3 t2 = cross(t1, wi);
  // sample point with polar coordinates (r, phi)
  float a = 1.0 / (1.0 + wi.z);
  float r = sqrt(uv.x);
  float phi = (uv.y < a) ? uv.y / a * PI : PI + (uv.y - a) / (1.0 - a) * PI;
  float p1 = r * cos(phi);
  float p2 = r * sin(phi) * ((uv.y < a) ? 1.0 : wi.z);
  // compute normal
  vec3 wh = p1 * t1 + p2 * t2 + sqrt(max(0.0, 1.0 - p1 * p1 - p2 * p2)) * wi;
  // unstretch
  wh.x *= alpha.x;
  wh.y *= alpha.y;
  wh.z = max(EPS_COS, wh.z);
  return normalize(wh);
}

float directional_albedo_ggx(float alpha, float cosTheta) {
  return 1.0 -
         1.45940 * alpha * (-0.20276 + alpha * (2.77203 + (-2.61748 + 0.73343 * alpha) * alpha)) * cosTheta *
             (3.09507 + cosTheta * (-9.11368 + cosTheta * (15.88844 + cosTheta * (-13.70343 + 4.51786 * cosTheta))));
}

float average_albedo_ggx(float alpha) {
  return 1.0 + alpha * (-0.11304 + alpha * (-1.86947 + (2.22682 - 0.83397 * alpha) * alpha));
}

vec3 average_fresnel(vec3 f0, vec3 f90) {
  return 20. / 21. * f0 + 1. / 21. * f90;
}

vec3 eval_brdf_microfacet_ggx_smith_ms(vec3 f0, vec3 f90, vec2 alpha_uv, vec3 wi, vec3 wo, Geometry g) {
  float alpha = sqrt(alpha_uv.x * alpha_uv.y);
  float Ewi = directional_albedo_ggx(alpha, abs(dot(wi, g.n)));
  float Ewo = directional_albedo_ggx(alpha, abs(dot(wo, g.n)));
  float Eavg = average_albedo_ggx(alpha);
  float ms = (1.0 - Ewo) * (1.0 - Ewi) / (PI * (1.0 - Eavg));
  vec3 Favg = average_fresnel(f0, f90);
  vec3 f = (Favg * Favg * Eavg) / (1.0 - Favg * (1.0 - Eavg));
  return ms * f;
}

vec3 eval_brdf_microfacet_ggx_smith(vec3 f0, vec3 f90, vec2 alpha, vec3 wi, vec3 wo, vec3 wh, Geometry geo) {
  if (abs(dot(wi, geo.n)) < 0.0001 || dot(wo, geo.n) < 0.0) {
    return vec3(0.0);
  }
  vec3 f = fresnel_schlick(f0, f90, dot(wi, wh));
  float d = ggx_eval(alpha, wh, geo);
  float g = ggx_smith_g2(alpha, wi, wo, wh, geo, false);
  return (f * g * d) / abs(4.0 * dot(wi, geo.n) * dot(wo, geo.n));
}

// TODO Needs proper implementation
vec3 eval_bsdf_microfacet_ggx_smith(vec3 specular_f0, vec3 specular_f90, vec2 alpha, const in vec3 wi, in vec3 wo, Geometry geo) {  
  vec3 wo_f = flip(wo, -geo.n);
  vec3 wh = normalize(wi + wo_f);
  return eval_brdf_microfacet_ggx_smith(specular_f0, specular_f90, alpha, wi, wo_f, wh, geo);
}

vec3 sample_brdf_microfacet_ggx_smith(vec2 alpha, vec3 wi, Geometry g, vec2 uv, out float pdf) {
  vec3 wi_ = to_local(wi, g);
  vec3 wm_ = ggx_sample_vndf(alpha, wi_, uv);

  vec3 wo_ = reflect(-wi_, wm_);
  vec3 wo = to_world(wo_, g);

  vec3 wh = normalize(wi + wo);
  float jacobian = 1.0 / (4.0 * abs(dot(wo, wh)));

  pdf = ggx_eval_vndf(alpha, wi, wh, g) * jacobian;
  return wo;
}

vec3 fresnel_reflection(MaterialClosure c, float cos_theta, float ni, float nt) {
  vec3 f0 = sqr((ni - nt) / (ni + nt)) * c.specular*c.specular_tint;
  vec3 f90 = vec3(c.specular);

  vec3 _metal = fresnel_schlick(c.albedo, vec3(1.0), cos_theta);
  vec3 _plastic = fresnel_schlick(f0, f90, cos_theta);
  vec3 _glass = fresnel_schlick_dielectric(cos_theta, f0, f90, ni, nt, c.thin_walled);
  return mix(mix(_plastic, _glass, c.transparency), _metal, c.metallic);
}

vec3 fresnel_transmission(MaterialClosure c, float cos_theta, float ni, float nt) {
  vec3 f0 = sqr((ni - nt) / (ni + nt)) * c.specular * c.specular_tint;
  vec3 f90 = vec3(c.specular);
  return (vec3(1.0) - fresnel_schlick_dielectric(cos_theta, f0, f90, ni, nt, c.thin_walled)) * c.albedo * (1.0f - c.metallic) * c.transparency;
}

vec3 sample_bsdf_microfacet_ggx_smith(const in MaterialClosure c, vec3 wi, Geometry geo, vec3 uvw, inout float pdf,
                                      inout vec3 bsdf_weight, inout int event) {

  vec3 wi_ = to_local(wi, geo);
  vec3 wm_ = ggx_sample_vndf(c.alpha, wi_, uvw.xy);
  vec3 wh = to_world(wm_, geo);

  float cos_theta_i = dot(wi, wh);

  float ior_i = 1.0;
  float ior_o = c.ior;
  if (c.backside) {
    ior_i = c.ior;
    ior_o = 1.0;
  }

  vec3 fr = fresnel_reflection(c, cos_theta_i, ior_i, ior_o);
  vec3 ft = fresnel_transmission(c, cos_theta_i, ior_i, ior_o);

  float prob_fr = sum(fr) / (sum(fr) + sum(ft));
  if (isNan(prob_fr)) {
    prob_fr = 0.0;
  }

  bool singular_event = c.alpha.x == MINIMUM_ROUGHNESS;

  vec3 wo;
  bool tir = false;

  if (uvw.z <= prob_fr) { // reflection
    wo = reflect(-wi, wh);
    event = singular_event ? E_REFLECTION_SINGULAR : E_REFLECTION_GLOSSY;
  } else { // transmission
    if (c.thin_walled) {
      // thin transmission : flip reflected direction to back side
      wo = reflect(-wi, wh);
      wo = flip(wo, geo.n);

      event = singular_event ? E_TRANSMISSION_STRAIGHT : E_TRANSMISSION_GLOSSY;
    } else {
      // wo = refract(wi, wh, ior_i / ior_o);
      tir = !refractIt(-wi, wh, ior_i / ior_o, wo);

      if (tir) {
        wo = reflect(-wi, wh);
        event = singular_event ? E_REFLECTION_SINGULAR : E_REFLECTION_GLOSSY;
      } else {
        event = (ior_i == ior_o) ? E_TRANSMISSION_STRAIGHT
                                 : (singular_event ? E_TRANSMISSION_SINGULAR : E_TRANSMISSION_GLOSSY);
      }
    }
  }

  float g1 = ggx_smith_g1(c.alpha, wi, wh, geo);

  if ((event & E_REFLECTION) > 0) {
    float g2 = ggx_smith_g2(c.alpha, wi, wo, wh, geo, false);
    bsdf_weight = fr / prob_fr;
    bsdf_weight *= g2 / g1;
    pdf *= prob_fr;
    pdf *= 1.0 / (4.0 * abs(cos_theta_i));
  } else if ((event & E_TRANSMISSION) > 0) {
    pdf *= (1.0 - prob_fr);
    bsdf_weight = ft / (1.0 - prob_fr);
    float g2 = ggx_smith_g2(c.alpha, wi, wo, wh, geo, true);
    bsdf_weight *= g2 / g1;

    if (c.thin_walled) {
      pdf *= 1.0 / (4.0 * abs(cos_theta_i));
    } else {
      bsdf_weight *= sqr(ior_i / ior_o); // non symmetric adjoint brdf correction factor
      float denom = sqr(ior_i * dot(wi, wh) + ior_o * dot(wo, wh));
      pdf *= sqr(ior_o) * abs(dot(wo, wh)) / denom;
    }
  }

  if ((event & (E_SINGULAR | E_STRAIGHT)) > 0) {
    pdf = 1.0;
  }

  return wo;
}

float directional_albedo_ggx_ms(float theta, vec2 alpha, float e0) {
  return mix(e0 + (1.0 - e0) * pow(abs(1.0 - theta), 5.0), 0.04762 + 0.95238 * e0,
             1.0 - pow(abs(1.0 - alpha.x * alpha.y), 5.0));
}

float average_albedo_ggx_ms(vec2 alpha, float e0) {
  return e0 + (-0.33263 * alpha.x * alpha.y - 0.072359) * (1.0 - e0) * e0;
}

float coupled_diffuse(vec2 alpha, float dot_wi_n, float dot_wo_n, float e0) {
  float Ewi = directional_albedo_ggx_ms(dot_wi_n, alpha, e0);
  float Ewo = directional_albedo_ggx_ms(dot_wo_n, alpha, e0);
  float Eavg = average_albedo_ggx_ms(alpha, e0);
  return (1.0 - Ewo) * (1.0 - Ewi) / (PI * (1.0 - Eavg));
}

vec3 diffuse_bsdf_sample(const MaterialClosure c, vec3 wi, Geometry g, vec3 uvw, out float pdf, out int event) {
  float phi = uvw.y * 2.0 * PI;
  float cos_theta = sqrt(1.0 - uvw.x);
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
  pdf = cos_theta * ONE_OVER_PI;
  vec3 wo0 = vec3(cos(phi) * sin_theta, sin(phi) * sin_theta, cos_theta);

  if (uvw.z < c.translucency) {
    pdf *= c.translucency;
    wo0.z = -wo0.z;
    event = E_TRANSMISSION_DIFFUSE;
  } else {
    pdf *= 1.0 - c.translucency;
    event = E_REFLECTION_DIFFUSE;
  }
  return to_world(wo0, g);
}

vec3 diffuse_bsdf_eval(const in MaterialClosure c, vec3 wi, vec3 wo, Geometry g) {
  float lambert = ONE_OVER_PI;
  float coupled = coupled_diffuse(c.alpha, abs(dot(wi, g.n)), abs(dot(wo, g.n)), max_(c.f0 * c.specular_tint));
  vec3 diffuse_color = c.albedo * (1.0 - c.metallic) * (1.0 - c.transparency);
  return diffuse_color * mix(lambert, coupled, c.specular);
}

float diffuse_bsdf_pdf(vec3 wi, vec3 wo, Geometry g) {
  return abs(dot(wo, g.n)) * ONE_OVER_PI;
}

float l(float x, float alpha) {
  float oneMinusAlphaSq = (1.0 - alpha) * (1.0 - alpha);
  float a = mix(21.5473, 25.3245, oneMinusAlphaSq);
  float b = mix(3.82987, 3.32435, oneMinusAlphaSq);
  float c = mix(0.19823, 0.16801, oneMinusAlphaSq);
  float d = mix(-1.97760, -1.27393, oneMinusAlphaSq);
  float e = mix(-4.32054, -4.85967, oneMinusAlphaSq);
  return a / (1.0 + b * pow(abs(x), c)) + d * x + e;
}

float lambda_sheen(float cos_theta, float alpha) {
  return abs(cos_theta) < 0.5 ? exp(l(cos_theta, alpha)) : exp(2.0 * l(0.5, alpha) - l(1.0 - cos_theta, alpha));
}

float directional_albedo_sheen(float cos_theta, float alpha) {
  float c = 1.0 - cos_theta;
  float c3 = c * c * c;
  return 0.65584461 * c3 + 1.0 / (4.16526551 + exp(-7.97291361 * sqrt(alpha) + 6.33516894));
}

// Michael Ashikhmin, Simon Premoze – “Distribution-based BRDFs”, 2007
float ashikhminV(float alpha, float cos_theta_i, float cos_theta_o) {
  return 1.0 / (4.0 * (cos_theta_o + cos_theta_i - cos_theta_o * cos_theta_i));
}

// Alejandro Conty Estevez, Christopher Kulla. Production Friendly Microfacet
// Sheen BRDF, SIGGRAPH 2017.
// http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
float charlieV(float alpha, float cos_theta_i, float cos_theta_o) {
  return 1.0 / (1.0 + lambda_sheen(cos_theta_i, alpha) + lambda_sheen(cos_theta_o, alpha));
}

// https://dassaultsystemes-technology.github.io/EnterprisePBRShadingModel/spec-2022x.md.html#components/sheen
vec3 sheen_layer(out float base_weight, vec3 sheen_color, float sheen_roughness, vec3 wi,
                 vec3 wo, vec3 wh, Geometry g) {
  // We clamp the roughness to range[0.07; 1] to avoid numerical issues and
  // because we observed that the directional albedo at grazing angles becomes
  // larger than 1 if roughness is below 0.07
  float alpha = max(sheen_roughness, 0.07);
  alpha = alpha*alpha;
  float inv_alpha = 1.0 / alpha;

  float cos_theta_i = saturate_cos(dot(wi, g.n));
  float cos_theta_o = saturate_cos(dot(wo, g.n));
  float cos_theta_h_2 = sqr(dot(wh, g.n));
  float sin_theta_h_2 = max(1.0 - cos_theta_h_2, 0.001);
  float D = (2.0 + inv_alpha) * pow(abs(sin_theta_h_2), 0.5 * inv_alpha) / (2.0 * PI);

  float G = 1.0;

  if (u_int_SheenG == 0) {
    G = charlieV(alpha, cos_theta_i, cos_theta_o);
  } else {
    G = ashikhminV(alpha, cos_theta_i, cos_theta_o);
  }

  float sheen = G * D / (4.0 * cos_theta_i * cos_theta_o);

  float Ewi = max_(sheen_color) * directional_albedo_sheen(cos_theta_i, alpha);
  float Ewo = max_(sheen_color) * directional_albedo_sheen(cos_theta_o, alpha);

  base_weight = min(1.0 - Ewi, 1.0 - Ewo);

  return sheen_color * sheen;
}

vec3 coating_layer(out float base_weight, float clearcoat, float clearcoat_alpha, vec3 wi, vec3 wo, vec3 wh,
                   Geometry g) {
  vec3 coating = eval_brdf_microfacet_ggx_smith(vec3(0.04), vec3(1.0), vec2(clearcoat_alpha), wi, wo, wh, g);
  vec3 Fcv = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), abs(dot(wi, g.n)));
  vec3 Fcl = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), abs(dot(wo, g.n)));

  base_weight = 1.0 - max_(max(Fcv, Fcl));

  return clearcoat * coating;
}

vec3 eval_dspbr(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 wh = normalize(wi + wo);

  Geometry g = calculateBasis(c.n, c.t);
  vec3 bsdf = vec3(0.0);

  bsdf += diffuse_bsdf_eval(c, wi, wo, g);
  bsdf += eval_brdf_microfacet_ggx_smith(c.specular_f0, c.specular_f90, c.alpha, wi, wo, wh, g);
  bsdf += eval_brdf_microfacet_ggx_smith_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);
  // bsdf += eval_bsdf_microfacet_ggx_smith(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);

  float sheen_base_weight;
  vec3 sheen = sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
  bsdf = sheen + bsdf * sheen_base_weight;

  float clearcoat_base_weight;
  vec3 clearcoat = coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
  bsdf = clearcoat + bsdf * clearcoat_base_weight;

  return bsdf;
}

float luminance(vec3 rgb) {
  return 0.2126 * rgb.x + 0.7152 * rgb.y + 0.0722 * rgb.z;
}

float thinTransmissionRoughness(float ior, float roughness) {
  return saturate((0.65 * ior - 0.35) * roughness);
}

vec3 sample_dspbr(const in MaterialClosure c, vec3 wi, in vec3 uvw, out vec3 bsdf_over_pdf, out float pdf,
                  out int event) {
  Geometry g = calculateBasis(c.n, c.t);

  pdf = 1.0;

  vec3 ggx_importance = fresnel_schlick(c.specular_f0, vec3(1.0), dot(wi, g.n));

  vec3 diffuse_importance = c.albedo * (1.0 - c.transparency);
  vec3 sheen_importance = c.sheen_color;
  vec3 specular_refl_importance = max((1.0-c.transparency), c.metallic) * ggx_importance;
  vec3 clearcoat_importance = c.clearcoat * fresnel_schlick(c.specular_f0, vec3(1.0), dot(wi, g.n));;
  vec3 transmission_importance = vec3(c.albedo * c.transparency) * (1.0 - c.metallic) * (vec3(1.0) - ggx_importance);

  float bsdf_importance[4];
  bsdf_importance[0] = luminance(diffuse_importance + sheen_importance) * (1.0 - c.metallic);
  bsdf_importance[1] = luminance(specular_refl_importance);
  bsdf_importance[2] = luminance(clearcoat_importance);
  bsdf_importance[3] = luminance(transmission_importance);

  float bsdf_cdf[4];
  bsdf_cdf[0] = bsdf_importance[0];
  bsdf_cdf[1] = bsdf_cdf[0] + bsdf_importance[1];
  bsdf_cdf[2] = bsdf_cdf[1] + bsdf_importance[2];
  bsdf_cdf[3] = bsdf_cdf[2] + bsdf_importance[3];

  if (bsdf_cdf[3] != 0.0) {
    bsdf_cdf[0] *= 1.0 / bsdf_cdf[3];
    bsdf_cdf[1] *= 1.0 / bsdf_cdf[3];
    bsdf_cdf[2] *= 1.0 / bsdf_cdf[3];
    bsdf_cdf[3] *= 1.0 / bsdf_cdf[3];
  } else {
    bsdf_cdf[0] = 1.0;
  }

  // bsdf_cdf[0] = 1.0;
  // bsdf_cdf[1] = 0.0;
  // bsdf_cdf[2] = 0.0;
  // bsdf_cdf[3] = 0.0;

  vec3 wo;
  if (uvw.z <= bsdf_cdf[0]) {
    uvw.z = uvw.z / bsdf_cdf[0]; // rescale rr

    int event;
    wo = diffuse_bsdf_sample(c, wi, g, uvw, pdf, event);
    pdf *= bsdf_cdf[0];

    if ((event & E_REFLECTION_DIFFUSE) > 0) {
      bsdf_over_pdf = diffuse_bsdf_eval(c, wi, wo, g);
      vec3 wh = normalize(wi + wo);

      float sheen_base_weight;
      vec3 sheen = sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
      bsdf_over_pdf = sheen + bsdf_over_pdf * sheen_base_weight;

      float clearcoat_base_weight;
      coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
      bsdf_over_pdf *= clearcoat_base_weight;
      bsdf_over_pdf *= abs(dot(wo, g.n));

    } else { // E_TRANSMISSION_DIFFUSE
      bsdf_over_pdf = sqrt(c.albedo) * (1.0 - c.metallic) * (1.0 - c.transparency) * ONE_OVER_PI;
      bsdf_over_pdf *= abs(dot(wo, g.n));
    }

    bsdf_over_pdf /= pdf;
  } else if (uvw.z <= bsdf_cdf[1]) {
    wo = sample_brdf_microfacet_ggx_smith(c.alpha, wi, g, uvw.xy, pdf);
    pdf *= (bsdf_cdf[1] - bsdf_cdf[0]);

    vec3 wh = normalize(wi + wo);

    bsdf_over_pdf = eval_brdf_microfacet_ggx_smith(c.specular_f0, c.specular_f90, c.alpha, wi, wo, wh, g);
    bsdf_over_pdf += eval_brdf_microfacet_ggx_smith_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);

    float sheen_base_weight;
    sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
    bsdf_over_pdf *= sheen_base_weight;

    float clearcoat_base_weight;
    coating_layer(clearcoat_base_weight, 0.0, c.clearcoat_alpha, wi, wo, wh, g);
    bsdf_over_pdf *= clearcoat_base_weight;

    bsdf_over_pdf /= pdf;
    bsdf_over_pdf *= abs(dot(wo, g.n));

    if (c.alpha.x == MINIMUM_ROUGHNESS) {
      event |= E_SINGULAR;
    }
  } else if (uvw.z < bsdf_cdf[2]) {
    wo = sample_brdf_microfacet_ggx_smith(vec2(c.clearcoat_alpha), wi, g, uvw.xy, pdf);
    pdf *= (bsdf_cdf[2] - bsdf_cdf[1]);

    vec3 wh = normalize(wi + wo);

    float clearcoat_base_weight;
    vec3 clearcoat = coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
    bsdf_over_pdf = clearcoat;
    bsdf_over_pdf /= pdf;
    bsdf_over_pdf *= abs(dot(wo, g.n));

  } else if (uvw.z < bsdf_cdf[3]) {
    pdf *= (bsdf_cdf[3] - bsdf_cdf[2]);
    uvw.z = uvw.z * (1.0 / (bsdf_cdf[3] - bsdf_cdf[2])); // rescale rr
    int event;
    vec3 bsdf_weight;
    wo = sample_bsdf_microfacet_ggx_smith(c, wi, g, uvw, pdf, bsdf_weight, event);
    bsdf_over_pdf = bsdf_weight;

    if ((event & E_REFLECTION) > 0) {
      bsdf_over_pdf += eval_brdf_microfacet_ggx_smith_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);
      vec3 wh = normalize(wi + wo);
      float sheen_base_weight;
      sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
      bsdf_over_pdf *= sheen_base_weight;

      float clearcoat_base_weight;
      coating_layer(clearcoat_base_weight, 0.0, c.clearcoat_alpha, wi, wo, wh, g);
      bsdf_over_pdf *= clearcoat_base_weight;
    }
  }

  return wo;
}

