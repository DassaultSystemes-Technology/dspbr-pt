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

#ifdef HAS_POINT_LIGHT
// For now, we only have 1 point light
vec3 sampleAndEvaluatePointLight(const in RenderState rs, inout float pdf) {
  vec3 n = rs.closure.n;
  vec3 light_dir = cPointLightPosition - rs.hitPos;
  float dist2 = dot(light_dir, light_dir);
  light_dir = normalize(light_dir);

  float cosNL = dot(light_dir, n);

  bool isVisible = isVisible(rs.hitPos + n * u_float_rayEps, cPointLightPosition);

  // bool transmit = false;
  // if (cosNL < 0.0 && rs.closure.transparency > 0.0)
  //   transmit = true;

  pdf = 1.0; // we just have one point light
  if (cosNL > 0.0 && isVisible) {
    return eval_dspbr(rs.closure, rs.wi, light_dir) * (cPointLightEmission / dist2) * cosNL;
  }

  return vec3(0);
}
#else
// For now, we only have 1 point light
vec3 sampleAndEvaluatePointLight(const in RenderState rs, inout float pdf) {
  pdf = 1.0;
  return vec3(0);
}
#endif

int sampleRow1D(sampler2D pdf, sampler2D cdf, int row, int size,
              inout float r, out float prop) 
{
  int idx = 0;
  float invProp = 1.0;
  // idx = binsearchCDF_rescale(cdf, row, size, r, invProp);
  idx = binsearchCDF(cdf, row, size, r);

  prop = texelFetch(pdf, ivec2(idx, row), 0).x;

  int x = idx;//int((1.0 - r) * float(idx) + r * (float(idx) + 1.0));
  if (x >= size)
  {
    x = size - 1; // to catch the corner case?
  }

  return x;
}

vec2 importanceSample(float r0, float r1, out float pdf)
{
  float pdfY = 1.0;
  float pdfX = 1.0;
  int w =  u_ivec2_IblResolution.x;
  int h =  u_ivec2_IblResolution.y;
  int y = sampleRow1D(u_sampler_EnvMap_yPdf, u_sampler_EnvMap_yCdf, 0, h, r1, pdfY);
  int x = sampleRow1D(u_sampler_EnvMap_pdf, u_sampler_EnvMap_cdf, y, w, r0, pdfX);

  float u = float(x)/float(w);
  float v = float(y)/float(h);
  pdf = float(w)*float(h)*pdfX*pdfY;

  return vec2(1.0-u, v);
}

vec3 sampleAndEvaluateEnvironmentLight(const in RenderState rs, float r0, float r1, out float pdf)
{
  vec3 contrib = vec3(0.0);
  float ibl_sample_p_w;
  vec2 uv = importanceSample(r0, r1, ibl_sample_p_w);
 
  float angular_pdf;
  if (ibl_sample_p_w > EPS_PDF) {
    vec3 iblDir = mapUVToDir(uv, angular_pdf);
    iblDir = transformIBLDir(iblDir, true);
    float light_pdf = ibl_sample_p_w;// * angular_pdf;

    bool isOccluded = isOccluded(rs.hitPos + rs.closure.n * u_float_rayEps, iblDir);
    float cosNL = dot(iblDir, rs.closure.n);
    if ((cosNL > EPS_COS) && !isOccluded) {
      float brdf_sample_p_w = dspbr_pdf(rs.closure, rs.wi, iblDir);
      if(brdf_sample_p_w > EPS_PDF && light_pdf > EPS_PDF) {
        float misWeight = misBalanceHeuristic(light_pdf, brdf_sample_p_w);
        contrib = eval_dspbr(rs.closure, rs.wi, iblDir) * texture(u_sampler_EnvMap, uv).xyz * cosNL /light_pdf;//* misWeight;
      }
    }
  }
  
  return contrib;
}

float sampleEnvironmentLightPdf(vec3 direction) {
  float angularPdf = 1.0;
  vec3 sampleDir = transformIBLDir(direction, false);
  vec2 uv = mapDirToUV(sampleDir, angularPdf);
  float w = float(u_ivec2_IblResolution.x);
  float h = float(u_ivec2_IblResolution.y);

  float x = min((uv.x)*w, w-1.0);
  float y = min((1.0-uv.y)*h, h-1.0);
  return w * h * texelFetch(u_sampler_EnvMap_yPdf, ivec2(y, 0), 0).x * texelFetch(u_sampler_EnvMap_pdf, ivec2(x, y), 0).x * angularPdf;
}
