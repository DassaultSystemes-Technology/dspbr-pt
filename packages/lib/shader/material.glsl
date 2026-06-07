const int E_DELTA = 0x00002;
const int E_REFLECTION = 0x00004;
const int E_TRANSMISSION = 0x00008;

void configure_gltf_material(const in uint matIdx, in RenderState rs, out MaterialClosure c, vec4 vertexColor) {
  MaterialData matData = get_material(matIdx);
  PbrGltfMaterial material;

  vec4 baseColorFactor = get_texture_value(matData.baseColorTextureId, rs.uv0, rs.uv1);
  material.baseColorFactor = vec4(matData.baseColorFactor * to_linear_rgb(baseColorFactor.xyz), baseColorFactor.w);
  float opacity = baseColorFactor.w;

  if (length(vertexColor) > 0.0) {
    material.baseColorFactor.rgb *= vertexColor.xyz;
    opacity *= vertexColor.w;
  }
  material.baseColorFactor.a = opacity;

  c.cutout_opacity = matData.cutoutOpacity * opacity;
  if (matData.alphaCutoff > 0.0) { // MASK
    c.cutout_opacity = step(matData.alphaCutoff, c.cutout_opacity);
  }
  if (matData.alphaCutoff == 1.0) { // OPAQUE
    c.cutout_opacity = 1.0;
  }

  material.transmissionFactor = matData.transmissionFactor * get_texture_value(matData.transmissionTextureId, rs.uv0, rs.uv1).x;

  material.diffuseTransmissionFactor = matData.diffuseTransmissionFactor * get_texture_value(matData.diffuseTransmissionTextureId, rs.uv0, rs.uv1).x;
  material.diffuseTransmissionColorFactor = matData.diffuseTransmissionColorFactor * to_linear_rgb(get_texture_value(matData.diffuseTransmissionColorTextureId, rs.uv0, rs.uv1).xyz);

  c.thin_walled = matData.thinWalled;
  material.ior = matData.ior;

  c.double_sided = matData.doubleSided;

  vec4 occlusionRoughnessMetallic = get_texture_value(matData.metallicRoughnessTextureId, rs.uv0, rs.uv1);
  material.metallicFactor = matData.metallicFactor * occlusionRoughnessMetallic.z;
  material.roughnessFactor = matData.roughnessFactor * occlusionRoughnessMetallic.y;

  vec4 anisotropy = get_texture_value(matData.anisotropyTextureId, rs.uv0, rs.uv1);
  material.anisotropyStrength = matData.anisotropy * anisotropy.b;

  vec4 specularColor = get_texture_value(matData.specularColorTextureId, rs.uv0, rs.uv1);
  material.specularColorFactor = matData.specularColorFactor * pow(specularColor.rgb, vec3(2.2));
  vec4 specularFactor = get_texture_value(matData.specularTextureId, rs.uv0, rs.uv1);
  material.specularFactor = matData.specularFactor * specularFactor.a;

  vec4 sheenColorFactor = get_texture_value(matData.sheenColorTextureId, rs.uv0, rs.uv1);
  vec4 sheenRoughnessFactor = get_texture_value(matData.sheenRoughnessTextureId, rs.uv0, rs.uv1);
  material.sheenRoughnessFactor = matData.sheenRoughnessFactor * sheenRoughnessFactor.x;
  material.sheenColorFactor = matData.sheenColorFactor * to_linear_rgb(sheenColorFactor.xyz);

  c.n = rs.n;
  c.ng = rs.ng;
  c.t = vec4(rs.tangent.xyz, rs.tangent.w);

  if (matData.normalTextureId >= 0.0) {
    mat3 to_world = get_onb(c.n, c.t.xyz);
    vec3 n = normalize(get_texture_value(matData.normalTextureId, rs.uv0, rs.uv1).xyz * 2.0 - vec3(1.0));
    n = normalize(n * vec3(matData.normalScale, matData.normalScale, 1.0));
    c.n = to_world * n;

    // ensure orthonormal tangent after changing normal
    vec3 b = normalize(cross(c.n, c.t.xyz)) * c.t.w;
    c.t.xyz = cross(b, c.n);
  }

  // ensure n and ng point into the same hemisphere as wi
  // remember whether we hit from backside
  vec3 wi = rs.wi;
  c.backside = fix_normals(c.n, c.ng, wi);

  vec3 anisotropyDirection = matData.anisotropyDirection;
  if (matData.anisotropyDirectionTextureId >= 0.0)
    anisotropyDirection = get_texture_value(matData.anisotropyDirectionTextureId, rs.uv0, rs.uv1).xyz * 2.0 - vec3(1);
  else if (matData.anisotropyTextureId >= 0.0)
    anisotropyDirection = vec3(anisotropy.rg * 2.0 - vec2(1.0), 0.0);
  anisotropyDirection.z = 0.0;

  material.anisotropyRotation = atan(anisotropyDirection.y, anisotropyDirection.x);
  c.t = rotation_to_tangent(material.anisotropyRotation + PI, c.n, c.t);
  c.anisotropyTangent = c.t.xyz;

  vec3 emissiveFactor = get_texture_value(matData.emissiveTextureId, rs.uv0, rs.uv1).xyz;
  material.emissiveFactor = matData.emissiveFactor.xyz * to_linear_rgb(emissiveFactor);
  material.emissiveStrength = 1.0;

  vec4 clearcoatFactor = get_texture_value(matData.clearcoatTextureId, rs.uv0, rs.uv1);
  material.clearcoatFactor = matData.clearcoatFactor * clearcoatFactor.x;
  vec4 clearcoatRoughnessFactor = get_texture_value(matData.clearcoatRoughnessTextureId, rs.uv0, rs.uv1);
  material.clearcoatRoughnessFactor = matData.clearcoatRoughnessFactor * clearcoatRoughnessFactor.x;
  material.clearcoatNormalTextureScale = matData.clearcoatNormalTextureScale;

  material.attenuationColor = matData.attenuationColor;
  material.attenuationDistance = matData.attenuationDistance;
  material.thicknessFactor = c.thin_walled ? 0.0 : 1.0;
  material.multiscatterColorFactor = vec3(0.0);
  material.scatterAnisotropy = 0.0;

  material.iridescenceFactor = matData.iridescenceFactor * get_texture_value(matData.iridescenceTextureId, rs.uv0, rs.uv1).x;
  material.iridescenceIor = matData.iridescenceIor;
  material.iridescenceThickness = mix(matData.iridescenceThicknessMinimum, matData.iridescenceThicknessMaximum,
                                      get_texture_value(matData.iridescenceThicknessTextureId, rs.uv0, rs.uv1).y);
  material.dispersion = matData.dispersion;
  material.normalTextureScale = matData.normalScale;
  material.featureMask = 0U;

  c.material = material;
}
