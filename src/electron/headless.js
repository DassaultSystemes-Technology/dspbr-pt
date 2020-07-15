/* @license
 * Copyright 2020  Dassault Syst�mes - All Rights Reserved.
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
import { PathtracingRenderer } from '../../lib/renderer.js';

const { ipcRenderer } = window.require('electron');
var path = window.require('path');

let remote = window.require('electron').remote,
  args = remote.getGlobal('sharedObject').args;

function startRenderer() {
  let canvas = document.getElementById("canvas");
  let renderer = new PathtracingRenderer(canvas, true);
  renderer.setPixelRatio(1.0);
  renderer.autoScaleOnImport(false);

  renderer.loadScene(args.gltf_path, function () {
    if (args.ibl === "None") {
      renderer.render(args.samples, () => { }, function (result) {
        console.log("icpRenderer Ready");
        ipcRenderer.send('rendererReady');
      });      
    } else {
      renderer.loadIBL(args.ibl, () => {
        console.log("loaded ibl" + args.ibl);
        renderer.render(args.samples, () => { }, (result) => {
          console.log("icpRenderer Ready");
          ipcRenderer.send('rendererReady');
        });
      });
    }
  });
}

window.onload = function () {
  startRenderer();
};