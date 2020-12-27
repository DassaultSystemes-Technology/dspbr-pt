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
import * as loader from '../lib/scene_loader';
import { ThreeRenderer } from '../lib/three_renderer';
import { PathtracingRenderer } from '../lib/renderer';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}


function getFileExtension(filename: string) {
  return filename.split('.').pop();
}

class App {
  _gui: any;
  _stats: any | null;
  canvas: HTMLCanvasElement;
  canvas_three: HTMLCanvasElement;
  canvas_pt: HTMLCanvasElement;
  spinner: HTMLElement;
  container: HTMLElement | null;
  Scene: string;
  IBL: string;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;

  renderer: any;
  three_renderer: ThreeRenderer;

  useControls: true;
  pathtracing = true;
  autoScaleScene = true;
  autoRotate = false;
  interactionScale = 0.2;

  sceneBoundingBox: THREE.Box3;

  constructor() {
    this.Scene = Object.values<string>(scene_index)[0];
    this.IBL = Object.values<string>(ibl_index)[0];

    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    this.spinner = document.getElementsByClassName('spinner')[0];

    this.canvas_pt = document.createElement('canvas');
    this.canvas_three = document.createElement('canvas');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas_pt.width = window.innerWidth;
    this.canvas_pt.height = window.innerHeight;
    this.canvas_three.width = window.innerWidth;
    this.canvas_three.height = window.innerHeight;

    this._stats = new (Stats as any)();
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.top = '0px';
    this._stats.domElement.style.cursor = "default";
    this._stats.domElement.style.webkitUserSelect = "none";
    this._stats.domElement.style.MozUserSelect = "none";
    this.container.appendChild(this._stats.domElement);

    let aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);
    this.camera.position.set(0, 0, 3);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.screenSpacePanning = true;

    this.controls.addEventListener('change', () => {
      this.camera.updateMatrixWorld();
      this.renderer.resetAccumulation();
    });

    this.controls.addEventListener('start', () => {
      this["renderScale"] = this.renderer.renderScale;
      this.renderer.renderScale = this.interactionScale;
    });

