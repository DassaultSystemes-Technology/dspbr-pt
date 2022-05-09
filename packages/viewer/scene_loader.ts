
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebIO, VertexLayout, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dequantize, reorder } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';


export async function loadSceneFromBlobs(files: [string, File][], autoscale?: boolean) {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;

  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE) // INTERLEAVED (default) or SEPARATE
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  function getFileExtension(filename: string) {
    return filename.split('.').pop();
  }

  async function createJSONDocument(uris: [string, File][]) {
    const binaries: { [id: string]: Uint8Array; } = {};
    let json: any = {}

    for (let [path, file] of uris) {
      const buffer = await file.arrayBuffer();
      const ext = getFileExtension(file.name);

      if (ext == "gltf") {
        const data = await file.text();
        json = JSON.parse(data);
      } else {
        binaries[path.slice(1)] = new Uint8Array(buffer);
      }
    }
    const jsonDocument = {
      json: json,
      resources: binaries
    };

    return jsonDocument;
  }

  let doc = {} as Document
  for (let f of files) {
    const file = f[1];
    if (getFileExtension(file.name) === "glb") {
      const buffer = await file.arrayBuffer();
      doc = await io.readBinary(new Uint8Array(buffer));
    }

    if (getFileExtension(file.name) === "gltf") {
      const jsonDoc = await createJSONDocument(files);
      doc = await io.readJSON(jsonDoc);
    }
  }

  await doc.transform(
    dequantize(),
    weld()
  );

  const processed_glb = await io.writeBinary(doc);
  return loadScene(processed_glb.buffer, autoscale);
}

export async function loadSceneFromUrl(url: string, autoscale?: boolean) {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;

  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .setVertexLayout(VertexLayout.SEPARATE) // INTERLEAVED (default) or SEPARATE
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  const doc = await io.read(url);
  await doc.transform(
    dequantize(),
    weld()
  );
  const glb = await io.writeBinary(doc);
  return loadScene(glb.buffer, autoscale);
}

function loadScene(glb: ArrayBuffer, autoscale?: boolean) {
  var loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  var ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath( 'three/examples/js/libs/basis/' );
  loader.setKTX2Loader(ktx2Loader);

  return new Promise((resolve, reject) => {

    loader.parse(glb, "", (gltf) => {

      const scene = gltf.scene || gltf.scenes[0];

      if (!scene) {
        // Valid, but not supported by this viewer.
        reject(new Error(
          'This model contains no scene, and cannot be viewed.'
        ));
      }

      // Normalize scene dimensions (needed for easy rt precision control)
      if (autoscale) {
        var bbox = new THREE.Box3().setFromObject(scene);
        const minValue = Math.min(bbox.min.x, Math.min(bbox.min.y, bbox.min.z));
        const maxValue = Math.max(bbox.max.x, Math.max(bbox.max.y, bbox.max.z));
        const deltaValue = maxValue - minValue;
        let scale = 1.0 / deltaValue;
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