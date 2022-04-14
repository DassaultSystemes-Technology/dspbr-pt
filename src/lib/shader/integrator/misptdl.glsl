
vec3 eval_direct_light_contribution(in RenderState rs, float r0, float r1) {
  float ibl_sample_pdf;
  vec3 ibl_sample_dir;
  vec3 L = vec3(0);

  if (u_use_ibl > 0.0) {
    ibl_sample_dir = ibl_sample_direction(r0, r1, ibl_sample_pdf);

    float cosNL = dot(ibl_sample_dir, rs.closure.n);
    vec3 sample_org = rs.hitPos + rs.closure.n * u_ray_eps * sign(cosNL);
    if (abs(cosNL) > EPS_COS) {
     if (!isOccluded(sample_org, ibl_sample_dir)) {
        L = ibl_eval(ibl_sample_dir) * eval_dspbr(rs.closure, rs.wi, ibl_sample_dir) * abs(cosNL);
     }
    }
 }

  float brdf_sample_pdf = dspbr_pdf(rs.closure, rs.wi, ibl_sample_dir);
  brdf_sample_pdf *= rs.closure.bsdf_selection_pdf;

  if (ibl_sample_pdf > EPS_PDF && brdf_sample_pdf > EPS_PDF) {
    float mis_weight = mis_balance_heuristic(ibl_sample_pdf, brdf_sample_pdf);
    L *= mis_weight;
  }
  else {
    L = vec3(0);
  }

  // L += sampleAndEvaluatePointLight(rs); // point light contribution is always evaluated
  return L;
}

vec4 trace_misptdl(bvh_ray ray) {
  bvh_hit hit;
  vec3 path_weight = vec3(1.0);

  bool last_bounce_specular = true; // pinhole camera is considered singular
  float last_bounce_pdf = 0.0;
  float last_bsdf_selection_pdf = 0.0;

  int bounce = 0;
  vec3 L = vec3(0.0);
  while (bounce <= int(u_max_bounces)) {
    if (check_russian_roulette_path_termination(bounce, path_weight))
      break;

    RenderState rs;
    if (bvh_intersect_nearest(ray, hit)) { // primary camera ray
      fillRenderState(ray, hit, rs);
      last_bsdf_selection_pdf = rs.closure.bsdf_selection_pdf;
      // Absorption
      if (rs.closure.backside && !rs.closure.thin_walled) {
        vec3 absorption_sigma = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
        path_weight *= exp(-absorption_sigma * hit.tfar);
      }

      L += rs.closure.emission * path_weight;
      last_bounce_specular = bool(rs.closure.event_type & E_SINGULAR);

      if (!last_bounce_specular) {
        L += eval_direct_light_contribution(rs, rng_float(), rng_float()) * path_weight;
      }

      vec3 bounce_weight;
      if (!sample_bsdf_bounce(rs, bounce_weight, last_bounce_pdf))
        return vec4(L, 1.0); // absorped

      path_weight *= bounce_weight;

      ray = bvh_create_ray(rs.wo, rs.hitPos + fix_normal(rs.ng, rs.wo) * u_ray_eps, TFAR_MAX);
    } else { // handle background hit and exit
    //  if(bounce == 0){
      float ibl_sample_pdf = ibl_pdf(ray.dir);
      float mis_weight = last_bounce_specular
                              ? 1.0
                              : mis_balance_heuristic(last_bounce_pdf * last_bsdf_selection_pdf, ibl_sample_pdf);
      L += ibl_eval(ray.dir) * path_weight * mis_weight * u_use_ibl;
    //  }
      // We allow for constant color background
      if(bounce == 0 && u_background_from_ibl <= 0.0)
           return vec4(pow(u_background_color.xyz, vec3(2.2)), u_background_color.w);

      bounce = 1337;
    }
    bounce++;
  }

  return vec4(L, 1.0);
}
