
vec3 eval_direct_light_contribution(in RenderState rs, float r0, float r1) {
  float ibl_sample_pdf;
  vec3 ibl_sample_dir;
  vec3 L = vec3(0);

  vec3 n = rs.closure.backside ? -rs.closure.n : rs.closure.n;

  if (u_use_ibl > 0.0) {
    ibl_sample_dir = ibl_sample_direction(r0, r1, ibl_sample_pdf);

    float cosNL = saturate(dot(ibl_sample_dir, n));
    if (cosNL > EPS_COS && ibl_sample_pdf > EPS_PDF) {
      if (!isOccluded(rs.hitPos, ibl_sample_dir)) {
        L = ibl_eval(ibl_sample_dir) * eval_dspbr(rs.closure, rs.wi, ibl_sample_dir) * cosNL / ibl_sample_pdf;

        float brdf_sample_pdf = dspbr_pdf(rs.closure, rs.wi, ibl_sample_dir);
        if (brdf_sample_pdf > EPS_PDF) {
          float mis_weight = mis_balance_heuristic(ibl_sample_pdf, brdf_sample_pdf);
          L *= mis_weight;
        }
      }
    }
  }

  L += sampleAndEvaluatePointLight(rs); // point light contribution is always evaluated
  return L;
}

vec4 trace(bvh_ray ray) {

  bvh_hit hit;
  vec3 path_weight = vec3(1.0);
  vec3 L = vec3(0.0);
  float last_bounce_pdf = 0.0;

  if (!bvh_intersect_nearest(ray, hit)) { // primary camera ray
    if (u_background_from_ibl > 0.0)
      return vec4(ibl_eval(ray.dir) * path_weight, 1.0);
    else
      return vec4(pow(u_background_color.xyz, vec3(2.2)), u_background_color.w);
  }

  RenderState rs;
  fillRenderState(ray, hit, rs);

  int bounce = 0;
  const int maxSpecularBounces = 32;
  bool last_bounce_specular = false; // pinhole camera is considered singular
  while (bounce < int(u_max_bounces) || (last_bounce_specular && (bounce < maxSpecularBounces)) )
  {
    if (check_russian_roulette_path_termination(bounce, path_weight))
      break;

    // Absorption
    if (rs.closure.backside && !rs.closure.thin_walled) {
      vec3 absorption_sigma = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
      path_weight *= exp(-absorption_sigma * hit.tfar);
    }

    L += rs.closure.emission * path_weight;
    last_bounce_specular = bool(rs.closure.event_type & E_DELTA);

    vec3 bounce_weight;
    if (!sample_bsdf_bounce(rs, bounce_weight, last_bounce_pdf))
      return vec4(L, 1.0); // absorped

    if (!last_bounce_specular) {
      L += eval_direct_light_contribution(rs, rng_float(), rng_float()) * path_weight;
    }

    path_weight *= bounce_weight;

    ray = bvh_create_ray(rs.wo, rs.hitPos, TFAR_MAX);

    if (bvh_intersect_nearest(ray, hit)) { // primary camera ray
      fillRenderState(ray, hit, rs);
      bounce++;
    } else {
      float ibl_sample_pdf = ibl_pdf(ray.dir);
      float mis_weight = last_bounce_specular ? 1.0 : mis_balance_heuristic(last_bounce_pdf, ibl_sample_pdf);
      L += ibl_eval(ray.dir) * path_weight * mis_weight * u_use_ibl;

      bounce = 1337;
    }
  }

  return vec4(clamp(L, 0.0, 3.0), 1.0);
}
