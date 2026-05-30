SurfaceMaterial_0 make_slang_surface(const in MaterialClosure c) {
  SurfaceMaterial_0 surface;
  surface.albedo_0 = c.albedo;
  surface.metallic_0 = c.metallic;
  surface.roughness_0 = c.roughness;
  surface.anisotropy_0 = c.anisotropy;
  surface.anisotropyDirection_0 = c.anisotropyTangent;
  surface.transparency_0 = c.transparency;
  surface.ior_0 = c.ior;
  surface.specularColor_0 = c.specular_tint;
  surface.specular_0 = c.specular;
  surface.emission_0 = c.emission;
  surface.normalScale_0 = 1.0;
  surface.attenuationColor_0 = c.attenuationColor;
  surface.attenuationDistance_0 = c.attenuationDistance;
  surface.multiscatterColor_0 = vec3(0.0);
  surface.scatterAnisotropy_0 = 0.0;
  surface.thinWalled_0 = c.thin_walled ? 1.0 : 0.0;
  surface.translucency_0 = c.translucency;
  surface.translucencyColor_0 = c.translucencyColor;
  surface.clearcoat_0 = c.clearcoat;
  surface.clearcoatRoughness_0 = c.clearcoatRoughness;
  surface.sheenColor_0 = c.sheen_color;
  surface.sheenRoughness_0 = c.sheen_roughness;
  surface.clearcoatNormalScale_0 = 1.0;
  surface.frontFaceEmissionOnly_0 = 0.0;
  return surface;
}

SurfaceLayerNormals_0 make_slang_normals(const in MaterialClosure c) {
  SurfaceLayerNormals_0 normals;
  normals.rawGeometry_0 = c.ng;
  normals.geometry_0 = c.ng;
  normals.shadingGeometry_0 = c.n;
  normals.interfaceBase_0 = c.n;
  normals.base_0 = c.n;
  normals.clearcoat_1 = c.n;
  normals.anisotropyTangent_0 = c.anisotropyTangent;
  return normals;
}

MaterialBsdfState_0 make_slang_bsdf_state(const in MaterialClosure c) {
  SurfaceMaterial_0 surface = make_slang_surface(c);
  SurfaceLayerNormals_0 normals = make_slang_normals(c);
  SurfaceClosure_0 closure = buildSurfaceClosure_0(surface, normals, normals.anisotropyTangent_0);

  TransportContext_0 transport;
  transport.currentMediumIor_1 = 1.0;
  transport.interfaceIor_0 = max(surface.ior_0, 1.0);
  transport.thinWalled_2 = surface.thinWalled_0;
  transport._pad0_0 = 0.0;

  return prepareMaterialBsdfState_0(surface, closure, transport);
}

DirectionContext_0 make_slang_directions(vec3 wi, vec3 wo) {
  DirectionContext_0 directions;
  directions.viewDir_17 = wi;
  directions.lightDir_17 = wo;
  return directions;
}

NormalContext_0 make_slang_normal_context(const in MaterialClosure c) {
  NormalContext_0 normals;
  normals.rawGeometryNormal_0 = c.ng;
  normals.transmissionNormal_0 = c.n;
  normals.baseNormal_3 = c.n;
  normals.clearcoatNormal_2 = c.n;
  return normals;
}

vec3 eval_dspbr(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 bsdf_with_cos = evalMaterialBsdf_0(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, wo),
    make_slang_normal_context(c)
  );
  return bsdf_with_cos / max(abs(dot(c.n, wo)), EPS);
}

float dspbr_pdf(const in MaterialClosure c, vec3 wi, vec3 wo) {
  return pdfMaterialBsdf_0(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, wo),
    make_slang_normal_context(c)
  );
}

vec3 sample_dspbr(inout MaterialClosure c, vec3 wi, in vec3 uvw, inout vec3 bsdf_over_pdf, out float pdf) {
  SampleRandoms_0 randoms;
  randoms.component_0 = rng_float();
  randoms.lobe_0 = uvw.xy;
  randoms.boundary_0 = uvw.z;

  BsdfSample_0 bsdfSample = sampleMaterialBsdf_0(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, vec3(0.0)),
    make_slang_normal_context(c),
    randoms
  );

  pdf = bsdfSample.pdf_1;
  bsdf_over_pdf = bsdfSample.bsdfOverPdf_0;
  c.event_type = 0;
  if (bsdfSample.specular_2 > 0.5 && c.roughness <= MINIMUM_ROUGHNESS) c.event_type |= E_DELTA;
  if (dot(bsdfSample.direction_0, c.ng) < 0.0) c.event_type |= E_TRANSMISSION;
  else c.event_type |= E_REFLECTION;
  return bsdfSample.direction_0;
}
