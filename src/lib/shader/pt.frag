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
// precision lowp isampler2D;

#include <pathtracing_defines>

in vec2 v_uv;

uniform int u_int_FrameCount;
uniform float u_float_FilmHeight;
uniform float u_float_FocalLength;
uniform vec3 u_vec3_CameraPosition;
uniform vec2 u_vec2_InverseResolution;
uniform mat4 u_mat4_ViewMatrix;
uniform int u_int_maxBounces;
uniform bool u_bool_forceIBLEval;
uniform float u_float_iblRotation;
uniform float u_float_rayEps;

uniform sampler2D u_sampler2D_PreviousTexture;

uniform sampler2D u_sampler2D_TriangleData;
uniform sampler2D u_sampler2D_BVHData;
uniform sampler2D u_sampler2D_MaterialData;
uniform sampler2D u_sampler2D_MaterialTexInfoData;
uniform sampler2D u_sampler_EnvMap;
uniform sampler2D u_sampler_EnvMap_pdf;
uniform sampler2D u_sampler_EnvMap_cdf;
uniform sampler2D u_sampler_EnvMap_yPdf;
uniform sampler2D u_sampler_EnvMap_yCdf;
uniform ivec2 u_ivec2_IblResolution;

#include <pathtracing_lights>

uniform int u_int_DebugMode;
uniform int u_int_RenderMode;
uniform bool u_bool_UseIBL;
uniform bool u_bool_ShowBackground;
uniform vec4 u_BackgroundColor;

layout(location = 0) out vec4 out_FragColor;

struct MaterialData {
  // 0
  vec3 albedo;
  float metallic;

  // 1
  float roughness;
  float anisotropy;
  float anisotropyRotation;
  float transparency;

  // 2
  float cutoutOpacity;
  bool doubleSided;
  float normalScale;
  float ior;

  // 3
  float specular;
  vec3 specularTint;

  // 4
  float sheenRoughness;
  vec3 sheenColor;

  // 5
  float normalScaleClearcoat;
  vec3 emission;

  // 6
  float clearcoat;
  float clearcoatRoughness;
  float translucency;
  float alphaCutoff;

  // 8
  float attenuationDistance;
  vec3 attenuationColor;

  // 9
  vec3 subsurfaceColor;
  bool thinWalled;

  // 10
  vec3 anisotropyDirection;
  float pad;

  // 11
  float iridescence;
  float iridescenceIor;
  float iridescenceThicknessMinimum;
  float iridescenceThicknessMaximum;
};

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

// struct Light {
//     vec3 position;
//     float type;
//     vec3 emission;
//     float pad;
// };

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

struct TexInfo {
  int texArrayIdx;
  int texIdx;
  int texCoordSet;
  int pad;
  vec2 texOffset;
  vec2 texScale;
};

#include <pathtracing_rng>
#include <pathtracing_utils>
#include <pathtracing_tex_array_lookup>
#include <pathtracing_material>
#include <pathtracing_rt_kernel>


#include <pathtracing_dspbr>
#include <lighting>


const int RM_PT = 0;
const int RM_MISPTDL = 1;
const int RM_PTDL = 2;

///////////////////////////////////////////////////////////////////////////////
// Pathtracing Integrator
///////////////////////////////////////////////////////////////////////////////
void fillRenderState(const in Ray r, const in HitInfo hit, out RenderState rs) {
  rs.hitPos = r.org + r.dir * hit.tfar;

  uint triIdx = uint(hit.triIndex);

  // rs.uv1 = calculateInterpolatedUV(hit.triIndex, hit.uv, 1);
  rs.wi = -r.dir;

  vec3 p0, p1, p2;
  getSceneTriangle(triIdx, p0, p1, p2);
  rs.geometryNormal = compute_triangle_normal(p0, p1, p2);
  rs.normal = calculateInterpolatedNormal(triIdx, hit.uv);

  rs.uv0 = calculateInterpolatedUV(triIdx, hit.uv, 0);
  rs.tangent = calculateInterpolatedTangent(triIdx, hit.uv, rs.normal);

  vec4 vertexColor = calculateInterpolatedVertexColors(triIdx, hit.uv);

  uint matIdx = getMaterialIndex(triIdx);
  configure_material(matIdx, rs, rs.closure, vertexColor);

  float bsdf_selection_pdf;
  float rr_brdf = rng_NextFloat();
  importanceSampleBsdf(rs.closure, rr_brdf, rs.wi, bsdf_selection_pdf);
  rs.closure.bsdf_selection_pdf = bsdf_selection_pdf;
}

