
vec4 trace_debug(const bvh_ray r) {
  bvh_hit hit;

  vec4 color = vec4(0);
  if (bvh_intersect_nearest(r, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(r, hit, rs);

    if (u_int_DebugMode == 1) {
      contrib = vec3(rs.closure.albedo);
      // vec3 sampleDir = normalize(vec3(rng_NextFloat(), rng_NextFloat(),rng_NextFloat()));
      // float pdf;
      // vec3 c;
      // sampleAndEvaluateEnvironmentLight(rs, rng_NextFloat(), rng_NextFloat(), sampleDir, c, pdf);
      // float pdf2 = sampleEnvironmentLightPdf(sampleDir);
      // contrib = vec3(abs(pdf-pdf2));//rs.closure.albedo;

      // // float pdf, pdf2;
      // // vec2 uv = mapDirToUV(sampleDir, pdf);
      // // vec3 dir = mapUVToDir(uv, pdf2);
      // // contrib = vec3(abs(pdf-pdf2));
      // // contrib = abs(dir-sampleDir);
    }
    if (u_int_DebugMode == 2)
      contrib = vec3(rs.closure.metallic);
    if (u_int_DebugMode == 3)
      contrib = vec3(rs.closure.alpha, 0.0);
    if (u_int_DebugMode == 4)
      contrib = rs.closure.n;
    if (u_int_DebugMode == 5) {
      contrib = rs.closure.t.xyz;
    }
    if (u_int_DebugMode == 6) {
      Geometry g = calculateBasis(rs.closure.n, rs.closure.t);
      contrib = g.b;
    }
    if (u_int_DebugMode == 7) {
      contrib = vec3(rs.closure.transparency);
    }
    if (u_int_DebugMode == 8) {
      contrib = vec3(rs.uv0, 0.0);
    }
    if (u_int_DebugMode == 9) {
      contrib = vec3(rs.closure.clearcoat);
    }
    if (u_int_DebugMode == 12) {
      contrib = vec3(rs.closure.specular);
    }
    if (u_int_DebugMode == 13) {
      contrib = rs.closure.specular_tint;
    }
    if (u_int_DebugMode == 14) {
      contrib = fresnel_schlick(rs.closure.specular_f0, rs.closure.specular_f90, dot(rs.closure.n, rs.wi));
    }
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_bool_ShowBackground) {
      if(u_int_DebugMode == 10) {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap_pdf, mapDirToUV(sampleDir, pdf)).xyz, 1.0) * 10.0;
      }
      else if(u_int_DebugMode == 11) {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap_cdf, mapDirToUV(sampleDir, pdf)).xyz, 1.0);
      }
      else {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap, mapDirToUV(sampleDir, pdf)).xyz, 1.0);
      }
    }
  }

  return color;
}
