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

struct MaterialTextureInfo {
    TexInfo albedoTexture;
    TexInfo metallicRoughnessTexture;
    TexInfo normalTexture;
    TexInfo emissionTexture;
    TexInfo specularTexture;
    TexInfo specularColorTexture;
    TexInfo transmissionTexture;
    TexInfo clearcoatTexture;
    // TexInfo clearcoatNormalTexture;
    TexInfo sheenColorTexture;
    TexInfo sheenRoughnessTexture;
};


void unpackMaterialData(in uint idx, out MaterialData matData) {
    vec4 val;
    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 0u, MATERIAL_SIZE), 0);
    matData.albedo = val.xyz;
    matData.metallic = val.w;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 1u, MATERIAL_SIZE), 0);
    matData.roughness = val.x;
    matData.anisotropy = val.y;
    matData.anisotropyRotation = val.z * 2.0 * PI;
    matData.transparency = val.w;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 2u, MATERIAL_SIZE), 0);
    matData.cutoutOpacity = val.x;
    matData.sheen = val.y;
    matData.normalScale = val.z;
    matData.ior = val.w;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 3u, MATERIAL_SIZE), 0);
    matData.specular = val.x;
    matData.specularTint = val.yzw;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 4u, MATERIAL_SIZE), 0);
    matData.sheenRoughness = val.x;
    matData.sheenColor = val.yzw;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 5u, MATERIAL_SIZE), 0);
    matData.normalScaleClearcoat = val.x;
    matData.emission = val.yzw;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 6u, MATERIAL_SIZE), 0);
    matData.clearcoat = val.x;
    matData.clearcoatRoughness = val.y;
    matData.flakeCoverage = val.z;
    matData.flakeSize = val.w;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 7u, MATERIAL_SIZE), 0);
    matData.flakeRoughness = val.x;
    matData.flakeColor = val.yzw;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 8u, MATERIAL_SIZE), 0);
    matData.attenuationDistance = val.x;
    matData.attenuationColor = val.yzw;

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx, 9u, MATERIAL_SIZE), 0);
    matData.subsurfaceColor = val.xyz;
    matData.thinWalled = int(val.w);

    val = texelFetch(u_sampler2D_MaterialData, getStructParameterTexCoord(idx,10u, MATERIAL_SIZE), 0);
    matData.translucency = val.x;
    matData.alphaCutoff = val.y;
}

TexInfo getTextureInfo(ivec2 texInfoIdx, ivec2 transformInfoIdx) {
    ivec4 texArrayInfo = ivec4(texelFetch(u_sampler2D_MaterialTexInfoData, texInfoIdx, 0));
    vec4  transformInfo = texelFetch(u_sampler2D_MaterialTexInfoData, transformInfoIdx, 0);

    TexInfo texInfo;
    texInfo.texArrayIdx = texArrayInfo.x;
    texInfo.texIdx = texArrayInfo.y;
    texInfo.texCoordSet = texArrayInfo.z;
    texInfo.texOffset = transformInfo.xy;
    texInfo.texScale = transformInfo.zw;

    return texInfo;
}

