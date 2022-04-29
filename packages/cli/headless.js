/* @license
 * Copyright 2020  Dassault Systemes - All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'regenerator-runtime/runtime'

import {PathtracingRenderer, ThreeSceneTranslator} from 'dspbr-pt';
import {FloatType, PerspectiveCamera} from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

const {ipcRenderer} = window.require('electron');
var path = window.require('path');

let remote = window.require('electron').remote, args = remote.getGlobal('sharedObject').args;

async function startRenderer() {
  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let renderer = new PathtracingRenderer({canvas : canvas});
  renderer.tonemapping = "None";
  renderer.iblRotation = args.ibl_rotation;
  renderer.maxBounces = args.bounces;

  try {
    const gltf = await new GLTFLoader().loadAsync(args.gltf_path);
    gltf.scene.updateMatrixWorld();
    const pathtracingSceneData = await ThreeSceneTranslator.translateThreeScene(gltf.scene, gltf);
    renderer.setScene(pathtracingSceneData).then(() => {
      if (args.ibl !== "None") {
        new RGBELoader().setDataType(FloatType).loadAsync(args.ibl).then((ibl) => {
          console.log("loaded ibl" + args.ibl);
          renderer.setIBL(ibl);
        });
      }

      let cameras = [];
      const scene = gltf.scene || gltf.scenes[0];
      scene.traverse((child) => {
        if (child.isCamera) {
          child.position.applyMatrix4(child.matrixWorld);
          cameras.push(child);
        }
      });

      if (cameras.length > 0) {
        var camera = cameras[0];
      } else {
        var camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 3);
        camera.updateMatrixWorld();
      }

      renderer.render(camera, args.samples, () => {}, (result) => {
        console.log("icpRenderer Ready");
        ipcRenderer.send('rendererReady');
      });
    });
  } catch (error) {
    console.log(error);
    console.log("Skipping scene...");
  }
}

window.onload = function() { startRenderer(); };