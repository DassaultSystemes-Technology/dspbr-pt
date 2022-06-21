const int D_ALBEDO = 1;
const int D_METAL = 2;
const int D_ROUGHNESS = 3;
const int D_NORMAL = 4;
const int D_TANGENT = 5;
const int D_BITANGENT = 6;
const int D_TRANSPARENCY = 7;
const int D_UV0 = 8;
const int D_CLEARCOAT = 9;
const int D_IBL_PDF = 10;
const int D_IBL_CDF = 11;
const int D_SPECULAR = 12;
const int D_SPECULAR_TINT = 13;
const int D_FRESNEL_SCHLICK = 14;
const int D_TRANSLUCENCY = 15;
const int D_FRESNEL_IRIDESCENCE = 16;

vec4 trace(const bvh_ray ray) {
  bvh_hit hit;

  vec4 color = vec4(0);
  if (bvh_intersect_nearest(ray, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(ray, hit, rs);

    MaterialClosure c = rs.closure;

    float cos_theta = dot(ray.dir, c.n);

    if (int(u_debug_mode) == D_ALBEDO) {
      contrib = vec3(c.albedo);
    }
    if (int(u_debug_mode) == D_METAL)
      contrib = vec3(c.metallic);
    if (int(u_debug_mode) == D_ROUGHNESS)
      contrib = vec3(c.alpha, 0.0);
    if (int(u_debug_mode) == D_NORMAL)
      contrib = c.n;
    if (int(u_debug_mode) == D_TANGENT) {
      contrib = c.t.xyz;
    }
    if (int(u_debug_mode) == D_BITANGENT) {
      Geometry g = calculateBasis(c.n, c.t);
      contrib = g.b;
    }
    if (int(u_debug_mode) == D_TRANSPARENCY) {
      contrib = vec3(c.transparency);
    }
     if (int(u_debug_mode) == D_TRANSLUCENCY) {
      contrib = c.translucency * c.translucencyColor;
    }
    if (int(u_debug_mode) == D_UV0) {
      contrib = vec3(rs.uv0, 0.0);
    }
    if (int(u_debug_mode) == D_CLEARCOAT) {
      contrib = vec3(c.clearcoat);
    }
    if (int(u_debug_mode) == D_SPECULAR) {
      contrib = vec3(c.specular);
    }
    if (int(u_debug_mode) == D_SPECULAR_TINT) {
      contrib = c.specular_tint;
    }
    if (int(u_debug_mode) == D_FRESNEL_SCHLICK) {
      contrib = fresnel_schlick(c.specular_f0, c.specular_f90, dot(c.n, rs.wi));
    }
    if (int(u_debug_mode) == D_FRESNEL_IRIDESCENCE) {
      contrib = evalIridescence(1.0, c.iridescence_ior, cos_theta, c.iridescence_thickness, c.specular_f0);
    }
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_background_from_ibl > 0.0) {
      if(int(u_debug_mode) == D_IBL_PDF) {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_pdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0) * 10.0;
      }
      else if(int(u_debug_mode) == D_IBL_CDF) {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map_cdf, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
      else {
        vec3 sampleDir = rotate_dir_phi(ray.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_env_map, dir_to_uv(sampleDir, pdf)).xyz, 1.0);
      }
    }
  }

  return color;
}
