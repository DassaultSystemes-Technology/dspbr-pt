// /* @license
//  * Copyright 2022  Dassault Systemes - All Rights Reserved.
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// #ifdef HAS_POINT_LIGHT
// // For now, we only have 1 point light
// vec3 sampleAndEvaluatePointLight(const in RenderState rs) {
//   vec3 n = rs.closure.n;
//   vec3 light_dir = cPointLightPosition - rs.hitPos;
//   float dist2 = dot(light_dir, light_dir);
//   light_dir = normalize(light_dir);

//   float cosNL = dot(light_dir, n);

//   bool isVisible = isVisible(rs.hitPos + n * u_ray_eps, cPointLightPosition);

//   // bool transmit = false;
//   // if (cosNL < 0.0 && rs.closure.transparency > 0.0)
//   //   transmit = true;

//   vec3 contrib = vec3(0.0);
//   if (cosNL > EPS_COS && isVisible) {
//     contrib = eval_dspbr(rs.closure, rs.wi, light_dir) * (cPointLightEmission / dist2) * cosNL;
//   }

//   return contrib;
// }
// #else
// // For now, we only have 1 point light
// vec3 sampleAndEvaluatePointLight(const in RenderState rs) {
//   return vec3(0);
// }
// #endif

int sampleRow1D(sampler2D pdf, sampler2D cdf, int row, int size, inout float r, out float prop) {
  int idx = 0;
  float invProp = 1.0;
  idx = binsearchCDF_rescale(cdf, row, size, r, invProp);
  // idx = binsearchCDF(cdf, row, size, r);

  prop = texelFetch(pdf, ivec2(idx, row), 0).x;

  int x = idx; // int((1.0 - r) * float(idx) + r * (float(idx) + 1.0));
  if (x >= size) {
    x = size - 1;
  }

  return x;
}

ivec2 ibl_sample_pixel(float r0, float r1, out float o_sample_pdf) {
  float pdfY = 1.0;
  float pdfX = 1.0;
  int w = int(u_ibl_resolution.x);
  int h = int(u_ibl_resolution.y);
  int y = sampleRow1D(u_sampler_env_map_yPdf, u_sampler_env_map_yCdf, 0, h, r1, pdfY);
  int x = sampleRow1D(u_sampler_env_map_pdf, u_sampler_env_map_cdf, y, w, r0, pdfX);

  o_sample_pdf = float(w) * float(h) * pdfY * pdfX;
  return ivec2(x, y);
}

vec3 rotate_dir_phi(vec3 dir, bool inverse) {
  float angle = inverse ? -u_ibl_rotation : u_ibl_rotation;
  mat3 m = mat3(
    cos(angle), 0.0, sin(angle),
    0.0, 1.0, 0.0,
    -sin(angle), 0.0, cos(angle));
  return m * dir;
}

vec3 ibl_sample_direction(float r0, float r1, out float o_sample_pdf) {
  float sample_pdf;
  ivec2 xy = ibl_sample_pixel(r0, r1, sample_pdf);
  vec2 uv = vec2(xy) / u_ibl_resolution;

  float angular_pdf;
  vec3 sample_dir = rotate_dir_phi(uv_to_dir(uv, angular_pdf), true);
  o_sample_pdf = sample_pdf * angular_pdf;

  return sample_dir;
}

vec3 ibl_eval(vec3 dir) {
  float pdf; // TODO needs multiply?
  vec3 sample_dir = rotate_dir_phi(dir, false);
  vec2 uv = dir_to_uv(sample_dir, pdf);
  return texture(u_sampler_env_map, uv).xyz;
}

float ibl_pdf(vec3 dir) {
  float pdf_w;
  vec3 sample_dir = rotate_dir_phi(dir, false);
  vec2 uv = dir_to_uv(sample_dir, pdf_w);
  float w = u_ibl_resolution.x;
  float h = u_ibl_resolution.y;

  float x = min((uv.x) * w, w - 1.0);
  float y = min((uv.y) * h, h - 1.0);
  return w * h * texelFetch(u_sampler_env_map_yPdf, ivec2(y, 0), 0).x *
         texelFetch(u_sampler_env_map_pdf, ivec2(x, y), 0).x * pdf_w;
}

