#version 300 es
precision highp int;
precision highp float;
precision highp sampler2D;
precision highp sampler2DArray;

uniform sampler2D u_sampler_hitpos_matid;
uniform sampler2D u_sampler_shading_normal;
uniform sampler2D u_sampler_geometry_normal;
uniform sampler2D u_sampler_tangent;
uniform sampler2D u_sampler_uv;
uniform sampler2D u_sampler_indir;

layout(location = 0) out vec4 out_weight_pdf; // vec3 weight, float pdf
layout(location = 1) out vec4 out_sample_org;
layout(location = 2) out vec4 out_sample_dir;

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
  vec3 normal;
  vec3 geometryNormal;
  vec4 tangent;
  vec3 wo;
  vec3 wi;
  vec2 uv0;
  vec2 uv1;
  MaterialClosure closure;
};

#include <constants>
#include <material_constants>
#include <tex_array_lookup>
#include <utils>
#include <material>
#include <fresnel>
#include <diffuse>
#include <iridescence>
#include <microfacet>
#include <sheen>
#include <dspbr>


void main() {
  ivec2 frag_coord = ivec2(gl_FragCoord.xy);
  vec4 hitpos_matid = texelFetch(u_sampler_hitpos_matid, frag_coord, 0);

  RenderState rs;
  rs.hitPos = hitpos_matid.xyz;
  rs.normal  = texelFetch(u_sampler_shading_normal, frag_coord, 0).xyz;
  rs.geometryNormal = texelFetch(u_sampler_geometry_normal, frag_coord, 0).xyz;
  rs.tangent = texelFetch(u_sampler_tangent, frag_coord, 0);
  rs.uv0 = texelFetch(u_sampler_uv, frag_coord, 0).xy;
  rs.uv1 = texelFetch(u_sampler_uv, frag_coord, 0).zw;
  rs.wi = -texelFetch(u_sampler_indir, frag_coord, 0).xyz;

  vec4 o_vertex_color;
  configure_material(uint(hitpos_matid.w), rs, rs.closure, o_vertex_color);

  // float bsdf_selection_pdf;
  // float rr_brdf = rng_NextFloat();
  // importanceSampleBsdf(rs.closure, rr_brdf, rs.wi, bsdf_selection_pdf);

  out_weight_pdf = vec4(rs.closure.albedo, 1.0);
  out_sample_org = BLACK;
  out_sample_dir = BLACK;
}