vec4 trace_pt(Ray r)
{
  HitInfo hit;
  vec3 path_weight = vec3(1.0);
  vec3 contribution = vec3(0);

  bool last_bounce_specular = true; // pinhole camera is considered singular

  int bounce = 0;
  while(bounce <= u_int_maxBounces || last_bounce_specular)
  {
    if(check_russian_roulette_path_termination(bounce, path_weight)) break;

    if (rt_kernel_intersect_nearest(r, hit)) { // primary camera ray
      RenderState rs;
      fillRenderState(r, hit, rs);

      // Absorption
      if(rs.closure.backside && !rs.closure.thin_walled) {
        vec3 absorption_sigma = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
        path_weight *= exp(-absorption_sigma*hit.tfar);
      }

      contribution += rs.closure.emission * path_weight;
      last_bounce_specular = bool(rs.closure.event_type & E_SINGULAR);

      float bounce_pdf;
      vec3 bounce_weight;
      if(!sample_bsdf_bounce(rs, bounce_weight, bounce_pdf)) break; //absorped
      path_weight *= bounce_weight;

      r = rt_kernel_create_ray(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * u_float_rayEps, TFAR_MAX);
      bounce++;
    }
    else {
      if(u_bool_UseIBL) {
        contribution += evaluateIBL(r.dir) * path_weight;
      }
      break;
    }
  }

  return vec4(contribution, 1.0);
}