vec4 traceDebug(const Ray r) {
  HitInfo hit;

  vec4 color = vec4(0);
  if (intersectScene_Nearest(r, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(r, hit, rs);

    if (u_int_DebugMode == 1) {
      contrib = vec3(rs.closure.albedo);
      // vec3 sampleDir = normalize(vec3(rng_NextFloat(), rng_NextFloat(),rng_NextFloat()));
      // float pdf;
      // vec3 c;
      // sampleAndEvaluateEnvironmentLight(rs, rng_NextFloat(), rng_NextFloat(), sampleDir, c, pdf);
      // float pdf2 = sampleEnvironmentLightPdf(sampleDir);
      // contrib = vec3(abs(pdf-pdf2));//rs.closure.albedo;

      // // float pdf, pdf2;
      // // vec2 uv = mapDirToUV(sampleDir, pdf);
      // // vec3 dir = mapUVToDir(uv, pdf2);
      // // contrib = vec3(abs(pdf-pdf2));
      // // contrib = abs(dir-sampleDir);
    }
    if (u_int_DebugMode == 2)
      contrib = vec3(rs.closure.metallic);
    if (u_int_DebugMode == 3)
      contrib = vec3(rs.closure.alpha, 0.0);
    if (u_int_DebugMode == 4)
      contrib = rs.closure.n;
    if (u_int_DebugMode == 5) {
      contrib = rs.closure.t.xyz;
    }
    if (u_int_DebugMode == 6) {
      Geometry g = calculateBasis(rs.closure.n, rs.closure.t);
      contrib = g.b;
    }
    if (u_int_DebugMode == 7) {
      contrib = vec3(rs.closure.transparency);
    }
    if (u_int_DebugMode == 8) {
      contrib = vec3(rs.uv0, 0.0);
    }
    if (u_int_DebugMode == 9) {
      contrib = vec3(rs.closure.clearcoat);
    }
    if (u_int_DebugMode == 12) {
      contrib = vec3(rs.closure.specular);
    }
    if (u_int_DebugMode == 13) {
      contrib = rs.closure.specular_tint;
    }
    if (u_int_DebugMode == 14) {
      contrib = fresnel_schlick(rs.closure.specular_f0, rs.closure.specular_f90, dot(rs.closure.n, rs.wi));
    }
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_bool_ShowBackground) {
      if(u_int_DebugMode == 10) {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap_pdf, mapDirToUV(sampleDir, pdf)).xyz, 1.0) * 10.0;
      }
      else if(u_int_DebugMode == 11) {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap_cdf, mapDirToUV(sampleDir, pdf)).xyz, 1.0);
      }
      else {
        vec3 sampleDir = transformIBLDir(r.dir, false);
        float pdf;
        color = vec4(texture(u_sampler_EnvMap, mapDirToUV(sampleDir, pdf)).xyz, 1.0);
      }
    }
  }

  return color;
}


bool sampleBSDFBounce(inout RenderState rs, out vec3 sampleWeight, out float pdf) {
  bool ignoreBackfaces = false;//(!rs.closure.double_sided && rs.closure.backside);

  if (rng_NextFloat() > rs.closure.cutout_opacity || ignoreBackfaces) {
    rs.closure.event_type |= E_SINGULAR;
    rs.wo = -rs.wi;
    Ray r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * u_float_rayEps, TFAR_MAX);
    HitInfo hit;
    pdf = 1.0;
    sampleWeight = vec3(1.0);
  }
  else {
    rs.wo = sample_dspbr(rs.closure, rs.wi,
                          vec3(rng_NextFloat(), rng_NextFloat(), rng_NextFloat()),
                          sampleWeight, pdf);

    if (pdf < EPS_PDF) {
      sampleWeight = vec3(0.0);
      pdf = 0.0;
      return false; // teminate path
    }
  }

  return true;
}


// void unpackLightData(uint lightIdx, out Light light) {
//     vec4 val;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 0u, LIGHT_SIZE),
//     0); light.position = val.xyz; light.type = val.w; val = texelFetch(u_sampler2D_LightData,
//     getStructParameterTexCoord(lightIdx, 1u, LIGHT_SIZE), 0); light.emission = val.xyz;
// }

