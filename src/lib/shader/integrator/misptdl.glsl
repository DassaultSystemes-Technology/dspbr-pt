vec4 trace_misptdl(Ray r)
{
  HitInfo hit;
  vec3 path_weight = vec3(1.0);

  bool last_bounce_specular = true; // pinhole camera is considered singular
  float last_bounce_pdf = 0.0;
  float last_bsdf_selection_pdf = 0.0;

  int bounce = 0;
  vec3 radiance = vec3(0.0);
  while(bounce <= u_int_maxBounces || last_bounce_specular)
  {
    if(check_russian_roulette_path_termination(bounce, path_weight)) break;

    RenderState rs;
    if (rt_kernel_intersect_nearest(r, hit)) { // primary camera ray
      fillRenderState(r, hit, rs);
      last_bsdf_selection_pdf = rs.closure.bsdf_selection_pdf;
       // Absorption
      if(rs.closure.backside && !rs.closure.thin_walled) {
        vec3 absorption_sigma = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
        path_weight *= exp(-absorption_sigma*hit.tfar);
      }

      radiance += rs.closure.emission * path_weight;
      last_bounce_specular = bool(rs.closure.event_type & E_SINGULAR);

      if(!last_bounce_specular) { // We can't evaluate direct light conribution for singular events
        radiance += sampleAndEvaluatePointLight(rs); // point light contribution is always evaluated

        float ibl_sample_pdf;
        vec3 ibl_sample_dir;
        vec3 ibl_radiance;

        if(u_bool_UseIBL && sampleAndEvaluateEnvironmentLight(rs, rng_NextFloat(),
              rng_NextFloat(), ibl_sample_dir, ibl_radiance, ibl_sample_pdf))
        {
          float brdf_sample_pdf = dspbr_pdf(rs.closure, rs.wi, ibl_sample_dir) * rs.closure.bsdf_selection_pdf;
          if(ibl_sample_pdf > EPS_PDF && brdf_sample_pdf > EPS_PDF) {
            float mis_weight = mis_balance_heuristic(ibl_sample_pdf, brdf_sample_pdf);
            radiance += ibl_radiance * path_weight * mis_weight;
          }
        }
      }

      vec3 bounce_weight;
      if(!sample_bsdf_bounce(rs, bounce_weight, last_bounce_pdf)) break; //absorped
      path_weight *= bounce_weight;

      r = rt_kernel_create_ray(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * u_float_rayEps, TFAR_MAX);
      bounce++;
    }
    else {
      if(u_bool_UseIBL) {
        if(bounce == 0) {
            if (u_bool_ShowBackground) {
              return vec4(evaluateIBL(r.dir), 1.0);
            } else {
              return vec4(pow(u_BackgroundColor.xyz, vec3(2.2)), u_BackgroundColor.w);
            }
        } else {
          float ibl_sample_pdf = sampleEnvironmentLightPdf(r.dir);
          float mis_weight = last_bounce_specular ? 1.0 : mis_balance_heuristic(last_bounce_pdf *last_bsdf_selection_pdf, ibl_sample_pdf);
          radiance += evaluateIBL(r.dir) * path_weight * mis_weight;
        }
      }
      break;
    }

  }

  return vec4(radiance, 1.0);
}