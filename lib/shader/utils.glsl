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

struct Geometry {
  vec3 n, t, b;
};

float saturate(float val) {
  return clamp(val, 0.0, 1.0);
}

float saturate_cos(float val) {
  return clamp(val, EPS_COS, 1.0);
}

vec3 saturate(vec3 v) {
  return vec3(saturate(v.x), saturate(v.y), saturate(v.z));
}

float sqr(float x) {
  return x * x;
}

float sum(vec3 v) {
  return dot(vec3(1.0), v);
}

vec3 flip(vec3 v, vec3 n) {
  return normalize(v - 2.0 * n * abs(dot(v, n)));
}

bool isNan(float val) {
  return (val <= 0.0 || 0.0 <= val) ? false : true;
}

vec3 to_local(vec3 v, Geometry g) {
  return vec3(dot(v, g.t), dot(v, g.b), dot(v, g.n));
}

vec3 to_world(vec3 v, Geometry g) {
  return g.t * v.x + g.b * v.y + g.n * v.z;
}

bool refractIt(vec3 i, vec3 n, float inv_eta, out vec3 wo) {
  float cosi = dot(-i, n);
  float cost2 = 1.0 - inv_eta * inv_eta * (1.0 - cosi * cosi);
  vec3 t = inv_eta * i + ((inv_eta * cosi - sqrt(abs(cost2))) * n);
  if (cost2 <= 0.0) {
    return false;
  }
  wo = t;
  return true;
}

// Bends shading normal n into the direction of the geometry normal ng
// such that incident direction wi reflected at n does not change
// hemisphere
vec3 clamp_normal(vec3 n, vec3 ng, vec3 wi) {
  vec3 ns_new = n;
  vec3 r = reflect(-wi, n); // TODO CHECK
  float v_dot_ng = dot(wi, ng);
  float r_dot_ng = dot(r, ng);

  // if wi and r are in different hemisphere in respect of geometry normal
  if (v_dot_ng * r_dot_ng < 0.0) {
    float ns_dot_ng = abs(dot(n, ng));
    vec3 offset_vec = n * (-r_dot_ng / ns_dot_ng);
    vec3 r_corrected = normalize(r + offset_vec); // move r on horizon
    r_corrected =
        normalize(r_corrected + (ng * EPS_COS) * ((v_dot_ng > 0.0) ? 1.0 : -1.0)); // to avoid precision problems
    ns_new = normalize(wi + r_corrected);
    ns_new *= (dot(ns_new, n) < 0.0) ? -1.0 : 1.0;
  }
  return ns_new;
}

// Flips normal n and geometry normal ng such that they point into
// the direction of the given incident direction wi.
// This function should be called in each sample/eval function to prepare
// the tangent space in a way that the BSDF looks the same from top and
// bottom (two-sided materials).
bool fix_normals(inout vec3 n, inout vec3 ng, in vec3 wi) {
  bool backside = false;
  if (dot(wi, ng) < 0.0) {
    ng = -ng;
    backside = true;
  }
  if (dot(ng, n) < 0.0) {
    n = -n;
  }
  return backside;
}

vec3 fix_normal(in vec3 n, in vec3 wi) {
  return dot(n, wi) < 0.0 ? -n : n;
}

mat3 get_onb(vec3 n) {
  // from Spencer, Jones "Into the Blue", eq(3)
  vec3 tangent = normalize(cross(n, vec3(-n.z, n.x, -n.y)));
  vec3 bitangent = cross(n, tangent);
  return mat3(tangent, bitangent, n);
}

mat3 get_onb(vec3 n, vec3 t) {
  vec3 b = normalize(cross(n, t));
  vec3 tt = cross(b, n);
  return mat3(tt, b, n);
}

Geometry calculateBasis(vec3 n, vec4 t) {
  Geometry g;
  g.n = n;
  g.t = t.xyz;
  g.b = cross(n, t.xyz) * t.w;
  return g;
}

float computeTheta(vec3 dir) {
  return acos(max(-1.0, min(1.0, -dir.y)));
}

float computePhi(vec3 dir) {
  float temp = atan(dir.z, dir.x) + PI;
  if (temp < 0.0)
    return (2.0 * PI) + temp;
  else
    return temp;
}

vec3 fromThetaPhi(float theta, float phi) {
  return vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
}

vec2 mapDirToUV(vec3 dir) {
  float theta = computeTheta(dir);
  float u = (computePhi(dir)) / (2.0 * PI);
  float v = (PI - theta) / PI;
  // pdf = 1.0 / (2.0 * PI * PI * max(EPS_COS, sin(theta)));
  return vec2(u, v);
}

vec3 mapUVToDir(vec2 uv, out float pdf) {
  float theta = (uv.y * PI) - PI;
  float phi = (uv.x * (2.0f * PI));
  pdf = 1.0 / (2.0 * PI * PI * max(EPS_COS, sin(theta)));
  return fromThetaPhi(theta, phi);
}

vec3 sampleIBL(in vec3 dir) {
  vec3 sampleDir = mat3(cos(u_float_iblRotation), 0.0, sin(u_float_iblRotation), 0.0, 1.0, 0.0,
                        -sin(u_float_iblRotation), 0.0, cos(u_float_iblRotation)) *
                   dir;
  if (u_bool_UseIBL) {
    return texture(u_samplerCube_EnvMap, mapDirToUV(sampleDir)).xyz;
  }
  return vec3(0);
}

vec3 sampleHemisphereCosine(vec2 uv, out float pdf) {
  float phi = uv.y * 2.0 * PI;
  float cos_theta = sqrt(1.0 - uv.x);
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
  pdf = cos_theta * ONE_OVER_PI;
  return vec3(cos(phi) * sin_theta, sin(phi) * sin_theta, cos_theta);
}

// mat3 get_onb2(vec3 n) {
//     // http://orbit.dtu.dk/files/126824972/onb_frisvad_jgt2012_v2.pdf
//     vec3 b1, b2;
//     if (n.z < -0.9999999) // Handle the singularity
//     {
//         b1 = vec3(0.0, -1.0, 0.0);
//         b2 = vec3(-1.0, 0.0, 0.0);
//          return mat3(b1, b2, n);
//     }
//     float a = 1.0 / (1.0 + n.z);
//     float b = -n.x*n.y*a;
//     b1 = vec3(1.0f - n.x*n.x*a, -n.x, b);
//     b2 = vec3(b, 1.0 - n.y*n.y*a, -n.y);

//     return mat3(b1, b2, n);
// }

vec3 compute_triangle_normal(in vec3 p0, in vec3 p1, in vec3 p2) {
  vec3 e0 = p2 - p0;
  vec3 e1 = p1 - p0;
  return normalize(cross(e1, e0));
}

float max_(vec3 v) {
  return max(v.x, max(v.y, v.z));
}


vec4 rotation_to_tangent(float angle, vec3 normal, vec4 tangent) {
  if (angle > 0.0) {
    Geometry g = calculateBasis(normal, tangent);
    return vec4(g.t * cos(angle) + g.b * sin(angle), tangent.w);
  } else {
    return tangent;
  }
}

ivec2 getStructParameterTexCoord(uint structIdx, uint paramIdx, uint structStride) {
  return ivec2((structIdx * structStride + paramIdx) % MAX_TEXTURE_SIZE,
               (structIdx * structStride + paramIdx) / MAX_TEXTURE_SIZE);
}

vec3 to_linear_rgb(vec3 srgb) {
  return pow(srgb.xyz, vec3(2.2));
}