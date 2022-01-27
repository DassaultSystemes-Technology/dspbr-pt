
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebIO, VertexLayout, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dequantize } from '@gltf-transform/functions';


export async function loadSceneFromBlobs(files: [string, File][], autoscale: boolean) {

  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE); // INTERLEAVED (default) or SEPARATE

  function getFileExtension(filename: string) {
    return filename.split('.').pop();
  }

  async function createJSONDocument(uris: [string, File][]) {
    const binaries: { [id: string]: ArrayBuffer; } = {};
    let json: any = {} 

    for (let [path, file] of uris) {
      const buffer = await file.arrayBuffer();
      const ext = getFileExtension(file.name);
     
      if (ext == "gltf") {
        const data = await file.text();
        json = JSON.parse(data);
      } else {
        binaries[path.slice(1)] = buffer;
      }
    }
    const jsonDocument = {
      json: json,
      resources: binaries
    };

    return jsonDocument;
  }

  let doc = {} as Document
  for(let f of files) {
    const file = f[1];
    if (getFileExtension(file.name) === "glb") {
      const buffer = await file.arrayBuffer();
      doc = await io.readBinary(buffer);
    }

    if (getFileExtension(file.name) === "gltf") {
      const jsonDoc = await createJSONDocument(files);
      doc = io.readJSON(jsonDoc);
    }
  }

  await doc.transform(
    dequantize(),
    weld()
  );

  const processed_glb = io.writeBinary(doc);
  return loadScene(processed_glb, autoscale);
}

export function loadIBL(ibl: string) {
  return new Promise((resolve) => {
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .load(ibl, (texture) => {
        resolve(texture);
      });
  });
}

export async function loadSceneFromUrl(url: string, autoscale: boolean) {
  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE); // INTERLEAVED (default) or SEPARATE

  const doc = await io.read(url);
  await doc.transform(
    weld()
  );
  const glb = io.writeBinary(doc);
  return loadScene(glb, autoscale);
}

function loadScene(glb: ArrayBuffer, autoscale: boolean) {
  var loader = new GLTFLoader();
  return new Promise((resolve, reject) => {

    loader.parse(glb, "", (gltf) => {

      const scene = gltf.scene || gltf.scenes[0];

      if (!scene) {
        // Valid, but not supported by this viewer.
        throw new Error(
          'This model contains no scene, and cannot be viewed.'
        );
      }

      var bbox = new THREE.Box3().setFromObject(scene);
      const minValue = Math.min(bbox.min.x, Math.min(bbox.min.y, bbox.min.z));
      const maxValue = Math.max(bbox.max.x, Math.max(bbox.max.y, bbox.max.z));
      const deltaValue = maxValue - minValue;
      let scale = 1.0 / deltaValue;
      // Normalize scene dimensions (needed for easy rt precision control) 
      if (autoscale) {
        scene.scale.set(scale, scale, scale);
      }

      // scene.matrixAutoUpdate = false;
      scene.updateMatrixWorld();
      resolve(gltf);
    }, (error) => {
      reject(new Error('Error loading glTF scene: ' + error));
    });
  });
}