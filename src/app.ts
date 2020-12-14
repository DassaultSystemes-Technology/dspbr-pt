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

// import "core-js/stable";
// import 'regenerator-runtime/runtime'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'dat.GUI';
import scene_index from '../assets/scenes/scene_index.js';
import ibl_index from '../assets/env/ibl_index.js';
import { PathtracingRenderer } from '../lib/renderer';

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

// var container, canvas, stats, _gui;
// var renderer, scene, envMap;

function getFileExtension(filename: string) {
  return filename.split('.').pop();
}

class App {
  _gui: any;
  _stats: any | null;
  _renderer: any;
  _container: HTMLElement | null;
  Scene: string;
  IBL: string;

  isRendering = false;
  pathtracing = true;
  forceIBLEvalOnLastBounce = false;
  maxBounceDepth = 4;
  debugMode = "None";
  autoScaleOnImport = true;
  useIBL = false;
  disableBackground = false;
  autoRotate = false;
  pixelRatio = 0.5;
  exposure = 1.0;

  constructor() {
    this.Scene = Object.values<string>(scene_index)[0];
    this.IBL = Object.values<string>(ibl_index)[0];

    this._container = document.createElement('div');
    document.body.appendChild(this._container);
    let canvas = document.createElement('canvas');
    this._container.appendChild(canvas);

    let _this = this;
    this._renderer = new PathtracingRenderer(canvas, true);
    this._renderer.loadScene(this.Scene, function () {
      _this._renderer.loadIBL(_this.IBL, () => {
        _this._renderer.setUseIBL(true);
      });
      _this._renderer.render(-1, () => {
        _this._stats.update();
      });
    });

    //this._gui.domElement.classList.remove("hidden");

    this._stats = new (Stats as any)();
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.top = '0px';
    this._stats.domElement.style.cursor = "default";
    this._stats.domElement.style.webkitUserSelect = "none";
    this._stats.domElement.style.MozUserSelect = "none";
    this._container.appendChild(this._stats.domElement);

    window.addEventListener('resize', ()=>{
      console.log("resizing", window.innerWidth, window.innerHeight);
      _this._renderer.resize(window.innerWidth, window.innerHeight);
    }, false);

    canvas.addEventListener('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files.length == 1 &&
        getFileExtension(e.dataTransfer.files[0].name) == "hdr") {
        console.log("loading HDR...");
        // const url = URL.createObjectURL(e.dataTransfer.getData('text/html'));
        _this._renderer.loadIBL(URL.createObjectURL(e.dataTransfer.items[0].getAsFile()));
      } else {
        _this._renderer.loadSceneFromBlobs(e.dataTransfer.files, function () {
          _this._renderer.loadIBL(_this.IBL);
          _this._renderer.render(-1, () => {
            _this._stats.update();
          });
        });
      }
    });

    this.initUI();
  }


  initUI() {
    if (this._gui)
      return;

    let _this = this;

    this._gui = new GUI();
    this._gui.domElement.classList.add("hidden");

    this._gui.add(this, "Scene", scene_index).onChange(function (value) {
      console.log(`Loading ${value}`);
      _this._renderer.loadScene(value, function () {
        _this._renderer.loadIBL(_this.IBL);
        _this._renderer.render(-1, () => {
          _this._stats.update();
        });
      });
    });

    this._gui.add(this, "IBL", ibl_index).onChange(function (value) {
      console.log(`Loading ${value}`);
      _this._renderer.loadIBL(value);
    });

    this._gui.add(this, 'pathtracing').onChange(function (value) {
      _this._renderer.usePathtracing(value);
    });

    this._gui.add(this, 'exposure').min(0).max(10).step(0.1).onChange(function (value) {
      _this._renderer.setExposure(value);
    });

    this._gui.add(this, 'forceIBLEvalOnLastBounce').onChange(function (value) {
      _this._renderer.forceIBLEvalOnLastBounce(value);
    });

    this._gui.add(this, 'maxBounceDepth').min(0).max(16).step(1).onChange(function (value) {
      _this._renderer.setMaxBounceDepth(value);
    });
    this._gui.add(this, 'debugMode', this._renderer.debugModes).onChange(function (value) {
      _this._renderer.setDebugMode(value);
    });
    this._gui.add(this, 'autoScaleOnImport').onChange(function (value) {
      _this._renderer.autoScaleOnImport(value);
    });

    this._gui.add(this, 'useIBL').onChange(function (value) {
      _this._renderer.useIBL(value);
    });

    this._gui.add(this, 'disableBackground').onChange(function (value) {
      _this._renderer.disableBackground(value);
    });

    this._gui.add(this, 'autoRotate').onChange(function (value) {
      _this._renderer.enableAutoRotate(value);
    });

    this._gui.add(this, 'pixelRatio').min(0.1).max(1.0).onChange(function (value) {
      _this._renderer.setPixelRatio(value);
      _this._renderer.resize(window.innerWidth, window.innerHeight);
    });

    let reload_obj = {
      reload: function () {
        _this._renderer.loadScene(_this.Scene, function () {
          _this._renderer.render(-1, () => {
            _this._stats.update();
          });
        });
        console.log("Reload")
      }
    };
    this._gui.add(reload_obj, 'reload');

    const center_obj = {
      centerView: function () {
        _this._renderer.centerView();
        console.log("center view")
      }
    };
    this._gui.add(center_obj, 'centerView');
  } 
}

let app = new App();