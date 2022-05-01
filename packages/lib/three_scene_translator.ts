import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimpleTriangleBVH } from './bvh';
import { PathtracingSceneData, TexInfo, MaterialData, Light } from './scene_data';

export namespace ThreeSceneTranslator {

  async function parseMaterial(mat: THREE.MeshPhysicalMaterial, sceneData: PathtracingSceneData, gltf?: GLTF) {
    // console.log(mat);
    let matInfo = new MaterialData();

    matInfo.albedo = mat.color.toArray();
    if (mat.map) {
      matInfo.albedoTextureId = sceneData.addTexture(mat.map);
    }

    matInfo.metallic = mat.metalness || 0;
    matInfo.roughness = mat.roughness || 0;
    matInfo.doubleSided = mat.side == THREE.DoubleSide ? 1 : 0;

    matInfo.cutoutOpacity = mat.opacity;
    matInfo.alphaCutoff = mat.alphaTest;
    if (mat.alphaTest == 0.0 && !mat.transparent)
      matInfo.alphaCutoff = 1.0;

    if (mat.metalnessMap) {
      matInfo.metallicRoughnessTextureId = sceneData.addTexture(mat.metalnessMap);
    }

    if (mat.normalMap) {
      matInfo.normalTextureId = sceneData.addTexture(mat.normalMap);
      matInfo.normalScale = mat.normalScale.x;
    }

    if (mat.emissive) {
      matInfo.emission = mat.emissive.toArray();
      if (mat.emissiveMap) {
        matInfo.emissionTextureId = sceneData.addTexture(mat.emissiveMap);
      }
    }

    matInfo.clearcoat = mat.clearcoat || 0;
    if (mat.clearcoatMap) {
      matInfo.clearcoatTextureId = sceneData.addTexture(mat.clearcoatMap);
    }

    matInfo.clearcoatRoughness = mat.clearcoatRoughness || 0;
    if (mat.clearcoatRoughnessMap) {
      matInfo.clearcoatRoughnessTextureId = sceneData.addTexture(mat.clearcoatRoughnessMap);
    }

    matInfo.transparency = mat.transmission || 0;
    if (mat.transmissionMap) {
      matInfo.transmissionTextureId = sceneData.addTexture(mat.transmissionMap);
    }

    matInfo.specular = (mat.specularIntensity === undefined) ? 1.0 : mat.specularIntensity;
    if (mat.specularColor)
      matInfo.specularTint = mat.specularColor.toArray();
    if (mat.specularIntensityMap) {
      matInfo.specularTextureId = sceneData.addTexture(mat.specularIntensityMap);
    }
    if (mat.specularColorMap) {
      matInfo.specularColorTextureId = sceneData.addTexture(mat.specularColorMap);
    }

    if (mat.sheenColor)
      matInfo.sheenColor = mat.sheenColor.toArray();
    if (mat.sheenColorMap) {
      matInfo.sheenColorTextureId = sceneData.addTexture(mat.sheenColorMap);
    }
    matInfo.sheenRoughness = (mat.sheenRoughness === undefined) ? 0.0 : mat.sheenRoughness;
    if (mat.sheenRoughnessMap) {
      matInfo.sheenRoughnessTextureId = sceneData.addTexture(mat.sheenRoughnessMap);
    }

    // KHR_materials_volume
    if (mat.thickness)
      matInfo.thinWalled = mat.thickness == 0.01 ? 1 : 0; //hack: three.js defaults thickness to 0.01 when volume extensions doesn't exist.
    if (mat.attenuationColor)
      matInfo.attenuationColor = mat.attenuationColor.toArray();

    matInfo.attenuationDistance = mat.attenuationDistance || matInfo.attenuationDistance;

    if (matInfo.attenuationDistance == 0.0)
      matInfo.attenuationDistance = Number.MAX_VALUE;

    // KHR_materials_ior
    matInfo.ior = mat.ior || matInfo.ior;

    if (gltf) {
      // console.log(`Parsing Extensions`);
      const setTextureTransformFromExt = (texInfo: TexInfo, ext: any) => {
        if ("extensions" in ext && "KHR_texture_transform" in ext.extensions) {
          let transform = ext.extensions["KHR_texture_transform"];
          if ("offset" in transform)
            texInfo.texOffset = transform["offset"];
          if ("scale" in transform)
            texInfo.texScale = transform["scale"];
        }
      };

      const findExtension = (name: string, mat: THREE.MeshPhysicalMaterial) => {
        // check for unofficial extension in extras
        if (name in mat.userData) {
          return mat.userData[name];
        }

        // Check for offical extensions
        if ('gltfExtensions' in mat.userData) {
          if (name in mat.userData.gltfExtensions) {
            return mat.userData.gltfExtensions[name];
          }
        }

        return null;
      }

      const get_param = function (name: string, obj: any, default_value: any) {
        return (name in obj) ? obj[name] : default_value;
      };

      const parseExtensions = (name: string, parseFunc: Function) => {
        const ext = findExtension(name, mat);
        if (ext) {
          // console.log(`  ${name}`);
          parseFunc(ext);
        }
      };

      parseExtensions('KHR_materials_emissive_strength', (ext: any) => {
        const emissiveStrength = get_param("emissiveStrength", ext, 1.0);
        matInfo.emission = matInfo.emission.map(x => x * emissiveStrength);
      });

      parseExtensions('KHR_materials_anisotropy', async (ext: any) => {
        matInfo.anisotropy = get_param("anisotropy", ext, matInfo.anisotropy);
        matInfo.anisotropyDirection = get_param("anisotropyDirection", ext, matInfo.anisotropyDirection);
        if ("anisotropyTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.anisotropyTexture.index)
            .then((tex: THREE.Texture) => {
              matInfo.anisotropyTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.anisotropyTextureId), ext.anisotropyTexture);
            });
        }
        if ("anisotropyDirectionTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.anisotropyDirectionTexture.index)
            .then((tex: THREE.Texture) => {
              matInfo.anisotropyDirectionTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.anisotropyDirectionTextureId), ext.anisotropyDirectionTexture);
            });
        }
      });

      parseExtensions('3DS_materials_anisotropy', (ext: any) => {
        matInfo.anisotropy = get_param("anisotropyFactor", ext, matInfo.anisotropy);
        let anisotropyRotation = get_param("anisotropyRotationFactor", ext, matInfo.anisotropyRotation) * 2.0 * Math.PI;
        matInfo.anisotropyDirection = [Math.cos(anisotropyRotation), Math.sin(anisotropyRotation), 0];
      });

      parseExtensions('KHR_materials_iridescence', async (ext: any) => {
        matInfo.iridescence = get_param("iridescenceFactor", ext, 1.0);
        matInfo.iridescenceIOR = get_param("iridescenceIor", ext, matInfo.iridescenceIOR);
        matInfo.iridescenceThicknessMinimum = get_param("iridescenceThicknessMinimum", ext, matInfo.iridescenceThicknessMinimum);
        matInfo.iridescenceThicknessMaximum = get_param("iridescenceThicknessMaximum", ext, matInfo.iridescenceThicknessMaximum);
        if ("iridescenceTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.iridescenceTexture.index)
            .then((tex: THREE.Texture) => {
              matInfo.iridescenceTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.iridescenceTextureId), ext.iridescenceTexture);
            });
        }
        if ("iridescenceThicknessTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.iridescenceThicknessTexture.index)
            .then((tex: THREE.Texture) => {
              matInfo.iridescenceThicknessTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.iridescenceThicknessTextureId), ext.iridescenceThicknessTexture);
            });
        }
      });

      const translucencyParser = async (ext: any) => {
        matInfo.translucency = get_param("translucencyFactor", ext, matInfo.transparency);
        matInfo.translucencyColor = get_param("translucencyColorFactor", ext, matInfo.translucencyColor);
        if ("translucencyTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.translucencyTexture.index)
            .then((tex) => {
              matInfo.translucencyTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.translucencyTextureId), ext.translucencyTexture);
            });
        }
        if ("translucencyColorTexture" in ext) {
          await gltf.parser.getDependency('texture', ext.translucencyColorTexture.index)
            .then((tex) => {
              matInfo.translucencyColorTextureId = sceneData.addTexture(tex);
              setTextureTransformFromExt(sceneData.getTexInfo(matInfo.translucencyColorTextureId), ext.translucencyColorTexture);
            });
        }
      };

      parseExtensions('KHR_materials_translucency', translucencyParser);
      parseExtensions('3DS_materials_translucency', translucencyParser);

      parseExtensions('3DS_materials_volume', async (ext: any) => {
        matInfo.thinWalled = get_param("thinWalled", ext, matInfo.thinWalled);
        matInfo.attenuationColor = get_param("attenuationColor", ext, matInfo.attenuationColor);
        matInfo.attenuationDistance = get_param("attenuationDistance", ext, matInfo.attenuationDistance);
        matInfo.subsurfaceColor = get_param("subsurfaceColor", ext, matInfo.subsurfaceColor);
       });

      // parseExtensions('KHR_materials_sss', (ext: any) => {
      //   matInfo.scatterColor = get_param("scatterColor", ext, matInfo.scatterColor);
      //   matInfo.scatterDistance = get_param("scatterDistance", ext, matInfo.scatterDistance);
      // });
    }

    sceneData.addMaterial(matInfo);
  }

  export async function translateThreeScene(scene: THREE.Group, gltf?: GLTF) {

    // return Promise()
    const sceneData = new PathtracingSceneData();

    console.time("Scene parsing");
    let meshes: THREE.Mesh[] = [];
    let triangleMaterialMarkers: number[] = [];
    let materials: THREE.MeshPhysicalMaterial[] = [];

    scene?.traverse((child: any) => {
      if (child.isMesh || child.isLight) {
        if (child.isMesh) {
          if (child.material.length > 0) {
            materials.push(child.material[0]);
          } else {
            materials.push(child.material);
          }

          if (child.geometry.groups.length > 0) {
            for (let i = 0; i < child.geometry.groups.length; i++) {
              triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
                triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0) +
                child.geometry.groups[i].count / 3);
            }
          } else {
            triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
              triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0)
              + child.geometry.index.count / 3);
          }
          meshes.push(child);
        }
        else if (child.isLight) {
          let l = new Light();
          let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
          l.position = pos.toArray();
          l.type = (child.type === "PointLight") ? 0 : 1;
          l.emission = child.color.multiplyScalar(child.intensity).toArray();
          sceneData.addLight(l);
        }
      }
    });

    for (let m in materials) {
      await parseMaterial(materials[m], sceneData, gltf);
    }
    console.timeEnd("Scene parsing");

    console.time("Geometry preperation");
    let geoList: THREE.BufferGeometry[] = [];
    for (let i = 0; i < meshes.length; i++) {
      let geo: THREE.BufferGeometry = <THREE.BufferGeometry>meshes[i].geometry.clone();
      geo.applyMatrix4(meshes[i].matrixWorld);

      // mergeBufferGeometries expects consitent attributes throughout all geometries, otherwise it fails
      // we need to get rid of unsupported attributes
      const supportedAttributes = ["position", "normal", "tangent", "uv", "uv2", "color"];

      for (let attr in geo.attributes) {
        if (!supportedAttributes.includes(attr))
          delete geo.attributes[attr];
      }

      if (!geo.attributes.normal)
        geo.computeVertexNormals();
      if (geo.attributes.uv && !geo.attributes.tangent)
        geo.computeTangents();

      const numVertices = geo.attributes.position.count;
      if (!geo.attributes.uv) {
        const uvs = new Float32Array(numVertices * 2);
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      }
      if (!geo.attributes.uv2) {
        const uvs = new Float32Array(numVertices * 2);
        geo.setAttribute('uv2', new THREE.BufferAttribute(uvs, 2));
      }
      if (!geo.attributes.tangent) {
        const tangents = new Float32Array(numVertices * 4);
        geo.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
      }
      if (!geo.attributes.color) {
        const col = new Float32Array(numVertices * 4);
        geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
      }

      geo.morphAttributes = {};
      geo.morphTargetsRelative = false;;

      geoList.push(geo);
    }

    // Merge geometry from all models into a single mesh
    // TODO get rid of this extra merge step and merge directly into the render data buffer
    let modelMesh = new THREE.Mesh(mergeBufferGeometries(geoList));
    let bufferGeometry = <THREE.BufferGeometry>modelMesh.geometry;
    if (bufferGeometry.index)
      bufferGeometry = bufferGeometry.toNonIndexed();

    let total_number_of_triangles = bufferGeometry.attributes.position.count / 3;

    var vpa = new Float32Array(total_number_of_triangles * 12);

    let materialIdx = 0;
    let pos = bufferGeometry.attributes.position.array;
    for (let i = 0; i < total_number_of_triangles; i++) {
      if (i >= triangleMaterialMarkers[materialIdx]) {
        materialIdx++;
      }
      vpa[i * 12 + 0] = pos[i * 9 + 0];
      vpa[i * 12 + 1] = pos[i * 9 + 1];
      vpa[i * 12 + 2] = pos[i * 9 + 2];
      vpa[i * 12 + 3] = materialIdx;

      vpa[i * 12 + 4] = pos[i * 9 + 3];
      vpa[i * 12 + 5] = pos[i * 9 + 4];
      vpa[i * 12 + 6] = pos[i * 9 + 5];
      vpa[i * 12 + 7] = materialIdx;

      vpa[i * 12 + 8] = pos[i * 9 + 6];
      vpa[i * 12 + 9] = pos[i * 9 + 7];
      vpa[i * 12 + 10] = pos[i * 9 + 8];
      vpa[i * 12 + 11] = materialIdx;
    }
    console.timeEnd("Geometry preperation");

    console.time("BvhGeneration");
    const bvh = new SimpleTriangleBVH(4);
    bvh.build(vpa);
    console.timeEnd("BvhGeneration");

    console.time("Prepare flattened data buffers");

    const vna = bufferGeometry.attributes.normal.array;
    const vuv = bufferGeometry.attributes.uv.array;
    const vuv2 = bufferGeometry.attributes.uv2.array;
    const tga = bufferGeometry.attributes.tangent.array;
    const col = bufferGeometry.attributes.color.array;

    const numFloatsPerVertex = 20;
    const meshBuffer = new Float32Array(total_number_of_triangles * 3 * numFloatsPerVertex);
    for (let i = 0; i < total_number_of_triangles; i++) {
      let srcTriangleIdx = bvh.m_pTriIndices[i];

      for (let vertIdx = 0; vertIdx < 3; vertIdx++) {
        let dstIdx = i * numFloatsPerVertex * 3 + vertIdx * numFloatsPerVertex;

        // position
        let srcIdx = srcTriangleIdx * 12 + vertIdx * 4;
        meshBuffer[dstIdx + 0] = vpa[srcIdx + 0];
        meshBuffer[dstIdx + 1] = vpa[srcIdx + 1];
        meshBuffer[dstIdx + 2] = vpa[srcIdx + 2];
        meshBuffer[dstIdx + 3] = vpa[srcIdx + 3];

        // normal
        srcIdx = srcTriangleIdx * 9 + vertIdx * 3;
        meshBuffer[dstIdx + 4] = vna[srcIdx + 0];
        meshBuffer[dstIdx + 5] = vna[srcIdx + 1];
        meshBuffer[dstIdx + 6] = vna[srcIdx + 2];
        meshBuffer[dstIdx + 7] = 0.0;

        // uv0
        srcIdx = srcTriangleIdx * 6 + vertIdx * 2;
        meshBuffer[dstIdx + 8] = vuv[srcIdx];
        meshBuffer[dstIdx + 9] = vuv[srcIdx + 1];

        // uv1
        meshBuffer[dstIdx + 10] = vuv2[srcIdx];
        meshBuffer[dstIdx + 11] = vuv2[srcIdx + 1];

        // tangent
        srcIdx = srcTriangleIdx * 12 + vertIdx * 4;
        meshBuffer[dstIdx + 12] = tga[srcIdx + 0];
        meshBuffer[dstIdx + 13] = tga[srcIdx + 1];
        meshBuffer[dstIdx + 14] = tga[srcIdx + 2];
        meshBuffer[dstIdx + 15] = tga[srcIdx + 3];

        // color
        meshBuffer[dstIdx + 16] = col[srcIdx + 0];
        meshBuffer[dstIdx + 17] = col[srcIdx + 1];
        meshBuffer[dstIdx + 18] = col[srcIdx + 2];
        meshBuffer[dstIdx + 19] = col[srcIdx + 3];
      }
    }
    bufferGeometry.dispose();

    sceneData.triangleBuffer = meshBuffer;
    // console.log("df", sceneData.num_triangles);
    sceneData.bvhBuffer = bvh.createAndCopyToFlattenedArray_StandardFormat();
    console.timeEnd("Prepare flattened data buffers");

    return sceneData;
  }
}