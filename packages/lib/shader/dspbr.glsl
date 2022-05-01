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


// float thinTransmissionRoughness(float ior, float roughness) {
//   return saturate((0.65 * ior - 0.35) * roughness);
// }

vec3 coating_layer(out float base_weight, float clearcoat, float clearcoat_alpha, vec3 wi, vec3 wo, vec3 wh, Geometry g) {
  vec3 coating = eval_brdf_microfacet_ggx_smith(vec3(0.04), vec3(1.0), vec2(clearcoat_alpha), wi, wo, wh, g);
  vec3 Fcv = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), abs(dot(wi, g.n)));
  vec3 Fcl = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), abs(dot(wo, g.n)));

  base_weight = 1.0 - max_(max(Fcv, Fcl));

  return clearcoat * coating;
}


vec3 eval_dspbr(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 wh = normalize(wi + wo);
  Geometry g = calculateBasis(c.n, c.t);

  vec3 base = diffuse_bsdf_eval(c, wi, wo, g);
  base += eval_brdf_microfacet_ggx(c.specular_f0, c.specular_f90, c.alpha, c.iridescence, c.iridescence_ior, c.iridescence_thickness, wi, wo, wh, g);
  // base += eval_brdf_microfacet_ggx_smith(c.specular_f0, c.specular_f90, c.alpha, wi, wo, wh, g);
  base += eval_brdf_microfacet_ggx_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);

  base += eval_btdf_microfacet_ggx(c.specular_f0, c.specular_f90, c.alpha, c.iridescence, c.iridescence_ior, c.iridescence_thickness, wi, wo, g);

  float sheen_base_weight;
  vec3 sheen = sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
  base = base * sheen_base_weight + sheen;

  float clearcoat_base_weight;
  vec3 clearcoat = coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
  base = clearcoat + base * clearcoat_base_weight;

  return base;
}

float dspbr_pdf(const in MaterialClosure c, vec3 wi, vec3 wo) {
  float pdf = 0.0;
  Geometry g = calculateBasis(c.n, c.t);

  if(bool(c.event_type & E_COATING)) {
    pdf = brdf_microfacet_ggx_smith_pdf(c, g, wi, wo);
  }
  else if (bool(c.event_type & E_DIFFUSE)) {
    pdf = diffuse_bsdf_pdf(wi, wo, g);
  }
  else if(bool(c.event_type & E_OPAQUE_DIELECTRIC)) {
    pdf = brdf_microfacet_ggx_smith_pdf(c, g, wi, wo);
  }
    else if(bool(c.event_type & E_METAL)) {
    pdf = brdf_microfacet_ggx_smith_pdf(c, g, wi, wo);
  }
  else if(bool(c.event_type & E_TRANSPARENT_DIELECTRIC)) {
    pdf = bsdf_microfacet_ggx_smith_pdf(c, g, wi, wo);
  }

  // return (c.alpha.x == MINIMUM_ROUGHNESS) ? 0.0 : pdf;
  return pdf;
}

vec3 dspbr_diffuse_rho(const in MaterialClosure c) {
  return (c.albedo + c.sheen_color) * (1.0-c.metallic) * (1.0-c.transparency);
}

float dspbr_clearcoat_rho(const in MaterialClosure c, Geometry g, vec3 wi) {
  return c.clearcoat * fresnel_schlick(0.04, 1.0, dot(wi, g.n));
}

vec3 dspbr_microfacet_brdf_ggx_smith_rho(const in MaterialClosure c, Geometry g, vec3 wi) {
  return fresnel_schlick(c.specular_f0, c.specular_f90, saturate(dot(wi, g.n)));
}

vec3 dspbr_microfacet_bsdf_ggx_smith_rho(const in MaterialClosure c, Geometry g, vec3 wi) {
  return (vec3(1.0) - fresnel_schlick(c.specular_f0, c.specular_f90, saturate(dot(wi, g.n))));
}

