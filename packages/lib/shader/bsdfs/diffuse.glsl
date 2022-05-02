
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

vec3 diffuse_bsdf_eval(const in MaterialClosure c, vec3 wi, vec3 wo, Geometry g, bool transmit) {

 if(!transmit) {
    float coupled = coupled_diffuse(c.alpha, abs(dot(wi, g.n)), abs(dot(wo, g.n)), max_(c.f0 * c.specular_tint));
    vec3 diffuse_color = c.albedo * (1.0 - c.metallic) * (1.0 - c.transparency);
    return diffuse_color * mix(ONE_OVER_PI, coupled, c.specular);
  } else { // diffuse transmission
    vec3 transmission_color = c.translucencyColor * (1.0 - c.metallic) * (1.0 - c.transparency);
    return transmission_color * ONE_OVER_PI * c.translucency;
  }
}

vec3 diffuse_bsdf_sample(inout MaterialClosure c, vec3 wi, Geometry g, vec3 uvw, out vec3 bsdf_weight, out float pdf) {
  vec3 wo = sampleHemisphereCosine(uvw.xy, pdf);
  if (uvw.z < c.translucency) {
    pdf *= c.translucency;
    wo.z = -wo.z;
    c.event_type |= E_TRANSMISSION;
    bsdf_weight = diffuse_bsdf_eval(c, wi, wo, g, true) / pdf;
  } else {
    pdf *= 1.0 - c.translucency;
    c.event_type |= E_REFLECTION;
    bsdf_weight = diffuse_bsdf_eval(c, wi, wo, g, false) / pdf;
  }

  wo = to_world(wo, g);
  return wo;
}


vec3 diffuse_btdf_eval(const in MaterialClosure c, vec3 wi, vec3 wo, Geometry g) {
  return c.albedo * (1.0 - c.metallic) * (1.0 - c.transparency) * ONE_OVER_PI;
}

float diffuse_bsdf_pdf(vec3 wi, vec3 wo, Geometry g) {
  return saturate(dot(wo, g.n)) * ONE_OVER_PI;
}