    this.controls.addEventListener('end', () => {
      this.renderer.renderScale = this["renderScale"];
    });

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    }

    this.renderer = new PathtracingRenderer(this.canvas_pt, window.devicePixelRatio);
    this.three_renderer = new ThreeRenderer(this.canvas_three, window.devicePixelRatio);
    this.loadScene(this.Scene);

    this.renderer.renderScale = 0.5;
    // this.renderer.iblRotation = 180.0;

    window.addEventListener('resize', () => {
      this.resize();
    }, false);

    this.container.addEventListener('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files.length == 1 &&
        getFileExtension(e.dataTransfer.files[0].name) == "hdr") {
        console.log("loading HDR...");
        // const url = URL.createObjectURL(e.dataTransfer.getData('text/html'));
        loader.loadIBL(URL.createObjectURL(e.dataTransfer.items[0].getAsFile())).then((ibl) => {
          this.renderer.setIBL(ibl);
          this.three_renderer.setIBL(ibl);
        });
      } else {
        this.showSpinner();
        const scenePromise = loader.loadSceneFromBlobs(e.dataTransfer.files, this.autoScaleScene);
        const iblPromise = loader.loadIBL(this.IBL);
        Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
          this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
          this.renderer.setIBL(ibl);
          this.renderer.setScene(gltf).then(() => {
            this.startPathtracing();
            this.hideSpinner();
          });

          this.three_renderer.setScene(gltf.scene);
          this.three_renderer.setIBL(ibl);
        });
      }
    });

    this.initUI();
    this.hideSpinner();
  }

  private startRasterizer() {
    this.stopPathtracing();
    this.three_renderer.render(this.camera, () => {
      var destCtx = this.canvas.getContext("2d");
      destCtx.drawImage(this.canvas_three, 0, 0);
    });
  }

  private stopRasterizer() {
    this.three_renderer.stopRendering();
  }

  private stopPathtracing() {
    this.renderer.stopRendering();
  }

  private startPathtracing() {
    this.stopRasterizer();

    this.renderer.render(this.camera, -1, () => {
      this.controls.update();
      this._stats.update();
      if (this.pathtracing) {
        var destCtx = this.canvas.getContext("2d");
        destCtx.drawImage(this.canvas_pt, 0, 0);
      }
    })
  }

  private resize() {
    console.log("resizing", window.innerWidth, window.innerHeight);
    let res = [window.innerWidth, window.innerHeight];
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas_pt.width = window.innerWidth;
    this.canvas_pt.height = window.innerHeight;
    this.canvas_three.width = window.innerWidth;
    this.canvas_three.height = window.innerHeight;

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.three_renderer.resize(window.innerWidth, window.innerHeight);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private loadScene(url) {
    const scenePromise = loader.loadScene(url, this.autoScaleScene);
    const iblPromise = loader.loadIBL(this.IBL);

    Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
      this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
      this.renderer.setIBL(ibl);
      this.renderer.setScene(gltf).then(() => {
        if (this.pathtracing)
          this.startPathtracing();
      });

      this.three_renderer.setScene(gltf.scene);
      this.three_renderer.setIBL(ibl);
      if (!this.pathtracing) {
        this.startRasterizer();
      }
    });
  }


  initUI() {
    if (this._gui)
      return;

    let _this = this;

    this._gui = new GUI();
    this._gui.domElement.classList.add("hidden");
    this._gui.width = 300;

    this._gui.add(this, 'pathtracing').name('Use Pathtracing').onChange((value) => {
      if (value == false) {
        _this.startRasterizer();
      } else {
        _this.startPathtracing();
      }
    });

    this._gui.add(this, "Scene", scene_index).onChange(function (value) {
      console.log(`Loading ${value}`);
      _this.loadScene(value);
    });
    this._gui.add(this, 'autoScaleScene').name('Autoscale Scene');

    this._gui.add(this, "IBL", ibl_index).onChange(function (value) {
      console.log(`Loading ${value}`);
      loader.loadIBL(_this.IBL).then((ibl) => {
        _this.renderer.setIBL(ibl);
        _this.three_renderer.setIBL(ibl);
      });
    });
    this._gui.add(_this.renderer, 'iblRotation').name('IBL Rotation').min(-180.0).max(180.0).step(0.1);
    // this._gui.add(_this.renderer, 'iblSampling').name('IBL Sampling');

    this._gui.add(_this.renderer, 'exposure').name('Display Exposure').min(0).max(3).step(0.01).onChange(function (value) {
      _this.three_renderer.exposure = value;
    });

    this._gui.add(this, 'autoRotate').name('Auto Rotate').onChange(function (value) {
      _this.controls.autoRotate = value;
      _this.renderer.resetAccumulation();
    });

    this._gui.add(_this.renderer, 'debugMode', this.renderer.debugModes).name('Debug Mode');
    this._gui.add(_this.renderer, 'tonemapping', this.renderer.tonemappingModes).name('Tonemapping');
    this._gui.add(_this.renderer, 'enableGamma').name('Gamma');

    this._gui.add(_this.renderer, 'renderScale').name('Render Res').min(0.1).max(1.0);
    this._gui.add(this, 'interactionScale').name('Interaction Res').min(0.1).max(1.0).step(0.1);

    this._gui.add(_this.renderer, 'useIBL').name('Use IBL').onChange((value) => {
      _this.three_renderer.useIBL(value);
    });
    this._gui.add(_this.renderer, 'showBackground').name('Show Background').onChange((value) => {
      _this.three_renderer.showBackground(value);
    });

    this._gui.add(_this.renderer, 'forceIBLEval').name('Force IBL Eval');
    this._gui.add(_this.renderer, 'maxBounces').name('Bounce Depth').min(0).max(32).step(1);
    this._gui.add(_this.renderer, 'sheenG', this.renderer.sheenGModes).name('Sheen G');

    let reload_obj = {
      reload: () => {
        console.log("Reload");
        this.loadScene(this.Scene);
      }
    };
    this._gui.add(reload_obj, 'reload').name('Reload');

    const center_obj = {
      centerView: () => {
        console.log("center view");
        if (this.controls) {
          let center = new THREE.Vector3();
          this.sceneBoundingBox.getCenter(center);
          this.controls.target = center;
          this.controls.update();
          this.renderer.resetAccumulation();
        }
      }
    };
    this._gui.add(center_obj, 'centerView').name('Center View');

    // const save_img = {
    //   save_img: () => {
    //     console.log("Reload");
    //     var dataURL = this.canvas.toDataURL('image/png');
    //   }
    // };
    // this._gui.add(save_img, 'save_img').name('Save PNG');
  }

  showSpinner() {
    this.spinner.style.display = '';
  }

  hideSpinner() {
    this.spinner.style.display = 'none';
  }
}

let app = new App();