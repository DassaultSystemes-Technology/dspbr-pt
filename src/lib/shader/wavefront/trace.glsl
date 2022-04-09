#version 300 es
precision highp int;
precision highp float;
precision highp sampler2D;

uniform sampler2D u_sampler_bvh;
uniform sampler2D u_sampler_triangle_data;
uniform sampler2D u_sampler_ray_dir;
uniform sampler2D u_sampler_ray_org;

layout(location = 0) out vec4 o_hitpos_matid; // vec3 pos, float matId
layout(location = 1) out vec4 o_shading_normal;
layout(location = 2) out vec4 o_geometry_normal;
layout(location = 3) out vec4 o_tangent;
layout(location = 4) out vec4 o_uv;

#include <constants>
#include <mesh_constants>
#include <utils>
#include <bvh>

void main() {
  vec3 ray_dir = texelFetch(u_sampler_ray_dir, ivec2(gl_FragCoord.xy), 0).xyz;
  vec3 ray_org = texelFetch(u_sampler_ray_org, ivec2(gl_FragCoord.xy), 0).xyz;

  bvh_ray ray = bvh_create_ray(ray_dir, ray_org, TFAR_MAX);

  bvh_hit hit;
  bool found_hit = bvh_intersect_nearest(ray, hit);

  uint triangle_idx = uint(hit.triIndex);

  vec3 p0, p1, p2;
  get_triangle(triangle_idx, p0, p1, p2);

  o_hitpos_matid.xyz = ray.org + ray.dir * hit.tfar;
  o_geometry_normal.xyz = compute_triangle_normal(p0, p1, p2);
  o_shading_normal.xyz = compute_interpolated_normal(triangle_idx, hit.uv);
  o_uv.xy = compute_interpolated_uv(triangle_idx, hit.uv, 0);
  o_tangent = compute_interpolated_tangent(triangle_idx, hit.uv, o_geometry_normal.xyz);

  o_hitpos_matid.w = found_hit ? float(get_material_idx(triangle_idx)) : -1.0;
}