void unpackMaterialTexInfo(in uint idx, out MaterialTextureInfo matTexInfo) {
    ivec2 albedoTexInfoIdx = getStructParameterTexCoord(idx, 0u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 albedoTexTransformsIdx = getStructParameterTexCoord(idx, 1u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.albedoTexture = getTextureInfo(albedoTexInfoIdx, albedoTexTransformsIdx);
    
    ivec2 metallicRoughnessTexInfoIdx = getStructParameterTexCoord(idx, 2u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 metallicRoughnessTexTransformsIdx = getStructParameterTexCoord(idx, 3u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.metallicRoughnessTexture = getTextureInfo(metallicRoughnessTexInfoIdx, metallicRoughnessTexTransformsIdx);
    
    ivec2 normalTexInfoIdx = getStructParameterTexCoord(idx, 4u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 normalTexTexTransformsIdx = getStructParameterTexCoord(idx, 5u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.normalTexture = getTextureInfo(normalTexInfoIdx, normalTexTexTransformsIdx);
    
    ivec2 emissionTexInfoIdx = getStructParameterTexCoord(idx, 6u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 emissionTexTransformsIdx = getStructParameterTexCoord(idx, 7u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.emissionTexture = getTextureInfo(emissionTexInfoIdx, emissionTexTransformsIdx);
    
    ivec2 specularTexInfoIdx = getStructParameterTexCoord(idx, 8u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 specularTexTransformsIdx = getStructParameterTexCoord(idx, 9u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.specularTexture = getTextureInfo(specularTexInfoIdx, specularTexTransformsIdx);

    ivec2 specularColorTexInfoIdx = getStructParameterTexCoord(idx, 10u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 specularColorTexTransformsIdx = getStructParameterTexCoord(idx, 11u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.specularColorTexture = getTextureInfo(specularColorTexInfoIdx, specularColorTexTransformsIdx);

    ivec2 transmissionTexInfoIdx = getStructParameterTexCoord(idx, 12u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 transmissionTexTransformsIdx = getStructParameterTexCoord(idx, 13u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.transmissionTexture = getTextureInfo(transmissionTexInfoIdx, transmissionTexTransformsIdx);

    ivec2 clearcoatTexInfoIdx = getStructParameterTexCoord(idx, 14u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 clearcoatTexTransformsIdx = getStructParameterTexCoord(idx, 15u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.clearcoatTexture = getTextureInfo(clearcoatTexInfoIdx, clearcoatTexTransformsIdx);

    ivec2 sheenColorTexInfoIdx = getStructParameterTexCoord(idx, 16u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 sheenColorTexTransformsIdx = getStructParameterTexCoord(idx, 17u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.sheenColorTexture = getTextureInfo(sheenColorTexInfoIdx, sheenColorTexTransformsIdx);

    ivec2 sheenRoughnessTexInfoIdx = getStructParameterTexCoord(idx, 18u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    ivec2 sheenRoughnessTexTransformsIdx = getStructParameterTexCoord(idx, 19u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    matTexInfo.sheenRoughnessTexture = getTextureInfo(sheenRoughnessTexInfoIdx, sheenRoughnessTexTransformsIdx);

    // ivec2 clearcoatNormalTexInfoIdx = getStructParameterTexCoord(idx, 8u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    // ivec2 clearcoatNormalTexTransformsIdx = getStructParameterTexCoord(idx, 9u, MATERIAL_TEX_INFO_SIZE*TEX_INFO_SIZE);
    // matTexInfo.clearcoatNormalTexture = getTextureInfo(clearcoatNormalTexInfoIdx, clearcoatNormalTexTransformsIdx);
}

// Convert from roughness and anisotropy to 2d anisotropy.
vec2 roughness_conversion(float roughness, float anisotropy)
{
    vec2 a = vec2(roughness, roughness * (1.0 - anisotropy));
    return max(a*a, vec2(MINIMUM_ROUGHNESS));
}

void configure_material(const in uint matIdx, inout RenderState rs, out MaterialClosure c)
{
    vec2 uv = rs.uv0;

    MaterialData matData;
    MaterialTextureInfo matTexInfo;

    unpackMaterialData(matIdx, matData);
    unpackMaterialTexInfo(matIdx, matTexInfo);
  
    vec4 albedo = evaluateMaterialTextureValue(matTexInfo.albedoTexture, uv);
    c.albedo = matData.albedo * pow(albedo.xyz, vec3(2.2));

    c.cutout_opacity = matData.cutoutOpacity * albedo.w;
    if(matData.alphaCutoff > 0.0) { // MASK
      c.cutout_opacity = step(matData.alphaCutoff, c.cutout_opacity); 
    }
    if(matData.alphaCutoff == 1.0) { // OPAQUE
      c.cutout_opacity = 1.0;
    }

    vec4 transmission = evaluateMaterialTextureValue(matTexInfo.transmissionTexture, uv);
    c.transparency = matData.transparency;// * transmission.x;

    vec4 occlusionMetallicRoughness = evaluateMaterialTextureValue(matTexInfo.metallicRoughnessTexture, uv);
    c.metallic = matData.metallic * occlusionMetallicRoughness.z;
    float roughness = matData.roughness * occlusionMetallicRoughness.y;
    c.alpha = roughness_conversion(roughness, matData.anisotropy);

    // //vec4 specularColor = evaluateMaterialTextureValue(matTexInfo.specularColorTexture, rs.uv0);
    c.specular_tint = matData.specularTint;// * specularColor.x;
    vec4 specular = evaluateMaterialTextureValue(matTexInfo.specularTexture, rs.uv0);
    c.specular = matData.specular;// * specular.x;

    c.f0 = ((1.0 - matData.ior)/(1.0 + matData.ior))*((1.0 - matData.ior)/(1.0 + matData.ior));

    c.specular_f0 = (1.0 - c.metallic) * c.f0 * c.specular * c.specular_tint + c.metallic * c.albedo;
    c.specular_f90 = vec3((1.0 - c.metallic) * c.specular + c.metallic);

    // vec4 sheenColor = evaluateMaterialTextureValue(matTexInfo.sheenColorTexture, rs.uv0);
    // vec4 sheenRoughness = evaluateMaterialTextureValue(matTexInfo.sheenRoughnessTexture, rs.uv0);
    c.sheen = matData.sheen;
    c.sheen_roughness = matData.sheenRoughness;// * sheenRoughness.x;
    c.sheen_color = matData.sheenColor;// * sheenColor.xyz;

    c.n = y_to_z_up * rs.normal;
    c.ng = y_to_z_up * rs.geometryNormal;
    c.t = y_to_z_up * rs.tangent;

    if(matTexInfo.normalTexture.texIdx >= 0) {
        mat3 to_world = get_onb(c.n, c.t);
        vec3 n = normalize(evaluateMaterialTextureValue(matTexInfo.normalTexture, uv).xyz * 2.0 - vec3(1.0));
        c.n = to_world * n;
        vec3 wi = y_to_z_up*rs.wi;

        // ensure n and ng point into the same hemisphere as wi
        fix_normals(c.n, c.ng, wi);
    }

    // ensure orthonormal basis  
    c.t = get_onb(c.n, c.t)[0];

    // apply aniso rotation
    c.t = rotation_to_tangent(matData.anisotropyRotation, c.n, c.t);

    c.emission = pow(evaluateMaterialTextureValue(matTexInfo.emissionTexture, uv).xyz, vec3(2.2)) * matData.emission;

    vec4 clearcoat = evaluateMaterialTextureValue(matTexInfo.clearcoatTexture, uv);
    c.clearcoat = matData.clearcoat;// * clearcoat.x;
    c.clearcoat_alpha = max(matData.clearcoatRoughness*matData.clearcoatRoughness, MINIMUM_ROUGHNESS);
}



