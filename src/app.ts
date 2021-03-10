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

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'dat.GUI';
import { ThreeRenderer } from '../lib/three_renderer';
import { PathtracingRenderer } from '../lib/renderer';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as Assets from '../assets/asset_index';
import * as Loader from '../lib/scene_loader';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

class App {
  _gui: any;
  _stats: any | null;
  canvas: HTMLCanvasElement;
  canvas_three: HTMLCanvasElement;
  canvas_pt: HTMLCanvasElement;
  spinner: Element;
  container: HTMLElement | null;
  scene: string;
  ibl: string;
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
    this.scene = Assets.getScene(0).name;
    this.ibl = Assets.getIBL(0).name;

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
      this["pixelRatio"] = this.renderer.pixelRatio;
      this.renderer.pixelRatio = this.interactionScale;
    });

    this.controls.addEventListener('end', () => {
      this.renderer.pixelRatio = this["pixelRatio"];
    });

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    }

    this.renderer = new PathtracingRenderer({ canvas: this.canvas_pt});
    this.three_renderer = new ThreeRenderer({ canvas: this.canvas_three, powerPreference: "high-performance", alpha: true });

    this.renderer.pixelRatio = 0.5; 
    // this.renderer.iblRotation = 180.0;
    this.renderer.exposure = 1.5;
    this.renderer.maxBounces = 8;

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
        e.dataTransfer.files[0].name.match(/\.hdr$/)) {
        console.log("loading HDR...");
        // const url = URL.createObjectURL(e.dataTransfer.getData('text/html'));
        Loader.loadIBL(URL.createObjectURL(e.dataTransfer.items[0].getAsFile())).then((ibl) => {
          this.renderer.setIBL(ibl);
          this.three_renderer.setIBL(ibl);
          const iblNode = document.getElementById("ibl-info");
          iblNode.innerHTML = '';
        });
      } else {
        this.showSpinner();
        const scenePromise = Loader.loadSceneFromBlobs(e.dataTransfer.files, this.autoScaleScene);
        const iblPromise = Loader.loadIBL(Assets.getIBLByName(this.ibl).url);
        Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
          this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
          this.renderer.setIBL(ibl);
          this.renderer.setScene(gltf.scene, gltf).then(() => {
            this.startPathtracing();
            this.hideSpinner();
            document.getElementById("scene-info").innerHTML = '';
          });

          this.three_renderer.setScene(new THREE.Scene().add(gltf.scene));
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

  private loadScene(sceneUrl) {
    const scenePromise = Loader.loadScene(sceneUrl, this.autoScaleScene);
    const iblPromise = Loader.loadIBL(Assets.getIBLByName(this.ibl).url);

    Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
      this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
      this.renderer.setIBL(ibl);
      this.renderer.setScene(gltf.scene, gltf).then(() => {
        if (this.pathtracing)
          this.startPathtracing();
      });

      this.three_renderer.setScene(new THREE.Scene().add(gltf.scene));
      this.three_renderer.setIBL(ibl);
      if (!this.pathtracing) {
        this.startRasterizer();
      }
    });
  }

  initUI() {
    if (this._gui)
      return;

    this._gui = new GUI();
    this._gui.domElement.classList.add("hidden");
    this._gui.width = 300;

    this._gui.add(this, 'pathtracing').name('Use Pathtracing').onChange((value) => {
      if (value == false) {
        this.startRasterizer();
      } else {
        this.startPathtracing();
      }
    });
  
    this._gui.add(this, "scene", Assets.scene_names).name('Scene').onChange((value) => {
      const sceneInfo = Assets.getSceneByName(value);
      console.log(`Loading ${sceneInfo.name}`);
      this.loadScene(sceneInfo.url);
      this.setSceneInfo(sceneInfo);
    }).setValue(Assets.getScene(0).name);
    
    this._gui.add(this, 'autoScaleScene').name('Autoscale Scene');

    this._gui.add(this, "ibl", Assets.ibl_names).name('IBL').onChange((value) => {
      const iblInfo = Assets.getIBLByName(value);
      console.log(`Loading ${iblInfo.name}`);
      Loader.loadIBL(iblInfo.url).then((ibl) => {
        this.renderer.setIBL(ibl);
        this.three_renderer.setIBL(ibl);
        this.setIBLInfo(iblInfo);
      });
    }).setValue(Assets.getIBL(0).name);

    this._gui.add(this.renderer, 'iblRotation').name('IBL Rotation').min(-180.0).max(180.0).step(0.1);
    // this._gui.add(_this.renderer, 'iblSampling').name('IBL Sampling');

    this._gui.add(this.renderer, 'exposure').name('Display Exposure').min(0).max(3).step(0.01).onChange((value) => {
      this.three_renderer.exposure = value;
    });

    this._gui.add(this, 'autoRotate').name('Auto Rotate').onChange((value) => {
      this.controls.autoRotate = value;
      this.renderer.resetAccumulation();
    });

    this._gui.add(this.renderer, 'debugMode', this.renderer.debugModes).name('Debug Mode');
    this._gui.add(this.renderer, 'tonemapping', this.renderer.tonemappingModes).name('Tonemapping').onChange(val => {
        this.three_renderer.tonemapping = val;
    });
    this._gui.add(this.renderer, 'enableGamma').name('Gamma');
    
    this._gui.add(this.renderer, 'pixelRatio').name('Pixel Ratio').min(0.1).max(1.0);
    this._gui.add(this, 'interactionScale').name('Interaction Ratio').min(0.1).max(1.0).step(0.1);

    this._gui.add(this.renderer, 'useIBL').name('Use IBL').onChange((value) => {
      this.three_renderer.useIBL(value);
    });
    this._gui.add(this.renderer, 'showBackground').name('Show Background').onChange((value) => {
      this.three_renderer.showBackground = value;
    });

    this.backgroundColor = [0, 0, 0];
    this._gui.addColor(this, 'backgroundColor').name('Background Color').onChange((value) => {
      this.renderer.backgroundColor = [value[0]/255.0, value[1]/255.0, value[2]/255.0];
      this.three_renderer.backgroundColor = [value[0]/255.0, value[1]/255.0, value[2]/255.0];
    });

    this._gui.add(this.renderer, 'forceIBLEval').name('Force IBL Eval');
    this._gui.add(this.renderer, 'maxBounces').name('Bounce Depth').min(0).max(32).step(1);
    this._gui.add(this.renderer, 'sheenG', this.renderer.sheenGModes).name('Sheen G');

    let reload_obj = {
      reload: () => {
        console.log("Reload");
        this.loadScene(Assets.getSceneByName(this.scene).url);
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

    const save_img = {
      save_img: () => {
        console.log("Save Image");
        var dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement("a");
        link.download = 'capture.png';
        link.href = dataURL;
        link.click();
      }
    };
    this._gui.add(save_img, 'save_img').name('Save PNG');
  }

  showSpinner() {
    this.spinner.style.display = '';
  }

  hideSpinner() {
    this.spinner.style.display = 'none';
  }

  setIBLInfo(ibl: any) {
    const html = `
      IBL: ${ibl.name} by ${ibl.author} 
      from <a href="${ibl.source_url}"> ${ibl.source} </a>
      <a href="${ibl.license_url}">(${ibl.license})</a>
      `;
    document.getElementById("ibl-info").innerHTML = html;
  }

  setSceneInfo(scene: any) {
    const html = `
      Scene: ${scene.name} by ${scene.author} 
      from <a href="${scene.source_url}"> ${scene.source} </a>
      <a href="${scene.license_url}">(${scene.license})</a>
      `;
    document.getElementById("scene-info").innerHTML = html;
  }
}

let app = new App();