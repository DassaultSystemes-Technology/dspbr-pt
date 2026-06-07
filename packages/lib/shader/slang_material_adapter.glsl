SlangPbrSurfaceMaterial make_slang_surface(const in MaterialClosure c) {
  SlangPbrSurfaceMaterial surface;
  surface.albedo = c.albedo;
  surface.metallic = c.metallic;
  surface.roughness = c.roughness;
  surface.anisotropy = c.anisotropy;
  surface.anisotropyDirection = c.anisotropyTangent;
  surface.transparency = c.transparency;
  surface.ior = c.ior;
  surface.specularColor = c.specular_tint;
  surface.specular = c.specular;
  surface.emission = c.emission;
  surface.normalScale = 1.0;
  surface.attenuationColor = c.attenuationColor;
  surface.attenuationDistance = c.attenuationDistance;
  surface.multiscatterColor = vec3(0.0);
  surface.scatterAnisotropy = 0.0;
  surface.thinWalled = c.thin_walled ? 1.0 : 0.0;
  surface.translucency = c.translucency;
  surface.translucencyColor = c.translucencyColor;
  surface.iridescence = c.iridescence;
  surface.iridescenceIor = c.iridescence_ior;
  surface.iridescenceThickness = c.iridescence_thickness;
  surface.dispersion = c.dispersion;
  surface.clearcoat = c.clearcoat;
  surface.clearcoatRoughness = c.clearcoatRoughness;
  surface.sheenColor = c.sheen_color;
  surface.sheenRoughness = c.sheen_roughness;
  surface.clearcoatNormalScale = 1.0;
  surface.frontFaceEmissionOnly = 0.0;
  return surface;
}

SlangPbrSurfaceLayerNormals make_slang_normals(const in MaterialClosure c) {
  SlangPbrSurfaceLayerNormals normals;
  normals.rawGeometry = c.ng;
  normals.geometry = c.ng;
  normals.shadingGeometry = c.n;
  normals.interfaceBase = c.n;
  normals.base = c.n;
  normals.clearcoat = c.n;
  normals.anisotropyTangent = c.anisotropyTangent;
  return normals;
}

SlangPbrMaterialBsdfState make_slang_bsdf_state(const in MaterialClosure c) {
  SlangPbrSurfaceMaterial surface = make_slang_surface(c);
  SlangPbrSurfaceLayerNormals normals = make_slang_normals(c);
  SlangPbrSurfaceClosure closure = slangPbrBuildSurfaceClosure(surface, normals, normals.anisotropyTangent);

  SlangPbrTransportContext transport;
  transport.currentMediumIor = 1.0;
  transport.interfaceIor = max(surface.ior, 1.0);
  transport.thinWalled = surface.thinWalled;
  transport._pad0 = 0.0;

  return slangPbrPrepareMaterialBsdfState(surface, closure, transport);
}

SlangPbrDirectionContext make_slang_directions(vec3 wi, vec3 wo) {
  SlangPbrDirectionContext directions;
  directions.viewDir = wi;
  directions.lightDir = wo;
  return directions;
}

SlangPbrNormalContext make_slang_normal_context(const in MaterialClosure c) {
  SlangPbrNormalContext normals;
  normals.rawGeometryNormal = c.ng;
  normals.transmissionNormal = c.n;
  normals.baseNormal = c.n;
  normals.clearcoatNormal = c.n;
  return normals;
}

vec3 dspbr_eval(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 bsdf_with_cos = slangPbrEvalMaterialBsdf(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, wo),
    make_slang_normal_context(c)
  );
  return bsdf_with_cos / max(abs(dot(c.n, wo)), EPS);
}

float dspbr_pdf(const in MaterialClosure c, vec3 wi, vec3 wo) {
  return slangPbrPdfMaterialBsdf(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, wo),
    make_slang_normal_context(c)
  );
}

vec3 dspbr_sample(inout MaterialClosure c, vec3 wi, in vec3 uvw, inout vec3 bsdf_over_pdf, out float pdf) {
  SlangPbrSampleRandoms randoms;
  randoms.component = rng_float();
  randoms.lobe = uvw.xy;
  randoms.boundary = uvw.z;

  SlangPbrBsdfSample bsdfSample = slangPbrSampleMaterialBsdf(
    make_slang_bsdf_state(c),
    make_slang_directions(wi, vec3(0.0)),
    make_slang_normal_context(c),
    randoms
  );

  pdf = bsdfSample.pdf;
  bsdf_over_pdf = bsdfSample.bsdfOverPdf;
  c.event_type = 0;
  if (bsdfSample.specular > 0.5 && c.roughness <= MINIMUM_ROUGHNESS) c.event_type |= E_DELTA;
  if (dot(bsdfSample.direction, c.ng) < 0.0) c.event_type |= E_TRANSMISSION;
  else c.event_type |= E_REFLECTION;
  return bsdfSample.direction;
}
