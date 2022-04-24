vec4 trace_pt(bvh_ray r)
{
  bvh_hit hit;
  vec3 path_weight = vec3(1.0);
  vec3 contribution = vec3(0);

  if (!bvh_intersect_nearest(r, hit)) { // primary camera ray
    if (u_background_from_ibl > 0.0)
      return vec4(ibl_eval(r.dir) * path_weight, 1.0);
    else
      return vec4(pow(u_background_color.xyz, vec3(2.2)), u_background_color.w);
  }

  RenderState rs;
  fillRenderState(r, hit, rs);

  int bounce = 0;
  bool last_bounce_specular = true; // pinhole camera is considered singular
  const int maxSpecularBounces = 32;
  while (bounce < int(u_max_bounces) || (last_bounce_specular && (bounce < maxSpecularBounces)) )
  {
    if(check_russian_roulette_path_termination(bounce, path_weight)) break;

      // Absorption
    if(rs.closure.backside && !rs.closure.thin_walled) {
      vec3 absorption_sigma = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
      path_weight *= exp(-absorption_sigma*hit.tfar);
    }

    contribution += rs.closure.emission * path_weight;
    last_bounce_specular = bool(rs.closure.event_type & E_DELTA);

    float bounce_pdf;
    vec3 bounce_weight;
    if(!sample_bsdf_bounce(rs, bounce_weight, bounce_pdf)) break; //absorped
    path_weight *= bounce_weight;

    r = bvh_create_ray(rs.wo, rs.hitPos + fix_normal(rs.ng, rs.wo) * u_ray_eps, TFAR_MAX);

    if (bvh_intersect_nearest(r, hit)) { // primary camera ray
      fillRenderState(r, hit, rs);
      bounce++;
    } else {
      if(u_use_ibl > 0.0) {
        contribution += ibl_eval(r.dir) * path_weight;
      }
      bounce = 1337;
    }
  }

  return vec4(contribution, 1.0);
}