void select_bsdf(inout MaterialClosure c, float rr, vec3 wi, out float pdf) {
  Geometry g = calculateBasis(c.n, c.t);

  float diffuse_importance = luminance(dspbr_diffuse_rho(c));
  float brdf_importance =  luminance(dspbr_microfacet_brdf_ggx_smith_rho(c, g, wi));
  float bsdf_importance =  luminance(dspbr_microfacet_bsdf_ggx_smith_rho(c, g, wi));
  float clearcoat_importance = dspbr_clearcoat_rho(c, g, wi);

  float bsdf_pdf[5];
  bsdf_pdf[0] = diffuse_importance * (1.0 - c.metallic) * (1.0 - c.transparency); // diffuse
  bsdf_pdf[1] = brdf_importance * (1.0 - c.metallic) * (1.0 - c.transparency); // opaque dielectric
  bsdf_pdf[2] = bsdf_importance * (1.0 - c.metallic) * c.transparency; // transparent dielectric
  bsdf_pdf[3] = brdf_importance * c.metallic * (1.0 - c.transparency); // metal
  bsdf_pdf[4] = clearcoat_importance; // clearcoat

  float bsdf_cdf[5];
  bsdf_cdf[0] = bsdf_pdf[0];
  bsdf_cdf[1] = bsdf_cdf[0] + bsdf_pdf[1];
  bsdf_cdf[2] = bsdf_cdf[1] + bsdf_pdf[2];
  bsdf_cdf[3] = bsdf_cdf[2] + bsdf_pdf[3];
  bsdf_cdf[4] = bsdf_cdf[3] + bsdf_pdf[4];

  if (bsdf_cdf[4] != 0.0) {
    bsdf_cdf[0] *= 1.0 / bsdf_cdf[4];
    bsdf_cdf[1] *= 1.0 / bsdf_cdf[4];
    bsdf_cdf[2] *= 1.0 / bsdf_cdf[4];
    bsdf_cdf[3] *= 1.0 / bsdf_cdf[4];
    bsdf_cdf[4] *= 1.0 / bsdf_cdf[4];
  } else {
    bsdf_cdf[0] = 1.0;
  }

  // bsdf_cdf[0] = 1.0;
  // bsdf_cdf[1] = 0.0;
  // bsdf_cdf[2] = 0.0;
  // bsdf_cdf[3] = 0.0;
  // bsdf_cdf[4] = 0.0;

  pdf = 0.0;
  vec3 wo;
  if (rr <= bsdf_cdf[0]) {
    c.event_type = E_DIFFUSE;
    pdf = bsdf_cdf[0];
  }
  else if(rr <= bsdf_cdf[1]) {
    c.event_type = E_OPAQUE_DIELECTRIC;
    pdf = bsdf_cdf[1] - bsdf_cdf[0];
  }
  else if(rr <= bsdf_cdf[2]) {
    c.event_type = E_TRANSPARENT_DIELECTRIC;
    pdf = bsdf_cdf[2] - bsdf_cdf[1];
  }
  else if(rr <= bsdf_cdf[3]) {
    c.event_type = E_METAL;
    pdf = bsdf_cdf[3] - bsdf_cdf[2];
  }
  else if(rr <= bsdf_cdf[4]) {
    c.event_type = E_COATING;
    pdf = bsdf_cdf[4] - bsdf_cdf[3];
  }

  // pdf = 1.0;
}