vec4 trace(const Ray r) {
  HitInfo hit;

  vec3 pathWeight = vec3(1.0);
  vec4 color = vec4(0);

  if (intersectScene_Nearest(r, hit)) { // primary camera ray
    vec3 contrib = vec3(0);

    RenderState rs;
    fillRenderState(r, hit, rs);
    bool lastBounceSpecular = false;

    int i = 0;
    while (i <= u_int_maxBounces || lastBounceSpecular) {

      //start russion roulette path termination for bounce depth > 2
      if (i > RR_START_DEPTH) {
        float rr = rng_NextFloat();
        if(rr <= RR_TERMINATION_PROB) {
          break;
        }
        pathWeight *= 1.0 / (1.0 - RR_TERMINATION_PROB);
      }

      contrib += rs.closure.emission * pathWeight;

      lastBounceSpecular = bool(rs.closure.event_type & E_SINGULAR);

      bool hasDirectLightContribution = false;
      if(!lastBounceSpecular && u_int_RenderMode != RM_PT ) {
        contrib += sampleAndEvaluatePointLight(rs);

        float iblSamplePdf;
        vec3 iblDir;
        vec3 iblContribution;

        if(u_bool_UseIBL && sampleAndEvaluateEnvironmentLight(rs, rng_NextFloat(),
              rng_NextFloat(), iblDir, iblContribution, iblSamplePdf))
        {
          if(u_int_RenderMode == RM_PTDL) {
            contrib += iblContribution * pathWeight / iblSamplePdf;
          }
          else { // RM_MISPTDL
            float brdfSamplePdf = dspbr_pdf(rs.closure, rs.wi, iblDir) * rs.closure.bsdf_selection_pdf;
            if(iblSamplePdf > EPS_PDF && brdfSamplePdf > EPS_PDF) {
              float misWeight = misBalanceHeuristic(iblSamplePdf, brdfSamplePdf);
              contrib += iblContribution * pathWeight * misWeight;
            }
          }
        }
      }

      // Next bounce
      vec3 bounceWeight;
      float lastBouncePdf;
      if(!sampleBSDFBounce(rs, bounceWeight, lastBouncePdf)) {
        break; //absorped
      }

      pathWeight *= bounceWeight / rs.closure.bsdf_selection_pdf;

      Ray r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * u_float_rayEps, TFAR_MAX);
      HitInfo hit;

      if (intersectScene_Nearest(r, hit)) {
        fillRenderState(r, hit, rs);

        // Absorption
        if(rs.closure.backside) { //&& !rs.closure.thin_walled) {
          vec3 absorptionCoefficient = -log(rs.closure.attenuationColor) / rs.closure.attenuationDistance;
          pathWeight *= exp(-absorptionCoefficient*hit.tfar);
        }
      } else { // environment hit
        if(u_bool_UseIBL)
        {
          if(u_int_RenderMode == RM_PT || (u_int_RenderMode == RM_PTDL)) {
            contrib += evaluateIBL(rs.wo) * pathWeight;
          }
          else if(u_int_RenderMode == RM_MISPTDL){
            float iblSamplePdf = sampleEnvironmentLightPdf(rs.wo);
            float misWeight = lastBounceSpecular ? 1.0 : misBalanceHeuristic(
                lastBouncePdf * rs.closure.bsdf_selection_pdf, iblSamplePdf);
            contrib += evaluateIBL(rs.wo) * pathWeight * misWeight;
          }
        }
        break;
      }

      i++;
    }

    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_bool_ShowBackground) {
      color = vec4(evaluateIBL(r.dir), 1.0);
    } else {
      color = vec4(pow(u_BackgroundColor.xyz, vec3(2.2)), u_BackgroundColor.w);
    }
  }

  return color;
}

Ray calcuateViewRay(float r0, float r1) {
  // box filter
  vec2 pixelOffset = (vec2(r0, r1) * 2.0) * u_vec2_InverseResolution;

  float aspect = u_vec2_InverseResolution.y / u_vec2_InverseResolution.x;

  vec2 uv = (v_uv * vec2(aspect, 1.0) + pixelOffset) * u_float_FilmHeight;
  vec3 fragPosView = normalize(vec3(uv.x, uv.y, -u_float_FocalLength));

  fragPosView = mat3(u_mat4_ViewMatrix) * fragPosView;
  vec3 origin = u_vec3_CameraPosition;

  return createRay(fragPosView, origin, TFAR_MAX);
}

void main() {
  init_RNG(u_int_FrameCount * u_int_maxBounces);

  Ray r = calcuateViewRay(rng_NextFloat(), rng_NextFloat());

  vec4 color = trace(r);

  if (u_int_DebugMode > 0)
    color = traceDebug(r);

  vec4 previousFrameColor = texelFetch(u_sampler2D_PreviousTexture, ivec2(gl_FragCoord.xy), 0);
  color = (previousFrameColor * float(u_int_FrameCount - 1) + color) / float(u_int_FrameCount);

  out_FragColor = color;
}
