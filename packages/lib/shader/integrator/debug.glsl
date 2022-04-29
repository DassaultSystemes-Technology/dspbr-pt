
vec4 trace(const bvh_ray r) {
  bvh_hit hit;

  vec4 color = vec4(0);
  if (bvh_intersect_nearest(r, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(r, hit, rs);

    if (int(u_debug_mode) == 1) {
      contrib = vec3(rs.closure.albedo);
    }
    if (int(u_debug_mode) == 2)
      contrib = vec3(rs.closure.metallic);
    if (int(u_debug_mode) == 3)
      contrib = vec3(rs.closure.alpha, 0.0);
    if (int(u_debug_mode) == 4)
      contrib = rs.closure.n;
    if (int(u_debug_mode) == 5) {
      contrib = rs.closure.t.xyz;
    }
    if (int(u_debug_mode) == 6) {
      Geometry g = calculateBasis(rs.closure.n, rs.closure.t);
      contrib = g.b;
    }
    if (int(u_debug_mode) == 7) {
      contrib = vec3(rs.closure.transparency);
    }
    if (int(u_debug_mode) == 8) {
      contrib = vec3(rs.uv0, 0.0);
    }
    if (int(u_debug_mode) == 9) {
      contrib = vec3(rs.closure.clearcoat);
    }
    if (int(u_debug_mode) == 12) {
      contrib = vec3(rs.closure.specular);
    }
    if (int(u_debug_mode) == 13) {
      contrib = rs.closure.specular_tint;
    }
    if (int(u_debug_mode) == 14) {
      contrib = fresnel_schlick(rs.closure.specular_f0, rs.closure.specular_f90, dot(rs.closure.n, rs.wi));
    }
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_background_from_ibl > 0.0) {
      if(int(u_debug_mode) == 10) {
        vec3 sampleDir = rotate_dir_phi(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_pdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0) * 10.0;
      }
      else if(int(u_debug_mode) == 11) {
        vec3 sampleDir = rotate_dir_phi(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_cdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
      else {
        vec3 sampleDir = rotate_dir_phi(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
    }
  }

  return color;
}
