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
 
precision highp float;
precision highp int;
precision highp sampler2D;
// precision lowp isampler2D;
precision highp sampler2DArray;

#include <pathtracing_defines>

in vec2 v_uv;

uniform int u_int_FrameCount;
uniform uint u_int_MaxTextureSize; // used for data acessing of linear data in 2d textures
uniform float u_float_FilmHeight;
uniform float u_float_FocalLength;
uniform vec3 u_vec3_CameraPosition;
uniform vec2 u_vec2_InverseResolution;
uniform mat4 u_mat4_ViewMatrix;
uniform uint u_int_NumTriangles;
uniform int u_int_MaxBounceDepth;
uniform bool u_bool_hasTangents;
uniform bool u_bool_forceIBLEvalOnLastBounce;

uniform sampler2D u_sampler2D_PreviousTexture;

uniform sampler2D u_sampler2D_TriangleData;
uniform sampler2D u_sampler2D_BVHData;
uniform sampler2D u_sampler2D_NormalData;
uniform sampler2D u_sampler2D_TangentData;
uniform sampler2D u_sampler2D_UVData;
uniform sampler2D u_sampler2D_MaterialData;
uniform sampler2D u_sampler2D_MaterialTexInfoData;
uniform sampler2D u_samplerCube_EnvMap;

#include <pathtracing_lights>

uniform int u_int_DebugMode;
uniform bool u_bool_UseIBL;
uniform bool u_bool_BackgroundFromIBL;

out vec4 out_FragColor;

struct MaterialData {
    // 0
    vec3 albedo;
    float metallic;

    //1
    float roughness;
    float anisotropy;
    float anisotropyRotation;
    float transparency;

    //2
    float cutoutOpacity;
    float sheen;
    float normalScale;
    float ior;

    //3
    float specular;
    vec3 specularTint;

    //4
    float sheenRoughness;
    vec3 sheenColor;

    //5
    float normalScaleClearcoat;
    vec3 emission;

    //6
    float clearcoat;
    float clearcoatRoughness;
    float flakeCoverage;
    float flakeSize;

    //7
    float flakeRoughness;
    vec3 flakeColor;

    //8
    float attenuationDistance;
    vec3 attenuationColor;

    //9
    vec3 subsurfaceColor;
    int thinWalled;

    //10
    float translucency;
    float alphaCutoff;
    vec2 padding;
};

struct MaterialClosure {
    vec3 albedo;
    float transparency;
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
    vec3 n;
    vec3 ng;
    vec3 t;
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
    vec3 tangent;
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

    rs.uv0 = calculateInterpolatedUV(triIdx, hit.uv, 0);
    //rs.uv1 = calculateInterpolatedUV(hit.triIndex, hit.uv, 1);
    rs.wi = -r.dir;

    vec3 p0, p1, p2;
    getSceneTriangle(triIdx, p0, p1, p2);
    rs.geometryNormal = compute_triangle_normal(p0, p1, p2);
    rs.normal = calculateInterpolatedNormal(triIdx, hit.uv);

    fix_normals(rs.normal, rs.geometryNormal, rs.wi);

    if(u_bool_hasTangents) {
        rs.tangent = normalize(calculateInterpolatedTangent(triIdx, hit.uv));
    }
    else {        
        rs.tangent = get_onb(rs.normal)[0];
    }

    uint matIdx = getMaterialIndex(triIdx);
    configure_material(matIdx, rs, rs.closure);
}

int sampleBSDFBounce(inout RenderState rs, inout vec3 pathWeight, out uint eventType) {
    Ray r;
    float rr_cutout = rng_NextFloat();
    if(rr_cutout > rs.closure.cutout_opacity) {
      eventType |= EVENT_SPECULAR;
      rs.wo = -rs.wi;
      r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * EPS_NORMAL, TFAR_MAX);
    } else {
      float sample_pdf = 0.0;
      vec3 sample_weight = vec3(0);

      vec3 wi = y_to_z_up * rs.wi;
      vec3 wo = dspbr_sample(rs.closure, wi, vec3(rng_NextFloat(), rng_NextFloat(), rng_NextFloat()), sample_weight, sample_pdf, eventType);
      rs.wo = transpose(y_to_z_up) * wo;

      if(sample_pdf > 0.0) {
          pathWeight *= sample_weight;
      } else {
          return -1;
      }
      r = createRay(rs.wo, rs.hitPos + fix_normal(rs.geometryNormal, rs.wo) * EPS_NORMAL, TFAR_MAX);
    }

    HitInfo hit;
    if (intersectScene_Nearest(r, hit)) {
        fillRenderState(r, hit, rs);
        return 1;
    }

    return 0;
}

#ifdef HAS_LIGHTS

// void unpackLightData(uint lightIdx, out Light light) {
//     vec4 val;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 0u, LIGHT_SIZE), 0);
//     light.position = val.xyz;
//     light.type = val.w;
//     val = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(lightIdx, 1u, LIGHT_SIZE), 0);
//     light.emission = val.xyz;
// }

vec3 sampleAndEvaluateDirectLight(const in RenderState  rs) {
    //Light light;
    //unpackLightData(0u, light);
    vec3 n = transpose(y_to_z_up)*rs.closure.n;    
    
    float pdf = 0.0;
    vec3 light_dir = cPointLightPosition - rs.hitPos;
    float dist2 = dot(light_dir, light_dir);
    light_dir = normalize(light_dir);

    float cosNL = dot(light_dir, n);

    // TODO this test makes webgl crash. Fix this!
    bool isVisible = isVisible(rs.hitPos + n*EPS_NORMAL, cPointLightPosition);   
    if (cosNL > 0.0 && isVisible)
    {
        return dspbr_eval(rs.closure, y_to_z_up * rs.wi, y_to_z_up * light_dir) * (cPointLightEmission / dist2) * cosNL;
    }

    return vec3(0.0);
}
#endif

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

