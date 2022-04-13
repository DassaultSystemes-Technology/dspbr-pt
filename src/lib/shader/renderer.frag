#version 300 es
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

precision highp int;
precision highp float;
precision highp sampler2D;
precision highp sampler2DArray;

in vec2 v_uv;

 layout(std140) uniform PathTracingUniformBlock {
    mat4  u_mat4_ViewMatrix;
    vec4 u_BackgroundColor;
    vec4  u_vec3_CameraPosition;
    vec2  u_vec2_InverseResolution;
    ivec2 u_ibl_resolution;
    float u_int_FrameCount;
    float u_int_DebugMode;
    float u_int_SheenG;
    float u_bool_UseIBL;
    float u_ibl_rotation;
    float u_bool_ShowBackground;
    float u_max_bounces;
    float u_float_FocalLength;
    float u_bool_forceIBLEval;
    float u_float_ray_eps;
    float u_int_RenderMode;
    float  u_pad;
};

uniform sampler2D u_sampler2D_PreviousTexture;

// Pathracing data buffers
uniform sampler2D u_sampler_triangle_data;
uniform sampler2D u_sampler_bvh;

// Env map buffers
uniform sampler2D u_sampler_env_map;
uniform sampler2D u_sampler_env_map_pdf;
uniform sampler2D u_sampler_env_map_cdf;
uniform sampler2D u_sampler_env_map_yPdf;
uniform sampler2D u_sampler_env_map_yCdf;


layout(location = 0) out vec4 out_FragColor;

#include <structs>
#include <texture_accessor>
#include <rng>
#include <constants>
#include <utils>


#include <buffer_accessor>
#include <material_block>
#include <material>

#include <mesh_constants>
#include <bvh>

#include <fresnel>
#include <diffuse>
#include <iridescence>
#include <microfacet>
#include <sheen>
#include <dspbr>
#include <lighting>

const int RM_PT = 0;
const int RM_MISPTDL = 1;

///////////////////////////////////////////////////////////////////////////////
// Pathtracing Integrator Common
///////////////////////////////////////////////////////////////////////////////
void fillRenderState(const in bvh_ray r, const in bvh_hit hit, out RenderState rs) {
  rs.hitPos = r.org + r.dir * hit.tfar;

  uint triIdx = uint(hit.triIndex);

  // rs.uv1 = compute_interpolated_uv(hit.triIndex, hit.uv, 1);
  rs.wi = -r.dir;

  vec3 p0, p1, p2;
  get_triangle(triIdx, p0, p1, p2);
  rs.ng = compute_triangle_normal(p0, p1, p2);
  rs.n = compute_interpolated_normal(triIdx, hit.uv);

  rs.uv0 = compute_interpolated_uv(triIdx, hit.uv, 0);
  rs.tangent = compute_interpolated_tangent(triIdx, hit.uv, rs.n);

  vec4 vertexColor = calculateInterpolatedVertexColors(triIdx, hit.uv);

  uint matIdx = get_material_idx(triIdx);
  configure_material(matIdx, rs, rs.closure, vertexColor);

  float bsdf_selection_pdf;
  float rr_brdf = rng_float();
  select_bsdf(rs.closure, rr_brdf, rs.wi, bsdf_selection_pdf);
  rs.closure.bsdf_selection_pdf = bsdf_selection_pdf;
}


bool sample_bsdf_bounce(inout RenderState rs, out vec3 sampleWeight, out float pdf) {
  bool ignoreBackfaces = false;//(!rs.closure.double_sided && rs.closure.backside);

  if (rng_float() > rs.closure.cutout_opacity || ignoreBackfaces) {
    rs.closure.event_type |= E_SINGULAR;
    rs.wo = -rs.wi;
    pdf = 1.0;
    sampleWeight = vec3(1.0);
    rs.closure.bsdf_selection_pdf = 1.0;
  }
  else {
    rs.wo = sample_dspbr(rs.closure, rs.wi,
                          vec3(rng_float(), rng_float(), rng_float()),
                          sampleWeight, pdf);

    if (pdf < EPS_PDF) {
      sampleWeight = vec3(0.0);
      pdf = 0.0;
      return false; // teminate path
    }
  }

  return true;
}


bool check_russian_roulette_path_termination(int bounce, inout vec3 path_weight)
{
  if (bounce > RR_START_DEPTH) {
    float rr = rng_float();
    if(rr <= RR_TERMINATION_PROB) {
      return false;
    }
    path_weight *= 1.0 / (1.0 - RR_TERMINATION_PROB);
  }
}


#include <debug_integrator>
#include <pt_integrator>
#include <misptdl_integrator>

///////////////////////////////////////////////////////////////////////////////
// Ray Generation
///////////////////////////////////////////////////////////////////////////////
bvh_ray calcuateViewRay(float r0, float r1) {
  // box filter
  vec2 pixelOffset = vec2(r0, r1) * u_vec2_InverseResolution;

  float aspect = u_vec2_InverseResolution.y / u_vec2_InverseResolution.x;

  vec2 uv = (v_uv * vec2(aspect, 1.0) + pixelOffset) * u_vec3_CameraPosition.w;
  vec3 fragPosView = normalize(vec3(uv.x, uv.y, -u_float_FocalLength));

  fragPosView = mat3(u_mat4_ViewMatrix) * fragPosView;
  vec3 origin = u_vec3_CameraPosition.xyz;

  return bvh_create_ray(fragPosView, origin, TFAR_MAX);
}

void main() {
  rng_init(int(u_int_FrameCount) * int(u_max_bounces));

  bvh_ray r = calcuateViewRay(rng_float(), rng_float());

  vec4 contribution;
  if (int(u_int_RenderMode) == RM_PT)
    contribution = trace_pt(r);
  if (int(u_int_RenderMode) == RM_MISPTDL)
    contribution = trace_misptdl(r);
  if (int(u_int_DebugMode) > 0)
    contribution = trace_debug(r);

  vec4 previousFrameColor = texelFetch(u_sampler2D_PreviousTexture, ivec2(gl_FragCoord.xy), 0);
  contribution = (previousFrameColor * (u_int_FrameCount - 1.0) + contribution) / u_int_FrameCount;

  out_FragColor = contribution;
}
