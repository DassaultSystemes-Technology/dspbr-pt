/* @license
 * Copyright 2020  Dassault Systèmes - All Rights Reserved.
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

vec3 fresnel_schlick(vec3 f0, vec3 f90, float theta)
{
    return f0 + (f90-f0)*pow(abs(1.0-theta), 5.0);
}

float fresnel_schlick(float f0, float f90, float theta)
{
    return f0 + (f90-f0)*pow(abs(1.0-theta), 5.0);
}

float sqr(float x)
{
    return x * x;
}

/////////////////////////////////////////////////
// GGX Distribution

// Eric Heitz. Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs.
// Journal of Computer Graphics TechniquesVol. 3, No. 2, 2014
// http://jcgt.org/published/0003/02/03/paper.pdf

// eq. 80
float projected_roughness(in vec2 alpha, in vec3 w)
{
    float sin_theta_2 = 1.0 - w.z * w.z;
    float inv_sin_theta_2 = 1.0 / sin_theta_2;
    float cos_phi_2 = sqr(w.x) * inv_sin_theta_2;
    float sin_phi_2 = sqr(w.y) * inv_sin_theta_2;

    return sqrt(cos_phi_2 * sqr(alpha.x) + sin_phi_2 * sqr(alpha.y));    
}

// eq. 86
float ggx_smith_lambda(in vec2 alpha, in vec3 w)
{
    float sin_theta_2 = 1.0 - w.z * w.z;

    if (sin_theta_2 < 0.0001) {
        return 0.0;
    }

    float alpha_w = projected_roughness(alpha, w);

    float tan_theta = sqrt(sin_theta_2) / abs(w.z);
    float a = 1.0 / (alpha_w * tan_theta);

    return 0.5 * (-1.0 + sqrt(1.0 + 1.0 / sqr(a)));
}

// eq. 43
float ggx_smith_g1(in vec2 alpha, in vec3 w, in vec3 wh)
{
    if (dot(w, wh) < 0.0) {
        return 0.0;
    }

    return 1.0 / (1.0 + ggx_smith_lambda(alpha, w));
}

// eq. 99
float ggx_smith_g2(in vec2 alpha, in vec3 wi, in vec3 wo, in vec3 wh)
{
    if (dot(wo, wh) * dot(wi, wh) < 0.0) {
        return 0.0;
    }

    float lambda_wi = ggx_smith_lambda(alpha, wi);
    float lambda_wo = ggx_smith_lambda(alpha, wo);

    return 1.0 / (1.0 + lambda_wi + lambda_wo);
}

// GGX distribution, eq. 85
float ggx_eval(vec2 alpha, vec3 wh)
{
    if (wh.z < 0.0) {
        return 0.0;
    }

    // // simplified alternative
    // float hx = sqr(wh.x) / sqr(alpha.x);
    // float hy = sqr(wh.y) / sqr(alpha.y);
    // float hn = sqr(wh.z);
    // float norm = 1.0 / (PI * alpha.x * alpha.y);
    // return norm * (1.0 / sqr(hx + hy + hn));

    float cos_theta_2 = sqr(wh.z);
    float cos_theta_4 = sqr(cos_theta_2);
    float sin_theta_2 = 1.0 - cos_theta_2;
    float tan_theta_2 = sqr(sqrt(sin_theta_2) / wh.z);

    if (sin_theta_2 < 0.0001) {
        return 0.0;
    }

    float inv_sin_theta_2 = 1.0 / sin_theta_2;
    float cos_phi_2 = sqr(wh.x) * inv_sin_theta_2;
    float sin_phi_2 = sqr(wh.y) * inv_sin_theta_2;

    return 1.0 / (PI * alpha.x * alpha.y * cos_theta_4 * sqr(1.0 + tan_theta_2 * (cos_phi_2 / sqr(alpha.x) + sin_phi_2 / sqr(alpha.y))));
}

// GGX distribution of visible normals, eq. 16
float ggx_eval_vndf(vec2 alpha, vec3 wi, vec3 wh)
{
    float d = ggx_eval(alpha, wh);
    float g1 = ggx_smith_g1(alpha, wi, wh);
    return g1 * abs(dot(wi, wh)) * d / abs(wi.z);
}

// Sample GGX distribution of visible normals
vec3 ggx_sample_vndf(vec2 alpha, vec3 wi_, vec2 uv)
{
    // Eric Heitz. A Simpler and Exact Sampling Routine for the GGX Distribution of Visible Normals.
    // [Research Report] Unity Technologies. 2017. hal-01509746
    // https://hal.archives-ouvertes.fr/hal-01509746/document

    // stretch view
    vec3 wi = normalize(vec3(alpha.x * wi_.x, alpha.y * wi_.y, wi_.z));
    // orthonormal basis
    vec3 t1 = (wi.z < 0.9999) ? normalize(cross(wi, vec3(0,1,0))) : vec3(1,0,0);
    vec3 t2 = cross(t1, wi);
    // sample point with polar coordinates (r, phi)
    float a = 1.0 / (1.0 + wi.z);
    float r = sqrt(uv.x);
    float phi = (uv.y<a) ? uv.y/a * PI : PI + (uv.y-a)/(1.0-a) * PI;
    float p1 = r*cos(phi);
    float p2 = r*sin(phi)*((uv.y<a) ? 1.0 : wi.z);
    // compute normal
    vec3 wh = p1*t1 + p2*t2 + sqrt(max(0.0, 1.0 - p1*p1 - p2*p2))*wi;
    // unstretch
    wh.x *= alpha.x;
    wh.y *= alpha.y;
    wh.z = max(0.0, wh.z);
    return normalize(wh);
}

/////////////////////////////////////////////////

vec3 ggx_importance(vec3 f0, float cos_theta)
{
    return fresnel_schlick(f0, vec3(1.0), cos_theta);
}

float directional_albedo_ggx(float alpha, float cosTheta)
{
    return 1.0 - 1.45940*alpha*(-0.20276 + alpha*(2.77203 + (-2.61748 + 0.73343*alpha)*alpha))*cosTheta*(3.09507 + cosTheta*(-9.11368 + cosTheta*(15.88844 + cosTheta*(-13.70343 + 4.51786*cosTheta))));
}

float average_albedo_ggx(float alpha)
{
    return 1.0 + alpha*(-0.11304 + alpha*(-1.86947 + (2.22682 - 0.83397*alpha)*alpha));
}

vec3 average_fresnel(vec3 f0, vec3 f90)
{
    return 20./21. * f0 + 1./21. * f90;
}

vec3 microfacet_ggx_smith_eval_ms(vec3 f0, vec3 f90, vec2 alpha_anisotropic, float NdotV, float NdotL)
{
    float alpha = alpha_anisotropic.x;//sqrt(alpha_anisotropic.x*alpha_anisotropic.y);
    float Ewi = directional_albedo_ggx(alpha, NdotV);
    float Ewo = directional_albedo_ggx(alpha, NdotL);
    float Eavg = average_albedo_ggx(alpha);
    float ms = (1.0 - Ewo) * (1.0 - Ewi) / (PI * (1.0 - Eavg));
    vec3 Favg = average_fresnel(f0, f90);
    vec3 f = (Favg*Favg * Eavg) / (1.0 - Favg*(1.0 - Eavg));
    return ms * f;
}

vec3 microfacet_ggx_smith_eval(vec3 f0, vec3 f90, vec2 alpha, vec3 wi, vec3 wo, vec3 wh)
{
    if (abs(wi.z) < 0.0001 || abs(wo.z) < 0.0001) {
        return vec3(0.0);
    }

    vec3 f = fresnel_schlick(f0, f90, dot(wi, wh));
    
    float d = ggx_eval(alpha, wh);
    float g = ggx_smith_g2(alpha, wi, wo, wh);
    return (f * g * d) / abs(4.0 * wi.z * wo.z);
}

vec3 sample_hemisphere_cos(vec2 uv, out float pdf) {
     float phi = uv.y * 2.0 * PI;
     float cos_theta = sqrt(1.0 - uv.x);
     float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
     pdf = cos_theta*ONE_OVER_PI;
     return vec3(cos(phi) * sin_theta, sin(phi) * sin_theta, cos_theta);
}

vec3 microfacet_ggx_smith_sample(in vec2 alpha, in vec3 wi, in vec2 uv, out float pdf)
{
    vec3 wh = ggx_sample_vndf(alpha, wi, uv);
    vec3 wo = reflect(-wi, wh);

    float dwh_dwo = 1.0 / (4.0 * abs(dot(wo, wh)));
    pdf = ggx_eval_vndf(alpha, wi, wh) * dwh_dwo;

    return wo;
}

float directional_albedo_ggx_ms(float theta, vec2 alpha, float e0) {
    return mix(e0 + (1.0-e0)*pow(abs(1.0-theta), 5.0), 0.04762+0.95238*e0,
        1.0 - pow(abs(1.0 - alpha.x*alpha.y), 5.0));
}

float average_albedo_ggx_ms(vec2 alpha, float e0)
{
    return e0 + (-0.33263* alpha.x*alpha.y - 0.072359)*(1.0 - e0)*e0;
}

float coupled_diffuse(vec2 alpha, float dot_wi_n, float dot_wo_n, float e0)
{
    float Ewi = directional_albedo_ggx_ms(dot_wi_n, alpha, e0);
    float Ewo = directional_albedo_ggx_ms(dot_wo_n, alpha, e0);
    float Eavg = average_albedo_ggx_ms(alpha, e0);
    return (1.0 - Ewo) * (1.0 - Ewi) / (PI * (1.0 - Eavg));
}

vec3 diffuse_bsdf_eval(const in MaterialClosure c, float dot_wi_n, float dot_wo_n) {
    float lambert = ONE_OVER_PI;
    float coupled = coupled_diffuse(c.alpha, dot_wi_n, dot_wo_n, max_(c.f0*c.specular_tint));
    vec3 diffuse_color = c.albedo * (1.0-c.metallic);
    return diffuse_color * mix(lambert, coupled, c.specular);
}

float diffuse_bsdf_pdf(in vec3 wi, in vec3 wo) {
    return same_hemisphere(wi, wo) ? abs(wo.z)*ONE_OVER_PI : 0.0;
}

vec3 diffuse_bsdf_importance(vec3 tint) {
    return tint;
}

float l(float x, float alpha)
{
    float oneMinusAlphaSq = (1.0 - alpha)*(1.0 - alpha);
    float a = mix(21.5473, 25.3245, oneMinusAlphaSq);
    float b = mix(3.82987, 3.32435, oneMinusAlphaSq);
    float c = mix(0.19823, 0.16801, oneMinusAlphaSq);
    float d = mix(-1.97760, -1.27393, oneMinusAlphaSq);
    float e = mix(-4.32054, -4.85967, oneMinusAlphaSq);
    return a / (1.0 + b * pow(abs(x), c)) + d*x + e;
}

float lambda_sheen(float cos_theta, float alpha)
{
    return abs(cos_theta) < 0.5 ? exp(l(cos_theta, alpha)) : exp(2.0 * l(0.5, alpha) - l(1.0 - cos_theta, alpha));
}

float directional_albedo_sheen(float cos_theta, float alpha)
{
    float c = 1.0 - cos_theta;
    float c3 = c*c*c;
    return 0.65584461 * c3 + 1.0 / (4.16526551 + exp(-7.97291361*sqrt(alpha)+6.33516894));
}

vec3 sheen_layer(vec3 base, float sheen_intensity, vec3 sheen_color, float sheen_roughness,
    float dot_wi_n, float dot_wo_n, float dot_wh_n)
{
    float alpha = max(sheen_roughness, 0.07);
    float invAlpha = 1.0 / alpha;
    float cosThetaHSq = dot_wh_n*dot_wh_n;
    float sinThetaHSq = max(1.0 - cosThetaHSq, 0.001);
    float D = (2.0 + invAlpha) * pow(abs(sinThetaHSq), 0.5 * invAlpha) / (2.0 * PI);
    float G = 1.0 / (1.0 + lambda_sheen(dot_wi_n, alpha) + lambda_sheen(dot_wo_n, alpha));
    float sheen = G * D / (4.0 * dot_wi_n * dot_wo_n);

    float Ewi = sheen_intensity * max_(sheen_color) * directional_albedo_sheen(dot_wi_n, alpha);
    float Ewo = sheen_intensity * max_(sheen_color) * directional_albedo_sheen(dot_wo_n, alpha);

    return base * min(1.0 - Ewi, 1.0 - Ewo) + sheen_intensity * sheen_color * sheen;
    //return base + sheen_intensity * sheen_color * sheen;
}


vec3 coating_layer(vec3 base, float clearcoat, float clearcoat_roughness,
    vec3 wi, vec3 wo, vec3 wh)
{
    vec2 alpha_coating = vec2(clearcoat_roughness*clearcoat_roughness);
    vec3 coating = microfacet_ggx_smith_eval(vec3(0.04), vec3(1.0), alpha_coating, wi, wo, wh);
    vec3 Fcv = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), wi.z);
    vec3 Fcl = clearcoat * fresnel_schlick(vec3(0.04), vec3(1.0), wo.z);
    return base * (1.0 - max_(max(Fcv, Fcl))) + clearcoat * coating;
    //return base + clearcoat * coating;
}

vec3 dspbr_eval(const in MaterialClosure c, vec3 wi, vec3 wo) {
    vec3 wh = normalize(wi + wo);
    float dot_wh_n = dot(wh, c.n);

    vec3 wi_ = c.to_local * wi;
    vec3 wo_ = c.to_local * wo;
    vec3 wh_ = c.to_local * wh;

    float dot_wi_n = wi_.z;
    float dot_wo_n = wo_.z;

    vec3 diffuse = diffuse_bsdf_eval(c, dot_wi_n, dot_wo_n);
    vec3 reflection = microfacet_ggx_smith_eval(c.specular_f0, c.specular_f90, c.alpha, wi_, wo_, wh_);
    vec3 reflectionMS = microfacet_ggx_smith_eval_ms(c.specular_f0, c.specular_f90, c.alpha, dot_wi_n, dot_wo_n);
    vec3 base = diffuse + reflection + reflectionMS;

    vec3 sheen_base = sheen_layer(base, c.sheen, c.sheen_color, c.sheen_roughness, dot_wi_n, dot_wo_n, dot_wh_n);
    vec3 combined = coating_layer(sheen_base, c.clearcoat, c.clearcoat_roughness, wi_, wo_, wh_);

    return combined;
}

float luminance(vec3 rgb) {
    return 0.2126*rgb.x + 0.7152*rgb.y + 0.0722*rgb.z;
}

vec3 dspbr_sample(const in MaterialClosure c, vec3 wi, in vec3 uvw, out vec3 weight, out float pdf) {
    vec3 wi_ = c.to_local * wi;
    float dot_wi_n = wi_.z;

    vec3 diffuse_color = c.albedo * (1.0-c.metallic);
    float bsdf_importance[2];
    bsdf_importance[0] = luminance(diffuse_bsdf_importance(diffuse_color));
    bsdf_importance[1] = luminance(ggx_importance(c.specular_f0, dot_wi_n));

    float bsdf_cdf[2];
    bsdf_cdf[0] = bsdf_importance[0];
    bsdf_cdf[1] = bsdf_cdf[0] + bsdf_importance[1];

    if (bsdf_cdf[1] != 0.0) {
        bsdf_cdf[0] *= 1.0 / bsdf_cdf[1];
		bsdf_cdf[1] *= 1.0 / bsdf_cdf[1];
    } else {
        bsdf_cdf[0] = 1.0;
    }

    vec3 wo_;
    if (uvw.z <= bsdf_cdf[0]) {
        wo_ = sample_hemisphere_cos(uvw.xy, pdf);
        pdf *= 1.0 / bsdf_cdf[0];
    } else if (uvw.z <= bsdf_cdf[1]) {
        wo_ = microfacet_ggx_smith_sample(c.alpha, wi_, uvw.xy, pdf);
        pdf *= (bsdf_cdf[1] - bsdf_cdf[0]);
    }

    vec3 wo = transpose(c.to_local) * wo_;
    weight = dspbr_eval(c, wi, wo) / pdf * wo_.z;

    return wo;
}
/////////////////////////////////////////////////////////////////////////////// 
