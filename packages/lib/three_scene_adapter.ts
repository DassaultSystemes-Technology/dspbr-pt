import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PathtracingSceneData, TexInfo, MaterialData, Light, VERTEX_STRIDE } from './scene_data';

const supportedVertexAttributes = ["position", "normal", "tangent", "uv", "uv1", "color"];

export class ThreeSceneAdapter {

  private _scene: PathtracingSceneData;
  private threeScene: THREE.Scene | THREE.Group;
  private gltfInfo?: GLTF;

  public get scene() {
    return this._scene;
  }

  constructor(scene: THREE.Scene | THREE.Group, gltf?: GLTF) {
    this.threeScene = scene;
    this.gltfInfo = gltf;
    this._scene = new PathtracingSceneData();
  }

  private calculateNumSceneVertices(scene: THREE.Scene | THREE.Group) {
    let numVertices = 0;
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.geometry.groups.length > 0) {
          for (let i = 0; i < child.geometry.groups.length; i++) {
            numVertices += child.geometry.groups[i].count;
          }
        } else {
          numVertices += child.geometry.index.count;
        }
      }
    });

    return numVertices;
  }

  public async init() {
    console.time("Scene parsing");
    let meshes: THREE.Mesh[] = [];
    let materials: THREE.MeshPhysicalMaterial[] = [];

    const numVertices = this.calculateNumSceneVertices(this.threeScene);
    const combinedMeshBuffer = new Float32Array(numVertices * VERTEX_STRIDE);

    let vertexOffset = 0;
    this.threeScene.traverse((child: any) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          materials.push(child.material[0] as THREE.MeshPhysicalMaterial);
        } else {
          materials.push(child.material as THREE.MeshPhysicalMaterial);
        }

        const matIdx = materials.length - 1;
        vertexOffset += this.processMesh(child, matIdx, combinedMeshBuffer, vertexOffset);
      }
      else if (child.isLight) {
        let l = new Light();
        let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
        l.position = pos.toArray();
        l.type = (child.type === "PointLight") ? 0 : 1;
        l.emission = child.color.multiplyScalar(child.intensity).toArray();
        const lightIdx = this._scene.addLight(l);
      }
    });

    console.timeEnd("Scene parsing");

    this._scene.triangleBuffer = combinedMeshBuffer;

    for (let m in materials) {
      const mat = await this.parseMaterial(materials[m], this._scene, this.gltfInfo);
      this._scene.addMaterial(mat);
    }
  }

  private processMesh(mesh: THREE.Mesh, matIdx: number, buffer: Float32Array, offset: number) {
    let geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld); // bake transformations
    this.homogenizeVertexAttributes(geo);

    if (geo.index)
      geo = geo.toNonIndexed();

    let numVertices = geo.attributes.position.count;
    for (let i = 0; i < numVertices; i++) {
      const dstIdx = offset * VERTEX_STRIDE + i * VERTEX_STRIDE;

      let pos = geo.attributes.position.array;
      buffer[dstIdx + 0] = pos[i * 3 + 0];
      buffer[dstIdx + 1] = pos[i * 3 + 1];
      buffer[dstIdx + 2] = pos[i * 3 + 2];
      buffer[dstIdx + 3] = matIdx;

      let normals = geo.attributes.normal.array;
      buffer[dstIdx + 4] = normals[i * 3 + 0];
      buffer[dstIdx + 5] = normals[i * 3 + 1];
      buffer[dstIdx + 6] = normals[i * 3 + 2];
      buffer[dstIdx + 7] = 0.0;

      const uv = geo.attributes.uv.array;
      buffer[dstIdx + 8] = uv[i * 2 + 0];
      buffer[dstIdx + 9] = uv[i * 2 + 1];

      const uv1 = geo.attributes.uv1.array;
      buffer[dstIdx + 10] = uv1[i * 2 + 0];
      buffer[dstIdx + 11] = uv1[i * 2 + 1];

      const tangents = geo.attributes.tangent.array;
      buffer[dstIdx + 12] = tangents[i * 4 + 0];
      buffer[dstIdx + 13] = tangents[i * 4 + 1];
      buffer[dstIdx + 14] = tangents[i * 4 + 2];
      buffer[dstIdx + 15] = tangents[i * 4 + 3];

      const colors = geo.attributes.color.array;
      buffer[dstIdx + 16] = colors[i * 4 + 0];
      buffer[dstIdx + 17] = colors[i * 4 + 1];
      buffer[dstIdx + 18] = colors[i * 4 + 2];
      buffer[dstIdx + 19] = colors[i * 4 + 3];
    }
    geo.dispose();
    return numVertices;
  }

  private homogenizeVertexAttributes(geo: THREE.BufferGeometry) {
    for (let attr in geo.attributes) {
      if (!supportedVertexAttributes.includes(attr))
        delete geo.attributes[attr];
    }

    if (!geo.attributes.normal) {
      console.log("No normals found. Computing normals...")
      geo.computeVertexNormals();
    }
    if (geo.attributes.uv && !geo.attributes.tangent) {
      console.log("No tangents found. Computing tangents...")
      geo.computeTangents();
    }

    const numVertices = geo.attributes.position.count;
    if (!geo.attributes.uv) {
      const uvs = new Float32Array(numVertices * 2);
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }
    if (!geo.attributes.uv1) {
      const uvs = new Float32Array(numVertices * 2);
      geo.setAttribute('uv1', new THREE.BufferAttribute(uvs, 2));
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
  }

  private async parseMaterial(mat: THREE.MeshPhysicalMaterial, sceneData: PathtracingSceneData, gltf?: GLTF) {
    // console.log(mat);
    let matInfo = new MaterialData();

    matInfo.name = mat.name != "" ? mat.name : mat.uuid;
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

      function get_param(name: string, obj: any, default_value: any) {
        return (name in obj) ? obj[name] : default_value;
      };

      async function parseExtensions(name: string, parseFunc: Function) {
        const ext = findExtension(name, mat);
        if (ext) {
          // console.log(`  ${name}`);
          await parseFunc(ext);
        }
      };

      parseExtensions('KHR_materials_emissive_strength', (ext: any) => {
        const emissiveStrength = get_param("emissiveStrength", ext, 1.0);
        matInfo.emission = matInfo.emission.map(x => x * emissiveStrength);
      });

      await parseExtensions('KHR_materials_anisotropy', async (ext: any) => {
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

      await parseExtensions('KHR_materials_iridescence', async (ext: any) => {
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

      await parseExtensions('KHR_materials_translucency', translucencyParser);
      await parseExtensions('3DS_materials_translucency', translucencyParser);

      parseExtensions('3DS_materials_volume', (ext: any) => {
        c.thinWalled = get_param("thinWalled", ext, matInfo.thinWalled);
        matInfo.attenuationColor = get_param("attenuationColor", ext, matInfo.attenuationColor);
        matInfo.attenuationDistance = get_param("attenuationDistance", ext, matInfo.attenuationDistance);
        matInfo.subsurfaceColor = get_param("subsurfaceColor", ext, matInfo.subsurfaceColor);
      });

      // parseExtensions('KHR_materials_sss', (ext: any) => {
      //   matInfo.scatterColor = get_param("scatterColor", ext, matInfo.scatterColor);
      //   matInfo.scatterDistance = get_param("scatterDistance", ext, matInfo.scatterDistance);
      // });
    }
    matInfo.dirty = false;

    return matInfo;
  }

}