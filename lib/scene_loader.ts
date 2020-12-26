
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LoadingManager } from 'three';

// function cleanupScene(scene) {
//   console.log('Cleaning up scene data...!')

//   const cleanMaterial = material => {
//     console.log('dispose material!')
//     material.dispose()

//     // dispose textures
//     for (const key of Object.keys(material)) {
//       const value = material[key]
//       if (value && typeof value === 'object' && 'minFilter' in value) {
//         console.log('dispose texture!')
//         value.dispose()
//       }
//     }
//   };
//   scene.traverse(object => {
//     if (!object.isMesh) return

//     console.log('dispose geometry!')
//     object.geometry.dispose()

//     if (object.material.isMaterial) {
//       cleanMaterial(object.material)
//     } else {
//       // an array of materials
//       for (const material of object.material) cleanMaterial(material)
//     }
//   });
// }

export function loadSceneFromBlobs(urlList: any, autoscale: boolean, callback: (gltf: any) => void) {
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
      loadScene(urlList[i].name, autoscale, callback, manager);
  }
}

export function loadIBL(ibl: string, callback: (ibl: any) => void) {
  new RGBELoader()
    .setDataType(THREE.FloatType)
    .load(ibl, function (texture) {
      if (callback) {
        callback(texture);
      }
    });
}

export function loadScene(url: string, autoscale: boolean, callback: (gltf: any) => void, manager?: LoadingManager) {
  var loader = new GLTFLoader(manager);
  loader.load(url, function (gltf) {

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
    callback(gltf);
  }, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  }, (error) => {
    console.log('Error loading glTF scene: ' + error);
  });
}