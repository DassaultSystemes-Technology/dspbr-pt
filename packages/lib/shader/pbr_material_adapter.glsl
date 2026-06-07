PbrLayerNormals make_pbr_layer_normals(const in MaterialClosure c) {
  PbrLayerNormals normals;
  normals.rawGeometry = c.ng;
  normals.geometry = c.ng;
  normals.shadingGeometry = c.n;
  normals.interfaceBase = c.n;
  normals.base = c.n;
  normals.clearcoat = c.n;
  normals.anisotropyTangent = c.anisotropyTangent;
  return normals;
}

PbrGltfState make_pbr_gltf_state(const in MaterialClosure c) {
  PbrLayerNormals normals = make_pbr_layer_normals(c);
  PbrClosure closure = pbrBuildClosureFromGltf(c.material, normals, normals.anisotropyTangent);

  PbrTransport transport;
  transport.currentMediumIor = 1.0;
  transport.interfaceIor = c.material.ior;
  transport.thinWalled = c.thin_walled ? 1.0 : 0.0;
  transport._pad0 = 0.0;

  return pbrPrepareStateFromGltf(c.material, closure, transport);
}

PbrDirections make_pbr_directions(vec3 wi, vec3 wo) {
  PbrDirections directions;
  directions.viewDir = wi;
  directions.lightDir = wo;
  return directions;
}

PbrNormals make_pbr_normals(const in MaterialClosure c) {
  PbrNormals normals;
  normals.rawGeometryNormal = c.ng;
  normals.transmissionNormal = c.n;
  normals.baseNormal = c.n;
  normals.clearcoatNormal = c.n;
  return normals;
}

vec3 pbr_material_eval(const in MaterialClosure c, vec3 wi, vec3 wo) {
  vec3 bsdf_with_cos = pbrEvalGltfState(
    make_pbr_gltf_state(c),
    make_pbr_directions(wi, wo),
    make_pbr_normals(c)
  );
  return bsdf_with_cos / max(abs(dot(c.n, wo)), EPS);
}

vec3 pbr_material_sample(inout MaterialClosure c, vec3 wi, in vec3 uvw, inout vec3 bsdf_over_pdf, out float pdf) {
  PbrRandoms randoms;
  randoms.component = rng_float();
  randoms.lobe = uvw.xy;
  randoms.boundary = uvw.z;

  PbrSample bsdfSample = pbrSampleGltfState(
    make_pbr_gltf_state(c),
    make_pbr_directions(wi, vec3(0.0)),
    make_pbr_normals(c),
    randoms
  );

  pdf = bsdfSample.pdf;
  bsdf_over_pdf = bsdfSample.bsdfOverPdf;
  c.event_type = 0;
  if (bsdfSample.specular > 0.5 && c.material.roughnessFactor <= MINIMUM_ROUGHNESS) c.event_type |= E_DELTA;
  if (dot(bsdfSample.direction, c.ng) < 0.0) c.event_type |= E_TRANSMISSION;
  else c.event_type |= E_REFLECTION;
  return bsdfSample.direction;
}
