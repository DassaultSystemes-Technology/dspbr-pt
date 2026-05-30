/* @license
 * Copyright 2020  Dassault Systemes - All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// BVH node format: tinybvh bvh_gpu layout
// Each node occupies 4 RGBA texels (16 floats), no header.
//   texel n*4+0: (lmin.x, lmin.y, lmin.z, left)   — left child bounds + child index
//   texel n*4+1: (lmax.x, lmax.y, lmax.z, right)  — left child bounds + right child index
//   texel n*4+2: (rmin.x, rmin.y, rmin.z, cnt)    — right child bounds + triangle count (>0 = leaf)
//   texel n*4+3: (rmax.x, rmax.y, rmax.z, first)  — right child bounds + first triangle index

const int BVH_STACK_SIZE = 64;
const int MAX_BVH_TRAVERSAL_STEPS = 4096;
const int MAX_BVH_LEAF_TRIANGLES = 64;

struct bvh_ray {
  vec3 dir;
  vec3 org;
  float tfar;
  vec3 inv_dir;
};

struct bvh_hit {
  int triIndex;
  float tfar;
  vec2 uv;
};

bvh_ray bvh_create_ray(in vec3 direction, in vec3 origin, in float tfar) {
  return bvh_ray(direction, origin, tfar, vec3(1.0) / direction);
}

// Returns tmin of intersection, or BVH_FAR if miss.
// Handles NaN (parallel rays, degenerate AABBs) safely via explicit isnan guard.
float bvh_intersect_bounds(const in vec3 bmin, const in vec3 bmax,
                           const in vec3 org, const in vec3 inv_dir, const in float tfar) {
  vec3 t0 = (bmin - org) * inv_dir;
  vec3 t1 = (bmax - org) * inv_dir;
  vec3 lo = min(t0, t1);
  vec3 hi = max(t0, t1);
  float tmin = max(max(lo.x, lo.y), lo.z);
  float tmax = min(min(hi.x, hi.y), hi.z);
  if (isnan(tmin) || isnan(tmax) || tmin > tmax || tmax < 0.0 || tmin >= tfar) return BVH_FAR;
  return tmin;
}

// Moeller-Trumbore triangle intersection.
bool intersectTriangle(const in bvh_ray r, in vec3 p0, in vec3 p1, in vec3 p2,
                       const in float tfar, out float t, out vec2 uv) {
  vec3 e0 = p1 - p0;
  vec3 e1 = p2 - p0;
  vec3 pvec = cross(r.dir, e1);
  float det = dot(e0, pvec);
  if (abs(det) < EPS) return false;
  float f = 1.0 / det;
  vec3 s = r.org - p0;
  float u = f * dot(s, pvec);
  if (u < 0.0 || u > 1.0) return false;
  vec3 qvec = cross(s, e0);
  float v = f * dot(r.dir, qvec);
  if (v < 0.0 || u + v > 1.0) return false;
  t = f * dot(e1, qvec);
  if (t < EPS || t >= tfar) return false;
  uv = vec2(u, v);
  return true;
}

// --- Fetch a node texel (4 floats) from the BVH data texture.
// Node ni, texel offset within node [0..3].
vec4 bvh_fetch(int ni, int off) {
  int ti = ni * 4 + off;
  return texelFetch(u_sampler_bvh, ivec2(ti % int(MAX_TEXTURE_SIZE), ti / int(MAX_TEXTURE_SIZE)), 0);
}

// --- Fetch a remapped triangle index from the BVH index texture.
int get_mesh_triangle_index(int bvhTriIndex) {
  if (bvhTriIndex < 0 || bvhTriIndex >= NUM_BVH_INDICES) return -1;
  return int(texelFetch(u_sampler_bvh_index,
    ivec2(bvhTriIndex % int(MAX_TEXTURE_SIZE), bvhTriIndex / int(MAX_TEXTURE_SIZE)), 0).x);
}

uint get_material_idx(const uint triIndex) {
  ivec2 idx = getStructParameterTexCoord(triIndex, 0u, TRIANGLE_STRIDE);
  return uint(texelFetch(u_sampler_triangle_data, idx, 0).w);
}

void get_triangle(const in uint index, out vec3 p0, out vec3 p1, out vec3 p2) {
  ivec2 idx0 = getStructParameterTexCoord(index, POSITION_OFFSET, TRIANGLE_STRIDE);
  ivec2 idx1 = getStructParameterTexCoord(index, POSITION_OFFSET + VERTEX_STRIDE, TRIANGLE_STRIDE);
  ivec2 idx2 = getStructParameterTexCoord(index, POSITION_OFFSET + 2u * VERTEX_STRIDE, TRIANGLE_STRIDE);
  p0 = texelFetch(u_sampler_triangle_data, idx0, 0).xyz;
  p1 = texelFetch(u_sampler_triangle_data, idx1, 0).xyz;
  p2 = texelFetch(u_sampler_triangle_data, idx2, 0).xyz;
}

vec3 compute_interpolated_normal(const in uint index, const in vec2 uv) {
  ivec2 idx0 = getStructParameterTexCoord(index, NORMAL_OFFSET, TRIANGLE_STRIDE);
  ivec2 idx1 = getStructParameterTexCoord(index, NORMAL_OFFSET + VERTEX_STRIDE, TRIANGLE_STRIDE);
  ivec2 idx2 = getStructParameterTexCoord(index, NORMAL_OFFSET + 2u * VERTEX_STRIDE, TRIANGLE_STRIDE);
  vec3 n0 = texelFetch(u_sampler_triangle_data, idx0, 0).xyz;
  vec3 n1 = texelFetch(u_sampler_triangle_data, idx1, 0).xyz;
  vec3 n2 = texelFetch(u_sampler_triangle_data, idx2, 0).xyz;
  return normalize((1.0 - uv.x - uv.y) * n0 + uv.x * n1 + uv.y * n2);
}

vec2 compute_interpolated_uv(const in uint index, const in vec2 hit_uv, int set) {
  ivec2 idx0 = getStructParameterTexCoord(index, UV_OFFSET, TRIANGLE_STRIDE);
  ivec2 idx1 = getStructParameterTexCoord(index, UV_OFFSET + VERTEX_STRIDE, TRIANGLE_STRIDE);
  ivec2 idx2 = getStructParameterTexCoord(index, UV_OFFSET + 2u * VERTEX_STRIDE, TRIANGLE_STRIDE);
  vec4 uv0 = texelFetch(u_sampler_triangle_data, idx0, 0);
  vec4 uv1 = texelFetch(u_sampler_triangle_data, idx1, 0);
  vec4 uv2 = texelFetch(u_sampler_triangle_data, idx2, 0);
  if (set == 0)
    return (1.0 - hit_uv.x - hit_uv.y) * uv0.xy + hit_uv.x * uv1.xy + hit_uv.y * uv2.xy;
  else
    return (1.0 - hit_uv.x - hit_uv.y) * uv0.zw + hit_uv.x * uv1.zw + hit_uv.y * uv2.zw;
}

vec4 compute_interpolated_tangent(const in uint index, const in vec2 uv, vec3 n) {
  ivec2 idx0 = getStructParameterTexCoord(index, TANGENT_OFFSET, TRIANGLE_STRIDE);
  ivec2 idx1 = getStructParameterTexCoord(index, TANGENT_OFFSET + VERTEX_STRIDE, TRIANGLE_STRIDE);
  ivec2 idx2 = getStructParameterTexCoord(index, TANGENT_OFFSET + 2u * VERTEX_STRIDE, TRIANGLE_STRIDE);
  vec4 t0 = texelFetch(u_sampler_triangle_data, idx0, 0);
  vec4 t1 = texelFetch(u_sampler_triangle_data, idx1, 0);
  vec4 t2 = texelFetch(u_sampler_triangle_data, idx2, 0);
  float handedness = (t0.w == t1.w && t0.w == t2.w) ? t0.w : 0.0;
  vec3 tangent = normalize((1.0 - uv.x - uv.y) * t0.xyz + uv.x * t1.xyz + uv.y * t2.xyz);
  if (length(tangent) > 0.99 && abs(handedness) > 0.99)
    return vec4(tangent, -handedness);
  return vec4(get_onb(n)[0], 1.0);
}

vec4 calculateInterpolatedVertexColors(const in uint index, const in vec2 hit_uv) {
  ivec2 idx0 = getStructParameterTexCoord(index, COLOR_OFFSET, TRIANGLE_STRIDE);
  ivec2 idx1 = getStructParameterTexCoord(index, COLOR_OFFSET + VERTEX_STRIDE, TRIANGLE_STRIDE);
  ivec2 idx2 = getStructParameterTexCoord(index, COLOR_OFFSET + 2u * VERTEX_STRIDE, TRIANGLE_STRIDE);
  vec4 c0 = texelFetch(u_sampler_triangle_data, idx0, 0);
  vec4 c1 = texelFetch(u_sampler_triangle_data, idx1, 0);
  vec4 c2 = texelFetch(u_sampler_triangle_data, idx2, 0);
  return (1.0 - hit_uv.x - hit_uv.y) * c0 + hit_uv.x * c1 + hit_uv.y * c2;
}

// --- tinybvh bvh_gpu traversal ---
bool bvh_valid_node(int ni) {
  return ni >= 0 && ni < NUM_BVH_NODES;
}

void bvh_push_child(inout int stack[BVH_STACK_SIZE], inout int top, int child, int parent) {
  if (top < BVH_STACK_SIZE && bvh_valid_node(child) && child != parent) {
    stack[top++] = child;
  }
}

// Stack-pop traversal with a hard iteration cap. This avoids GPU watchdog hangs
// if malformed BVH data creates a cycle or an unexpectedly deep tree.
bool intersectSceneTriangles_BVH(const in bvh_ray r, out bvh_hit hit) {
  hit.tfar     = r.tfar;
  hit.triIndex = -1;

  int stack[BVH_STACK_SIZE];
  int top  = 1;
  stack[0] = 0; // push root (node 0)

  for (int step = 0; step < MAX_BVH_TRAVERSAL_STEPS && top > 0; step++) {
    int ni = stack[--top];
    if (!bvh_valid_node(ni)) continue;

    vec4 n0 = bvh_fetch(ni, 0); // (lmin.xyz, left)
    vec4 n1 = bvh_fetch(ni, 1); // (lmax.xyz, right)
    vec4 n2 = bvh_fetch(ni, 2); // (rmin.xyz, cnt)
    vec4 n3 = bvh_fetch(ni, 3); // (rmax.xyz, first)

    int cnt   = int(n2.w);
    int first = int(n3.w);

    if (cnt > 0) {
      // Leaf: test triangles [first, first + cnt)
      int end = min(first + min(cnt, MAX_BVH_LEAF_TRIANGLES), NUM_BVH_INDICES);
      for (int i = first; i < end; i++) {
        int idx = get_mesh_triangle_index(i);
        if (idx < 0 || idx >= int(NUM_TRIANGLES)) continue;
        vec3 p0, p1, p2;
        get_triangle(uint(idx), p0, p1, p2);
        float t; vec2 uv;
        if (intersectTriangle(r, p0, p1, p2, hit.tfar, t, uv)) {
          hit.tfar     = t;
          hit.triIndex = idx;
          hit.uv       = uv;
        }
      }
    } else {
      // Internal: test both child AABBs, push hit children (farther first)
      int  left  = int(n0.w);
      int  right = int(n1.w);
      vec3 lmin  = n0.xyz, lmax = n1.xyz;
      vec3 rmin  = n2.xyz, rmax = n3.xyz;

      float d0 = bvh_intersect_bounds(lmin, lmax, r.org, r.inv_dir, hit.tfar);
      float d1 = bvh_intersect_bounds(rmin, rmax, r.org, r.inv_dir, hit.tfar);

      // Push farther child first so nearer is processed next (front-to-back)
      if (d0 < BVH_FAR && d1 < BVH_FAR) {
        if (d0 < d1) {
          bvh_push_child(stack, top, right, ni);
          bvh_push_child(stack, top, left, ni);
        } else {
          bvh_push_child(stack, top, left, ni);
          bvh_push_child(stack, top, right, ni);
        }
      } else if (d0 < BVH_FAR) {
        bvh_push_child(stack, top, left, ni);
      } else if (d1 < BVH_FAR) {
        bvh_push_child(stack, top, right, ni);
      }
    }
  }

  return hit.triIndex >= 0;
}

bool bvh_intersect_nearest(const in bvh_ray r, out bvh_hit hit) {
  return intersectSceneTriangles_BVH(r, hit);
}

bool isVisible(const in vec3 p0, const in vec3 p1) {
  vec3 d = p1 - p0;
  bvh_ray r = bvh_create_ray(normalize(d), p0, length(d));
  bvh_hit hit;
  return !bvh_intersect_nearest(r, hit);
}

bool isOccluded(const in vec3 p0, const in vec3 dir) {
  bvh_ray r = bvh_create_ray(normalize(dir), p0, TFAR_MAX);
  bvh_hit hit;
  return bvh_intersect_nearest(r, hit);
}
