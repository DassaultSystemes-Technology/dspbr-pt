#version 300 es
precision highp int;
precision highp float;
precision highp sampler2D;

uniform sampler2D u_sampler_bvh;
uniform sampler2D u_sampler_ray_dir;
uniform sampler2D u_sampler_ray_org;
uniform sampler2D u_sampler_triangle_data;
uniform sampler2D u_sampler_light_sample_dir;

layout(location = 0) out vec4 o_hitpos_matid; // vec3 pos, float matId
layout(location = 1) out vec4 o_shading_normal;
layout(location = 2) out vec4 o_geometry_normal;
layout(location = 3) out vec4 o_tangent;
layout(location = 4) out vec4 o_uv;
layout(location = 5) out vec4 o_wi; // wi, found_hit

#include <constants>
#include <mesh_constants>
#include <buffer_accessor>
#include <utils>
#include <bvh>

void main() {
  vec3 ray_dir = texelFetch(u_sampler_ray_dir, ivec2(gl_FragCoord.xy), 0).xyz;
  vec3 ray_org = texelFetch(u_sampler_ray_org, ivec2(gl_FragCoord.xy), 0).xyz;
  vec3 light_sample_dir = texelFetch(u_sampler_light_sample_dir, ivec2(gl_FragCoord.xy), 0).xyz;

  bvh_ray ray = bvh_create_ray(ray_dir, ray_org, TFAR_MAX);

  bvh_hit hit;
  bool found_hit = bvh_intersect_nearest(ray, hit);
  uint triangle_idx = uint(hit.triIndex);

  vec3 p0, p1, p2;
  get_triangle(triangle_idx, p0, p1, p2);

  uint mat_idx = get_material_idx(triangle_idx);

  o_wi.xyz = -ray.dir;
  o_hitpos_matid.xyz = ray.org + ray.dir * hit.tfar;
  o_geometry_normal.xyz = compute_triangle_normal(p0, p1, p2);
  o_shading_normal.xyz = compute_interpolated_normal(triangle_idx, hit.uv);
  o_uv.xy = compute_interpolated_uv(triangle_idx, hit.uv, 0);
  o_tangent = compute_interpolated_tangent(triangle_idx, hit.uv, o_geometry_normal.xyz);

  bool occluded = isOccluded(light_sample_dir, ray.org);

  o_hitpos_matid.w = float(get_material_idx(triangle_idx));
  o_wi.w = found_hit ? 1.0 : 0.0;
}
