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
uniform bool u_bool_iblSampling;

uniform sampler2D u_sampler2D_PreviousTexture;

uniform sampler2D u_sampler2D_TriangleData;
uniform sampler2D u_sampler2D_BVHData;
uniform sampler2D u_sampler2D_MaterialData;
uniform sampler2D u_sampler2D_MaterialTexInfoData;
uniform sampler2D u_samplerCube_EnvMap;

#include <pathtracing_lights>

uniform int u_int_DebugMode;
uniform bool u_bool_UseIBL;
uniform bool u_bool_ShowBackground;
uniform vec3 u_vec3_BackgroundColor;

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
  float sheen;
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
  float sheen;
  float sheen_roughness;
  vec3 sheen_color;
  vec2 alpha;
  float clearcoat;
  float clearcoat_alpha;
  bool thin_walled;
  float ior;
  bool backside;
  vec3 n;
  vec3 ng;
  vec4 t;
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
#include <pathtracing_dspbr>
#include <pathtracing_rt_kernel>

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
}

int sampleBSDFBounce(inout RenderState rs, inout vec3 pathWeight, out int eventType) {
  float rr_cutout = rng_NextFloat();
  if (rr_cutout > rs.closure.cutout_opacity) {
    eventType |= E_SINGULAR;
    rs.wo = -rs.wi;
    Ray r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * EPS_NORMAL, TFAR_MAX);
    HitInfo hit;
    if (intersectScene_Nearest(r, hit)) {
      fillRenderState(r, hit, rs);
      return 1;
    }
  } else {
    float sample_pdf = 1.0;
    vec3 sample_weight = vec3(1.0);
    rs.wo = sample_dspbr(rs.closure, rs.wi, vec3(rng_NextFloat(), rng_NextFloat(), rng_NextFloat()), sample_weight,
                         sample_pdf, eventType);

    if (sample_pdf > EPS_PDF) {
      pathWeight *= sample_weight;
    } else {
      return -1; // teminate path
    }
    Ray r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * EPS_NORMAL, TFAR_MAX);
    HitInfo hit;
    if (intersectScene_Nearest(r, hit)) {
      fillRenderState(r, hit, rs);
      return 1;
    }
  }

  return 0;
}

#ifdef HAS_LIGHTS

// void unpackLightData(uint lightIdx, out Light light) {
//     vec4 val;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 0u, LIGHT_SIZE),
//     0); light.position = val.xyz; light.type = val.w; val = texelFetch(u_sampler2D_LightData,
//     getStructParameterTexCoord(lightIdx, 1u, LIGHT_SIZE), 0); light.emission = val.xyz;
// }

vec3 sampleAndEvaluateDirectLight(const in RenderState rs) {
  // Light light;
  // unpackLightData(0u, light);
  vec3 n = rs.closure.n;

  vec3 light_dir = cPointLightPosition - rs.hitPos;
  float dist2 = dot(light_dir, light_dir);
  light_dir = normalize(light_dir);

  float cosNL = dot(light_dir, n);

  bool isVisible = isVisible(rs.hitPos + n * EPS_NORMAL, cPointLightPosition);

  bool transmit = false;
  if (cosNL < 0.0 && rs.closure.transparency > 0.0)
    transmit = true;

  vec3 allLightContrib = vec3(0.0);
  if ((cosNL > 0.0) && isVisible) {
    allLightContrib =
        eval_dspbr(rs.closure, rs.wi, light_dir) * (cPointLightEmission / dist2) * cosNL;
  }

  // if (u_bool_iblSampling) {
  //   float pdf = 0.0;
  //   vec3 iblDir = sampleHemisphereCosine(vec2(rng_NextFloat(), rng_NextFloat()), pdf);
  //   //vec3 iblDir = mapUVToDir(vec2(rng_NextFloat(), rng_NextFloat()), pdf);
  //   isVisible = isEnvVisible(rs.hitPos + n * EPS_NORMAL, iblDir);

  //   cosNL = dot(iblDir, n);
  //   if ((cosNL > 0.0) && isVisible) {
  //     allLightContrib +=
  //         eval_dspbr(rs.closure, rs.wi, iblDir) * sampleIBL(iblDir) * cosNL / pdf;
  //   }
  // }
  return allLightContrib;
}
#endif

vec4 traceDebug(const Ray r) {
  HitInfo hit;

  vec4 color = vec4(0);
  if (intersectScene_Nearest(r, hit)) {
    vec3 contrib = vec3(0);
    RenderState rs;
    fillRenderState(r, hit, rs);

    if (u_int_DebugMode == 1)
      contrib = rs.closure.albedo;
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
    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_bool_ShowBackground) {
      color = vec4(texture(u_samplerCube_EnvMap, mapDirToUV(r.dir)).xyz, 1.0);
    }
  }

  return color;
}

vec4 trace(const Ray r) {
  HitInfo hit;

  vec3 pathWeight = vec3(1.0);
  vec4 color = vec4(0);

  if (intersectScene_Nearest(r, hit)) { // primary camera ray
    // return vec4(1,0,0,1);
    vec3 contrib = vec3(0);

    RenderState rs;
    fillRenderState(r, hit, rs);

    int i = 0;
    bool lastBounceSpecular = false;
    while (i < u_int_maxBounces || lastBounceSpecular) {
      // start russion roulette path termination for bounce depth > 2
      if (i > 2 && rng_NextFloat() > RR_TERMINATION_PROB) {
        if (u_bool_forceIBLEval)
          contrib += sampleIBL(rs.wo) * pathWeight;
        break;
      }

#ifdef HAS_LIGHTS
      contrib += (rs.closure.emission + sampleAndEvaluateDirectLight(rs)) * pathWeight;
#else
      contrib += rs.closure.emission * pathWeight;
#endif

      int eventType = 0;
      int bounceType =
          sampleBSDFBounce(rs, pathWeight, eventType); // generate sample and proceed with next intersection
      if (bounceType == -1)
        break; // absorbed

      if (i > 2) {
        pathWeight *= 1.0 / RR_TERMINATION_PROB;
      }

      lastBounceSpecular = bool(eventType & E_SINGULAR);

      bool isPathEnd = (i == (u_int_maxBounces - 1));
      bool forcedIBLSampleOnPathEnd = (isPathEnd && u_bool_forceIBLEval);
      if (bounceType == 0 || forcedIBLSampleOnPathEnd) { // background sample
        contrib += sampleIBL(rs.wo) * pathWeight;
        break;
      }
      // All clear. next sample has properly been generated and intersection was found.
      // Render state contains new intersection info.
      i++;
    }

    color = vec4(contrib, 1.0);
  } else { // direct background hit
    if (u_bool_ShowBackground) {
      color = vec4(sampleIBL(r.dir), 1.0);
    } else {
      color = vec4(pow(u_vec3_BackgroundColor, vec3(2.2)), 0);
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
  init_RNG(u_int_FrameCount);

  Ray r = calcuateViewRay(rng_NextFloat(), rng_NextFloat());

  vec4 color = trace(r);

  if (u_int_DebugMode > 0)
    color = traceDebug(r);

  vec4 previousFrameColor = texelFetch(u_sampler2D_PreviousTexture, ivec2(gl_FragCoord.xy), 0);
  color = (previousFrameColor * float(u_int_FrameCount - 1) + color) / float(u_int_FrameCount);

  out_FragColor = color;
}
