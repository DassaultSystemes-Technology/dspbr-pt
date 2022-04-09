
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

function precompute1DPdfAndCdf(data: Float32Array, pdf: Float32Array,
  cdf: Float32Array, row: number, num: number) {

  const rowIdx = row * num;
  let sum = 0;
  for (let i = 0; i < num; i++) {
    sum += data[rowIdx + i];
  }

  if (sum == 0)
    sum = 1;

  for (let i = 0; i < num; i++) {
    pdf[rowIdx + i] = data[rowIdx + i] / sum;
  }

  cdf[rowIdx] = pdf[rowIdx];
  for (let i = 1; i < num; i++) {
    cdf[rowIdx + i] = cdf[rowIdx + i - 1] + pdf[rowIdx + i];
  }

  cdf[rowIdx + num - 1] = 1;
  return sum;
}

async function precomputeIBLImportanceSamplingData(texture: any) {
  const image = texture.image;
  const w = image.width;
  const h = image.height;
  console.log("Precomputing IBL importance sampling data...");

  const f = new Float32Array(w * h);
  const sumX = new Float32Array(h);

  const pcPDF = new Float32Array(w * h);
  const pcCDF = new Float32Array(w * h);
  const yPDF = new Float32Array(h);
  const yCDF = new Float32Array(h);

  const numChannels = 4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w * numChannels; x++) {
      // relative luminance of rbg pixel value
      const rgbIdx = (x + y * w) * numChannels;
      f[x + y * w] = image.data[rgbIdx] * 0.299 + image.data[rgbIdx + 1] * 0.587 + image.data[rgbIdx + 2] * 0.114;
    }
  }

  for (let y = 0; y < h; y++) {
    precompute1DPdfAndCdf(f, pcPDF, pcCDF, y, w);
    sumX[y] = 0.0;
    for (let x = 0; x < w; x++) {
      sumX[y] += f[x + y * w];
    }
  }

  const totalSum = precompute1DPdfAndCdf(sumX, yPDF, yCDF, 0, h);

  texture["pcPDF"] = pcPDF;
  texture["pcCDF"] = pcCDF;
  texture["yPDF"] = yPDF;
  texture["yCDF"] = yCDF;
  texture["totalSum"] = totalSum;
}

export function loadIBL(ibl: string) {
  return new Promise((resolve) => {
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .load(ibl, (texture) => {
        precomputeIBLImportanceSamplingData(texture);
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
        reject(new Error(
          'This model contains no scene, and cannot be viewed.'
        ));
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