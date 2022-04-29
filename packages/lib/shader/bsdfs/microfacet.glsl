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

  if (sin_theta_2 < EPS) {
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

  if (sin_theta_2 < EPS) {
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
  if (dot(wi, geo.n) < EPS_PDF || dot(wo, geo.n) < EPS_PDF) {
    return vec3(0.0);
  }
  vec3 f = fresnel_schlick(f0, f90, dot(wi, wh));
  float d = ggx_eval(alpha, wh, geo);
  float g = ggx_smith_g2(alpha, wi, wo, wh, geo, false);
  return (f * g * d) / abs(4.0 * dot(wi, geo.n) * dot(wo, geo.n));
}

vec3 eval_brdf_microfacet_ggx_smith_iridescence(vec3 f0, vec3 f90, vec2 alpha, float iridescence, float iridescence_ior,
                                                float iridescence_thickness, vec3 wi, vec3 wo, vec3 wh, Geometry geo) {
  if (dot(wi, geo.n) < EPS_PDF || dot(wo, geo.n) < EPS_PDF) {
    return vec3(0.0);
  }

  // iridescence_base_weight = 1.0 - vec3(max(max(iridescence_fresnel.r, iridescence_fresnel.g),
  // iridescence_fresnel.b));
  vec3 iridescence_fresnel = evalIridescence(1.0, iridescence_ior, dot(wi, wh), iridescence_thickness, f0);

  vec3 f = mix(fresnel_schlick(f0, f90, dot(wi, wh)), iridescence_fresnel, iridescence);
  float d = ggx_eval(alpha, wh, geo);
  float g = ggx_smith_g2(alpha, wi, wo, wh, geo, false);
  return (f * g * d) / abs(4.0 * dot(wi, geo.n) * dot(wo, geo.n));
}

vec3 eval_bsdf_microfacet_ggx_smith(vec3 specular_f0, vec3 specular_f90, vec2 alpha, const in vec3 wi, in vec3 wo,
                                    Geometry geo) {
  if (abs(dot(wi, geo.n)) < EPS_PDF || dot(wo, geo.n) > 0.0) {
    return vec3(0.0);
  }
  vec3 wo_f = flip(wo, -geo.n);
  vec3 wh = normalize(wi + wo_f);
  return eval_brdf_microfacet_ggx_smith(specular_f0, specular_f90, alpha, wi, wo_f, wh, geo);
}

vec3 eval_bsdf_microfacet_ggx_smith_iridescence(vec3 specular_f0, vec3 specular_f90, vec2 alpha, float iridescence,
                                                float iridescence_ior, float iridescence_thickness, const in vec3 wi,
                                                in vec3 wo, Geometry geo) {
  if (dot(wi, geo.n) < EPS_PDF || dot(wo, geo.n) > 0.0) {
    return vec3(0.0);
  }
  vec3 wo_f = flip(wo, -geo.n);
  vec3 wh = normalize(wi + wo_f);
  return eval_brdf_microfacet_ggx_smith_iridescence(specular_f0, specular_f90, alpha, iridescence, iridescence_ior,
                                                    iridescence_thickness, wi, wo_f, wh, geo);
}

float brdf_microfacet_ggx_smith_pdf(MaterialClosure c, Geometry g, vec3 wi, vec3 wo) {
  if (dot(wi, g.n) < EPS_PDF || dot(wo, g.n) < EPS_PDF)
    return 0.0;

  vec3 wh = normalize(wi + wo);
  return ggx_eval_vndf(c.alpha, wi, wh, g) / (4.0 * abs(dot(wo, wh)));
}

vec3 sample_brdf_microfacet_ggx_smith(vec2 alpha, vec3 wi, Geometry g, vec2 uv, out float pdf) {
  vec3 wi_ = to_local(wi, g);
  vec3 wm_ = ggx_sample_vndf(alpha, wi_, uv);

  vec3 wo_ = reflect(-wi_, wm_);
  vec3 wo = to_world(wo_, g);

  vec3 wh = normalize(wi + wo);

  pdf = ggx_eval_vndf(alpha, wi, wh, g) * (1.0 / (4.0 * abs(dot(wo, wh))));
  return wo;
}

vec3 fresnel_reflection(MaterialClosure c, float cos_theta, float ni, float nt) {
  vec3 f0 = sqr((ni - nt) / (ni + nt)) * c.specular * c.specular_tint;
  vec3 f90 = vec3(c.specular);

  vec3 _iridescence = evalIridescence(ni, c.iridescence_ior, cos_theta, c.iridescence_thickness, f0);
  vec3 _plastic = fresnel_schlick(f0, f90, cos_theta);
  vec3 _glass = fresnel_schlick_dielectric(cos_theta, f0, f90, ni, nt, c.thin_walled);
  return mix(mix(_plastic, _glass, c.transparency), _iridescence, c.iridescence);
}

vec3 fresnel_transmission(MaterialClosure c, float cos_theta, float ni, float nt) {
  vec3 f0 = sqr((ni - nt) / (ni + nt)) * c.specular * c.specular_tint;
  vec3 f90 = vec3(c.specular);
  vec3 fr = fresnel_schlick_dielectric(cos_theta, f0, f90, ni, nt, c.thin_walled);
  return vec3(1.0) - fr;
}

vec3 sample_bsdf_microfacet_ggx_smith(const in MaterialClosure c, vec3 wi, Geometry geo, vec3 uvw, out float pdf,
                                      inout vec3 bsdf_weight, inout int event) {

  pdf = 1.0;
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
    event = E_REFLECTION | (singular_event ? E_DELTA : 0);
  } else { // transmission
    if (c.thin_walled) {
      // thin transmission : flip reflected direction to back side
      wo = reflect(-wi, wh);
      wo = flip(wo, geo.n);

      event = E_TRANSMISSION | (singular_event ? E_DELTA : 0);
    } else {
      tir = !refractIt(-wi, wh, ior_i / ior_o, wo);

      if (tir) {
        wo = reflect(-wi, wh);
        event = E_REFLECTION | (singular_event ? E_DELTA : 0);
      } else {
        event = E_TRANSMISSION;
        event |= (ior_i == ior_o) ? E_STRAIGHT : 0;
        event |= singular_event ? E_DELTA : 0;
      }
    }
  }

  float g1 = ggx_smith_g1(c.alpha, wi, wh, geo);
  pdf *= ggx_eval_vndf(c.alpha, wi, wh, geo);

  if (bool(event & E_REFLECTION)) {
    float g2 = ggx_smith_g2(c.alpha, wi, wo, wh, geo, false);

    // vec3 f0 = sqr((ior_i - ior_o) / (ior_i + ior_o)) * c.specular * c.specular_tint;
    // vec3 _iridescence = evalIridescence(ior_i, c.iridescence_ior, cos_theta_i, c.iridescence_thickness, f0);
    // float iridescence_base_weight = 1.0 - max_(_iridescence);

    bsdf_weight *= fr / prob_fr;
    bsdf_weight *= g2 / g1; // * iridescence_base_weight;
    pdf *= prob_fr / (4.0 * abs(dot(wo, wh)));
  } else if (bool(event & E_TRANSMISSION)) {
    pdf *= (1.0 - prob_fr);
    bsdf_weight *= ft / (1.0 - prob_fr) * c.albedo * c.transparency;
    float g2 = ggx_smith_g2(c.alpha, wi, wo, wh, geo, true);
    bsdf_weight *= g2 / g1;

    if (c.thin_walled) {
      pdf *= 1.0 / (4.0 * abs(dot(wo, wh)));
    } else {
      bsdf_weight *= sqr(ior_i / ior_o); // non symmetric adjoint brdf correction factor
      float denom = sqr(ior_i * dot(wi, wh) + ior_o * dot(wo, wh));
      pdf *= sqr(ior_o) * abs(dot(wo, wh)) / denom;
    }
  }

  if (bool(event & (E_DELTA | E_STRAIGHT))) {
    pdf = 1.0;
  }

  return wo;
}

float bsdf_microfacet_ggx_smith_pdf(in MaterialClosure c, Geometry g, vec3 wi, vec3 wo) {
  float pdf = 1.0;
  vec3 wh = normalize(wi + wo);
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
  pdf *= (1.0 - prob_fr);

  if (c.thin_walled) {
    pdf *= 1.0 / (4.0 * abs(cos_theta_i));
  } else {
    float denom = sqr(ior_i * dot(wi, wh) + ior_o * dot(wo, wh));
    pdf *= sqr(ior_o) * abs(dot(wo, wh)) / denom;
  }

  if (dot(wi, g.n) < EPS_COS)
    wi = flip(wi, -g.n);
  pdf *= brdf_microfacet_ggx_smith_pdf(c, g, wi, wo);

  return pdf;
}
