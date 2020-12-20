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

import "core-js/stable";
import 'regenerator-runtime/runtime'
import * as THREE from 'three'
import { PathtracingRenderer } from '../../lib/renderer';
import * as loader from '../scene_loader';

const { ipcRenderer } = window.require('electron');
var path = window.require('path');

let remote = window.require('electron').remote,
  args = remote.getGlobal('sharedObject').args;

function startRenderer() {
  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let renderer = new PathtracingRenderer(canvas, 1.0);
  renderer.tonemapping = "None";
  renderer.iblRotation = args.ibl_rotation;
  renderer.maxBounces = args.bounces;

  loader.loadScene(args.gltf_path, false, (gltf) => {
    let cameras = [];
    gltf.scene.traverse((child) => {
      if (child.isCamera) {
        child.position.applyMatrix4(child.matrixWorld);
        cameras.push(child);
      }
    });

    if(cameras.length > 0) {
      var camera = cameras[0];
    } else {
      var camera = new THREE.PerspectiveCamera(45, 
        window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 3);
    }

    renderer.setScene(gltf, () => {
     if (args.ibl === "None") {
        renderer.render(camera, args.samples, () => { }, (result) => {
          console.log("icpRenderer Ready");
          ipcRenderer.send('rendererReady');
        });
      } else {
        loader.loadIBL(args.ibl, (ibl) => {
          console.log("loaded ibl" + args.ibl);
          renderer.setIBL(ibl );
          renderer.render(camera, args.samples, () => { }, (result) => {
            console.log("icpRenderer Ready");
            ipcRenderer.send('rendererReady');
          });
        });
      }
    });
  });
}

window.onload = function () {
  startRenderer();
};