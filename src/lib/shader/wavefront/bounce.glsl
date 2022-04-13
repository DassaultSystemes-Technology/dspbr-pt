#version 300 es
precision highp int;
precision highp float;
precision highp sampler2D;
precision highp usampler2D;
precision highp sampler2DArray;

uniform float u_float_ray_eps;

uniform sampler2D u_sampler_hitpos_matid;
uniform sampler2D u_sampler_shading_normal;
uniform sampler2D u_sampler_geometry_normal;
uniform sampler2D u_sampler_tangent;
uniform sampler2D u_sampler_uv;
uniform sampler2D u_sampler_wi;
uniform sampler2D u_sampler_weight_pdf; // last bounce weight + pdf
uniform usampler2D u_sampler_rng_state;

// Env map buffers
uniform sampler2D u_sampler_env_map;
uniform sampler2D u_sampler_env_map_pdf;
uniform sampler2D u_sampler_env_map_cdf;
uniform sampler2D u_sampler_env_map_yPdf;
uniform sampler2D u_sampler_env_map_yCdf;

uniform ivec2 u_ibl_resolution;
uniform float u_ibl_rotation;

layout(location = 0) out vec4 out_weight_pdf; // current bounce weight + float pdf
layout(location = 1) out vec4 out_sample_org;
layout(location = 2) out vec4 out_sample_dir;
layout(location = 3) out vec4 out_light_sample_dir;
layout(location = 4) out uvec2 out_rng_state;
layout(location = 5) out vec4 out_radiance;

struct MaterialClosure {
  vec3 albedo;
  float transparency;
  float translucency;
  float cutout_opacity;
  float metallic;
  float specular;
  float f0;
  vec3 specular_f0;
  vec3 specular_f90;
  vec3 specular_tint;
  vec3 emission;
  vec3 normal;
  float sheen_roughness;
  vec3 sheen_color;
  vec2 alpha;
  float clearcoat;
  float clearcoat_alpha;
  bool thin_walled;
  bool double_sided;
  float attenuationDistance;
  vec3 attenuationColor;
  float ior;
  bool backside;
  vec3 n;
  vec3 ng;
  vec4 t;
  int event_type;
  float bsdf_selection_pdf;
  float iridescence;
  float iridescence_ior;
  float iridescence_thickness;
};

struct RenderState {
  vec3 hitPos;
  vec3 n;
  vec3 ng;
  vec4 tangent;
  vec3 wo;
  vec3 wi;
  vec2 uv0;
  vec2 uv1;
  MaterialClosure closure;
};

#include <rng>
#include <constants>
#include <material_constants>
#include <buffer_accessor>
#include <tex_array_lookup>
#include <utils>
#include <material>
#include <fresnel>
#include <diffuse>
#include <iridescence>
#include <microfacet>
#include <sheen>
#include <lighting>
#include <dspbr>

//TODO Optimize
bool sample_bsdf_bounce(inout RenderState rs, out vec3 o_sample_weight, out float o_sample_pdf) {
  bool ignore_backfaces = false;//(!rs.closure.double_sided && rs.closure.backside);

  if (rng_float() > rs.closure.cutout_opacity || ignore_backfaces) {
    rs.closure.event_type |= E_SINGULAR;
    rs.wo = -rs.wi;
    o_sample_pdf = 1.0;
    o_sample_weight = vec3(1.0);
    rs.closure.bsdf_selection_pdf = 1.0;
  }
  else {
    rs.wo = sample_dspbr(rs.closure, rs.wi,
                          vec3(rng_float(), rng_float(), rng_float()),
                          o_sample_weight, o_sample_pdf);

    if (o_sample_pdf < EPS_PDF) {
      o_sample_weight = vec3(0.0);
      o_sample_pdf = 0.0;
      return false;
    }
  }
  return true;
}


void main() {
  ivec2 frag_coord = ivec2(gl_FragCoord.xy);
  vec4 hitpos_matid = texelFetch(u_sampler_hitpos_matid, frag_coord, 0);
  vec4 wi = texelFetch(u_sampler_wi, frag_coord, 0);
  bool found_hit = wi.w > 0.0;


  // if(!found_hit) {
  //   out_radiance = vec4(eval_ibl(-wi.xyz), 1.0);
  //   // discard
  // }

  // Fetch path state from previous bounce
  uvec2 rng_state = texelFetch(u_sampler_rng_state, frag_coord, 0).xy;
  vec3 path_weight = texelFetch(u_sampler_weight_pdf, frag_coord, 0).xyz;
  vec3 radiance = texelFetch(u_sampler_weight_pdf, frag_coord, 0).xyz;
  rng_set_state(rng_state);

  RenderState rs;
  rs.hitPos = hitpos_matid.xyz;
  rs.n  = texelFetch(u_sampler_shading_normal, frag_coord, 0).xyz;
  rs.ng = texelFetch(u_sampler_geometry_normal, frag_coord, 0).xyz;
  rs.tangent = texelFetch(u_sampler_tangent, frag_coord, 0);
  rs.uv0 = texelFetch(u_sampler_uv, frag_coord, 0).xy;
  rs.uv1 = texelFetch(u_sampler_uv, frag_coord, 0).zw;
  rs.wi = wi.xyz;

  vec4 o_vertex_color;
  configure_material(uint(hitpos_matid.w), rs, rs.closure, o_vertex_color);

  radiance += rs.closure.emission;// * path_weight;

  float bsdf_rr = rng_float();
  float bsdf_selection_pdf;
  select_bsdf(rs.closure, bsdf_rr, rs.wi, bsdf_selection_pdf);

  float bounce_pdf;
  vec3 bounce_weight;
  bool absorbed = !sample_bsdf_bounce(rs, bounce_weight, bounce_pdf);

  out_weight_pdf = vec4(bounce_weight, bounce_pdf);
  out_sample_org = vec4(rs.hitPos + u_float_ray_eps * rs.ng, 1.0);
  out_sample_dir = vec4(rs.wo, absorbed ? 0.0 : 1.0);

  float ibl_sample_pdf;
  vec3 dir = sample_ibl_dir_importance(rng_float(), rng_float(), ibl_sample_pdf);

  out_light_sample_dir = vec4(dir, 1.0);
  out_rng_state = rng_get_state();
  out_radiance.xyz = radiance;
}