vec3 sample_dspbr(inout MaterialClosure c, vec3 wi, in vec3 uvw, inout vec3 bsdf_over_pdf, out float pdf) {
  Geometry g = calculateBasis(c.n, c.t);
  bsdf_over_pdf = vec3(1.0);
  pdf = 1.0;

  vec3 wo;

  if(bool(c.event_type & E_DIFFUSE)) { //diffuse reflection
    int event;
    wo = diffuse_bsdf_sample(c, wi, g, uvw, bsdf_over_pdf, pdf);
    bsdf_over_pdf *= abs(dot(wo, g.n));
    if(has_flag(event, E_REFLECTION)) {
      vec3 wh = normalize(wi + wo);

      float sheen_base_weight;
      vec3 sheen = sheen_layer(sheen_base_weight, c.sheen_color,
        c.sheen_roughness, wi, wo, wh, g);
      bsdf_over_pdf = sheen + bsdf_over_pdf * sheen_base_weight;

      float clearcoat_base_weight;
      coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
      bsdf_over_pdf *= clearcoat_base_weight;
    }
  }
  else if (bool(c.event_type & E_OPAQUE_DIELECTRIC)) {
    wo = sample_brdf_microfacet_ggx_smith(c.alpha, wi, g, uvw.xy, pdf);
    vec3 wh = normalize(wi + wo);

    bsdf_over_pdf *= eval_brdf_microfacet_ggx(c.specular_f0, c.specular_f90, c.alpha, c.iridescence, c.iridescence_ior, c.iridescence_thickness, wi, wo, wh, g) / pdf;
    bsdf_over_pdf += eval_brdf_microfacet_ggx_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);
    bsdf_over_pdf *= (1.0-c.metallic) * (1.0-c.transparency);

    float sheen_base_weight;
    sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
    bsdf_over_pdf *= sheen_base_weight;

    float clearcoat_base_weight;
    coating_layer(clearcoat_base_weight, 0.0, c.clearcoat_alpha, wi, wo, wh, g);
    bsdf_over_pdf *= clearcoat_base_weight;

    bsdf_over_pdf *= abs(dot(wo, g.n));
  }
  else if (bool(c.event_type & E_TRANSPARENT_DIELECTRIC)) {
    int event = 0;
    wo = sample_bsdf_microfacet_ggx_smith(c, wi, g, uvw, pdf, bsdf_over_pdf, event);
    bsdf_over_pdf *= (1.0-c.metallic) * c.transparency;

    if (bool(event & E_REFLECTION)) {
      bsdf_over_pdf += eval_brdf_microfacet_ggx_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);

      vec3 wh = normalize(wi + wo);
      float sheen_base_weight;
      sheen_layer(sheen_base_weight, c.sheen_color, c.sheen_roughness, wi, wo, wh, g);
      bsdf_over_pdf *= sheen_base_weight;

      float clearcoat_base_weight;
      coating_layer(clearcoat_base_weight, 0.0, c.clearcoat_alpha, wi, wo, wh, g);
      bsdf_over_pdf *= clearcoat_base_weight;
    }

    c.event_type = event;
  }
  else if (bool(c.event_type & E_METAL)) {
    wo = sample_brdf_microfacet_ggx_smith(c.alpha, wi, g, uvw.xy, pdf);
    vec3 wh = normalize(wi + wo);

    bsdf_over_pdf *= eval_brdf_microfacet_ggx(c.specular_f0, c.specular_f90, c.alpha, c.iridescence, c.iridescence_ior, c.iridescence_thickness, wi, wo, wh, g) / pdf;
    bsdf_over_pdf += eval_brdf_microfacet_ggx_ms(c.specular_f0, c.specular_f90, c.alpha, wi, wo, g);

    bsdf_over_pdf *= abs(dot(wo, g.n));
  }
  else if (bool(c.event_type & E_COATING)) {
    wo = sample_brdf_microfacet_ggx_smith(vec2(c.clearcoat_alpha), wi, g, uvw.xy, pdf);
    vec3 wh = normalize(wi + wo);

    float clearcoat_base_weight;
    vec3 clearcoat = coating_layer(clearcoat_base_weight, c.clearcoat, c.clearcoat_alpha, wi, wo, wh, g);
    bsdf_over_pdf *= clearcoat / pdf;
    bsdf_over_pdf *= abs(dot(wo, g.n));
  }

  return wo;
}

