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
vec3 sampleAndEvaluatePointLight(const in RenderState rs) {
  vec3 n = rs.closure.n;
  vec3 light_dir = cPointLightPosition - rs.hitPos;
  float dist2 = dot(light_dir, light_dir);
  light_dir = normalize(light_dir);

  float cosNL = dot(light_dir, n);

  bool isVisible = isVisible(rs.hitPos + n * u_float_rayEps, cPointLightPosition);

  // bool transmit = false;
  // if (cosNL < 0.0 && rs.closure.transparency > 0.0)
  //   transmit = true;

  vec3 contrib = vec3(0.0);
  if (cosNL > EPS_COS && isVisible) {
    contrib = eval_dspbr(rs.closure, rs.wi, light_dir) * (cPointLightEmission / dist2) * cosNL;
  }

  return contrib;
}
#else
// For now, we only have 1 point light
vec3 sampleAndEvaluatePointLight(const in RenderState rs) {
  return vec3(0);
}
#endif


vec3 transformIBLDir(vec3 dir, bool inverse) {
  float angle = inverse ? -u_float_iblRotation : u_float_iblRotation;
  return mat3(cos(angle), 0.0, sin(angle), 0.0, 1.0, 0.0,
              -sin(angle), 0.0, cos(angle)) * dir;
}

vec3 evaluateIBL(in vec3 dir) {
  float pdf;
  vec3 sampleDir = transformIBLDir(dir, false);
  vec2 uv = mapDirToUV(sampleDir, pdf);
  return texture(u_sampler_EnvMap, vec2(uv.x, uv.y)).xyz;
}


int sampleRow1D(sampler2D pdf, sampler2D cdf, int row, int size,
              inout float r, out float prop)
{
  int idx = 0;
  float invProp = 1.0;
  idx = binsearchCDF_rescale(cdf, row, size, r, invProp);
  // idx = binsearchCDF(cdf, row, size, r);

  prop = texelFetch(pdf, ivec2(idx, row), 0).x;

  int x = idx;//int((1.0 - r) * float(idx) + r * (float(idx) + 1.0));
  if (x >= size)
  {
    x = size - 1;
  }

  return x;
}

ivec2 importanceSample(float r0, float r1, out float pdf)
{
  float pdfY = 1.0;
  float pdfX = 1.0;
  int w =  u_ivec2_IblResolution.x;
  int h =  u_ivec2_IblResolution.y;
  int y = sampleRow1D(u_sampler_EnvMap_yPdf, u_sampler_EnvMap_yCdf, 0, h, r1, pdfY);
  int x = sampleRow1D(u_sampler_EnvMap_pdf, u_sampler_EnvMap_cdf, y, w, r0, pdfX);

  pdf = float(w)*float(h)*pdfY*pdfX;
  return ivec2(x, y);
}

bool sampleAndEvaluateEnvironmentLight(const in RenderState rs, float r0, float r1,
  out vec3 sampleDir, out vec3 contrib, out float pdf)
{
  contrib = vec3(0.0);

  float iblSamplePdf;

  ivec2 xy = importanceSample(r0, r1, iblSamplePdf);
  vec2 uv = vec2(xy) / vec2(u_ivec2_IblResolution.x, u_ivec2_IblResolution.y);

  float angularPdf;
  sampleDir = transformIBLDir(mapUVToDir(uv, angularPdf), true);
  pdf = iblSamplePdf * angularPdf;

  bool valid_sample = false;
  if(pdf > EPS_PDF) {
    float cosNL = dot(sampleDir, rs.closure.n);
    if(bool(rs.closure.event_type & (E_REFLECTION | E_DIFFUSE)) && cosNL > EPS_COS) {
      if(!isOccluded(rs.hitPos + rs.closure.n * u_float_rayEps, sampleDir)) {
        contrib =  eval_dspbr(rs.closure, rs.wi, sampleDir) * texture(u_sampler_EnvMap, uv).xyz * cosNL;
        valid_sample = true;
      }
    }
    else if(bool(rs.closure.event_type & E_TRANSMISSION) && cosNL < EPS_COS) {
      if(!isOccluded(rs.hitPos - rs.closure.n * u_float_rayEps, sampleDir)) {
        contrib = eval_dspbr(rs.closure, rs.wi, sampleDir) * texture(u_sampler_EnvMap, uv).xyz * -cosNL;
        valid_sample = true;
      }
    }
 }

  return valid_sample;
}

float sampleEnvironmentLightPdf(vec3 direction) {
  float angularPdf;
  vec3 sampleDir = transformIBLDir(direction, false);
  vec2 uv = mapDirToUV(sampleDir, angularPdf);
  float w = float(u_ivec2_IblResolution.x);
  float h = float(u_ivec2_IblResolution.y);

  float x = min((uv.x)*w, w-1.0);
  float y = min((uv.y)*h, h-1.0);
  return w * h * texelFetch(u_sampler_EnvMap_yPdf, ivec2(y, 0), 0).x * texelFetch(u_sampler_EnvMap_pdf, ivec2(x, y), 0).x * angularPdf;
}
