
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LoadingManager } from 'three';

export function loadSceneFromBlobs(urlList: any, autoscale: boolean) {
  var manager = new THREE.LoadingManager();

  let blobs: any = {};
  for (var i = 0; i < urlList.length; i++) {
    let name = urlList[i].name;
    if (getFileExtension(urlList[i].name) !== "gltf" &&
      getFileExtension(urlList[i].name) !== "glb") {
      name = "./" + name;
    }

    blobs[name] = urlList[i];
  }

  // Initialize loading manager with URL callback.
  var objectURLs = [];
  manager.setURLModifier((url: string) => {
    if (url.startsWith("blob"))
      return url;

    console.log("Parsing blob resource: " + url);
    url = URL.createObjectURL(blobs[url]);
    objectURLs.push(url);
    return url;
  });

  function getFileExtension(filename: string) {
    return filename.split('.').pop();
  }

  for (var i = 0; i < urlList.length; i++) {
    if (getFileExtension(urlList[i].name) === "gltf" ||
      getFileExtension(urlList[i].name) === "glb")
      return loadScene(urlList[i].name, autoscale, manager);
  }
}

export function loadIBL(ibl: string) {
  return new Promise((resolve, reject) => {
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .load(ibl, (texture) => {
        resolve(texture);
      });
  });
}

export function loadScene(url: string, autoscale: boolean, manager?: LoadingManager) {
  var loader = new GLTFLoader(manager);

  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {

      const scene = gltf.scene || gltf.scenes[0];

      if (!scene) {
        // Valid, but not supported by this viewer.
        throw new Error(
          'This model contains no scene, and cannot be viewed here. However,'
          + ' it may contain individual 3D resources.'
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
    }, (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (error) => {
      reject(new Error('Error loading glTF scene: ' + error));
    });
  });
}