vec2 mapDirToUV(vec3 dir) {
    float theta = computeTheta(dir);
    float u = computePhi(dir) / (2.0 * PI);
    float v = (theta) / PI;
    //pdf = 1.0 / (2.0 * PI * PI * max(EPS_COS, sin(theta)));
    return vec2(u, v);
}


vec3 traceDebug(const Ray r) {
    HitInfo hit;

    vec3 color;
    if (intersectScene_Nearest(r, hit)) {
        RenderState rs;
        fillRenderState(r, hit, rs);

        if(u_int_DebugMode== 1) 
            color = rs.closure.albedo;
        if(u_int_DebugMode== 2) 
            color = vec3(rs.closure.metallic);
        if(u_int_DebugMode== 3) 
            color = vec3(rs.closure.alpha, 0.0);
        if(u_int_DebugMode== 4) 
            color = rs.closure.n;
        if(u_int_DebugMode== 5) {
            color = rs.closure.t;           
        }
        if(u_int_DebugMode== 6) {
            mat3 onb = get_onb(rs.closure.n, rs.closure.t);
            color = onb[1];
        }
         if(u_int_DebugMode== 7) {            
            color = vec3(rs.closure.transparency);
        }
    }    
    else { // direct background hit
        if(u_bool_UseIBL) {
            color =  texture(u_samplerCube_EnvMap, mapDirToUV(r.dir)).xyz;
        }

    }

    return color;
}

vec3 sampleIBL(in vec3 dir) {
    if(u_bool_UseIBL) { 
        return texture(u_samplerCube_EnvMap, mapDirToUV(dir)).xyz;
    }
    return vec3(0);
}

vec3 trace(const Ray r) {
    HitInfo hit;

    vec3 pathWeight = vec3(1.0);
    vec3 color = vec3(0);

    if (intersectScene_Nearest(r, hit)) { // primary camera ray
        RenderState rs;
        fillRenderState(r, hit, rs);

        int i = 0;
        bool lastBounceSpecular = false;
        while(i < u_int_MaxBounceDepth || lastBounceSpecular) { 
            // start russion roulette path termination for bounce depth > 2
            if(i>2 && rng_NextFloat() > RR_TERMINATION_PROB) { 
                if(u_bool_forceIBLEvalOnLastBounce)
                    color += sampleIBL(rs.wo) * pathWeight;
                break;
            }

#ifdef HAS_LIGHTS
            color += (rs.closure.emission + sampleAndEvaluateDirectLight(rs)) * pathWeight;
#else
            color += rs.closure.emission * pathWeight;
#endif

            uint eventType = 0u;
            int bounceType = sampleBSDFBounce(rs, pathWeight, eventType); // generate sample and proceed with next intersection
            if(bounceType == -1) break; // absorbed

            if(i>2) {
                pathWeight *= 1.0 / RR_TERMINATION_PROB;
            }

            lastBounceSpecular = bool(eventType & EVENT_SPECULAR);

            bool isPathEnd = (i == (u_int_MaxBounceDepth-1));
            bool forcedIBLSampleOnPathEnd = (isPathEnd && u_bool_forceIBLEvalOnLastBounce);
            if ( bounceType == 0 || forcedIBLSampleOnPathEnd) { // background sample
                color += sampleIBL(rs.wo) * pathWeight;
                break;
            }

            // all clear - next sample has properly been generated and intersection was found. Render state contains new intersection info.
            i++;
        }
    } 
    else { // direct background hit
        if(u_bool_BackgroundFromIBL) {
            color = sampleIBL(r.dir);
        } else {
          color = vec3(1,1,1);
        }
    }

    return color;
}


Ray calcuateRay(float r0, float r1) {
    // box filter
    vec2 pixelOffset = (vec2(r0, r1) * 2.0) * u_vec2_InverseResolution;

    float aspect = u_vec2_InverseResolution.y / u_vec2_InverseResolution.x;

    vec2 uv = (v_uv*vec2(aspect, 1.0) + pixelOffset)*u_float_FilmHeight;
    vec3 fragPosView = normalize(vec3(uv.x, uv.y, -u_float_FocalLength));

    fragPosView = mat3(u_mat4_ViewMatrix)*fragPosView;
    vec3 origin = u_vec3_CameraPosition;

    return createRay(fragPosView, origin, TFAR_MAX);
}

void main() {
    init_RNG(u_int_FrameCount);

    Ray r = calcuateRay(rng_NextFloat(), rng_NextFloat());
    
    vec3 color = trace(r);

    if(u_int_DebugMode> 0)
        color = traceDebug(r);

    vec3 previousFrameColor = texelFetch(u_sampler2D_PreviousTexture,  ivec2(gl_FragCoord.xy), 0).xyz;
    color = (previousFrameColor * float(u_int_FrameCount-1) + color) / float(u_int_FrameCount);

    //color = texelFetch(u_sampler2D_LightData, getStructParameterTexCoord(0u, 0u, LIGHT_SIZE), 0).xyz;
    out_FragColor = vec4(color, 1);
}
