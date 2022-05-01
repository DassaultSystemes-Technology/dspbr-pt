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
import { GUI } from 'dat.gui';
import { SimpleDropzone } from 'simple-dropzone';
import { ThreeRenderer } from './three_renderer';
import { PathtracingRenderer, ThreeSceneTranslator } from 'dspbr-pt';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadSceneFromBlobs, loadSceneFromUrl, loadIBL } from './scene_loader';
import * as Assets from './asset_index';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

if (process.env['NODE_ENV'] == 'dev') {
  console.log("Local development: Replacing Asset URLs...");
  for (let [_, ibl] of Object.entries(Assets.ibls)) {
    if(ibl["url"]) {
      ibl["url"] = ibl["url"].replace("https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets", '');
    }
  }
}

class DemoViewer {
  _gui: any;
  _stats: any | null;
  canvas: HTMLCanvasElement;
  canvas_three: HTMLCanvasElement;
  canvas_pt: HTMLCanvasElement;
  spinner: Element;
  container: HTMLElement | null;
  startpage: HTMLElement | null;
  status: HTMLElement | null;
  loadscreen: HTMLElement | null;
  scene: string;
  current_ibl: string;
  current_scene: string;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;

  renderer: any;
  three_renderer: ThreeRenderer;

  useControls: true;
  pathtracing = true;
  autoScaleScene = false;
  autoRotate = false;
  interactionScale = 0.2;
  interactionTimeoutId: any;
  pathtracedInteraction = false;
  resumePathtracing = false;
  sceneBoundingBox: THREE.Box3;
  showGroundPlane = false;


  constructor() {
    this.current_ibl = "Artist Workshop";
    this.current_scene = "";

    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.startpage = document.getElementById("startpage");
    this.loadscreen = document.getElementById("loadscreen");
    this.status = document.getElementById("status");
    this.spinner = document.getElementsByClassName('spinner')[0];

    this.canvas_pt = document.createElement('canvas');
    this.canvas_three = document.createElement('canvas');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas_pt.width = window.innerWidth;
    this.canvas_pt.height = window.innerHeight;
    this.canvas_three.width = window.innerWidth;
    this.canvas_three.height = window.innerHeight;

    let aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.screenSpacePanning = true;
    this.controls.enableDamping = false;
    this.controls.rotateSpeed = 2.0;
    this.controls.panSpeed = 2.0;

    this.controls.addEventListener('change', () => {
      this.camera.updateMatrixWorld();
      this.renderer.resetAccumulation();
    });

    this.controls.addEventListener('start', () => {
      if (this.pathtracing) {
        if (this.pathtracedInteraction) {
          this.renderer.stopRendering();
          clearTimeout(this.interactionTimeoutId);
          this.renderer.setLowResRenderMode(true);
          this.startPathtracing();
        } else {
          this.startRasterizer();
          clearTimeout(this.interactionTimeoutId);
          this.resumePathtracing = true;
        }
      }
    });

    this.controls.addEventListener('end', () => {
      if (this.pathtracedInteraction) {
        this.interactionTimeoutId = setTimeout(() => {
          this.renderer.setLowResRenderMode(false);
        }, 100);
      } else {
        if (this.resumePathtracing) {
          this.interactionTimeoutId = setTimeout(() => {
            this.startPathtracing();
            this.stopRasterizer();
          }, 100);
        }
      }
    });

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.DOLLY
    }

    this.renderer = new PathtracingRenderer({ canvas: this.canvas_pt });
    this.three_renderer = new ThreeRenderer({ canvas: this.canvas_three, powerPreference: "high-performance", alpha: true });

    this.renderer.pixelRatio = 1.0;
    this.renderer.maxBounces = 5;
    this.renderer.pixelRatioLowRes = 0.15;
    this.renderer.iblRotation = 180.0;

    window.addEventListener('resize', () => {
      this.resize();
    }, false);

    const input = document.createElement('input');
    const dropCtrlOverlay = new SimpleDropzone(this.startpage, input);
    dropCtrlOverlay.on('dropstart', () => {
      this.hideStartpage();
    });
    dropCtrlOverlay.on('drop', async ({ files }) => { await this.loadSceneFromDrop(files) });


    const dropCtrlCanvas = new SimpleDropzone(this.canvas, input);
    dropCtrlCanvas.on('drop', async ({ files }) => {
      await this.loadSceneFromDrop(files);
    });
    // dropCtrl.on('droperror', () => this.hideSpinner());
    this.container.addEventListener('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.initUI();
    this.initStats();

    if (window.location.hash) {
      const uris = window.location.hash.split("#");

      let ibl = this.current_ibl;
      for (const u of uris) {
        if (u == "ground") {
          this.showGroundPlane = true;
        }
        if (u.includes("ibl")) {
          ibl = u.replace("ibl:", "");
        }
      }

      this.loadSceneFromUri(uris[1], ibl);
      this.hideStartpage();
    }
  }

  private currentIblUrl() {
    return Assets.ibls[this.current_ibl].url;
  }

  private addGroundPlane(scene) {
    const floorPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(),
      new THREE.MeshStandardMaterial({
        transparent: false,
        color: 0x080808,
        roughness: 0.0,
        metalness: 0.0
      })
    );
    floorPlane.scale.setScalar((this.sceneBoundingBox.max.x - this.sceneBoundingBox.min.x) * 5.0);
    floorPlane.rotation.x = - Math.PI / 2;
    floorPlane.position.y = this.sceneBoundingBox.min.y - 0.01;
    scene.add(floorPlane);
  }

  private async loadSceneFromDrop(fileMap) {
    let ibl = null;
    let gltf = null;
    for (const [key, value] of fileMap) {
      if (key.match(/\.hdr$/)) {
        this.showStatusScreen("Loading HDR...");
        ibl = await loadIBL(URL.createObjectURL(value));
      }
      if (key.match(/\.glb$/) || key.match(/\.gltf$/)) {
        this.showStatusScreen("Loading Scene...");
        const files: [string, File][] = Array.from(fileMap);
        gltf = await loadSceneFromBlobs(files, this.autoScaleScene);

        if (!ibl)
          ibl = await loadIBL(this.currentIblUrl());
      }
    }

    await this.loadScenario(gltf, ibl);
  }

  private async loadSceneFromUri(sceneUrl, iblUrl) {
    this.showStatusScreen("Loading Scene...");
    const sceneKey = sceneUrl.replaceAll('%20', ' ');
    if (sceneKey in Assets.scenes) {
      const scene = Assets.scenes[sceneKey];
      this.setSceneInfo(sceneKey, scene.credit);
      sceneUrl = scene.url;
    } else {
      this.setSceneInfo(sceneUrl);
    }
    const iblKey = iblUrl.replaceAll('%20', ' ');
    if (iblKey in Assets.ibls) {
      const ibl = Assets.ibls[iblKey];
      this.setIBLInfo(iblKey, ibl.credit);
      iblUrl = ibl.url;
    } else {
      this.setIBLInfo(iblUrl);
    }

    const gltf = await loadSceneFromUrl(sceneUrl, this.autoScaleScene) as GLTF;
    const ibl = await loadIBL(iblUrl);

    await this.loadScenario(gltf, ibl)
  }

  private async loadScenario(gltf?: GLTF, ibl?: any) {
    if (this.pathtracing)
      this.stopPathtracing();

    if(ibl) {
      this.renderer.setIBL(ibl);
      this.three_renderer.setIBL(ibl);
    }

    if(gltf) {
      this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
      this.updateCameraFromBoundingBox();
      this.centerView();

      // const floorTex = this.generateRadialFloorTexture(2048);
      if (this.showGroundPlane) {
        this.addGroundPlane(gltf.scene);
        this.sceneBoundingBox = new THREE.Box3().setFromObject(gltf.scene);
      }


      const pathtracingSceneData = await ThreeSceneTranslator.translateThreeScene(gltf.scene, gltf);
      await this.renderer.setScene(pathtracingSceneData);
      if (this.pathtracing)
        this.startPathtracing();

      this.three_renderer.setScene(new THREE.Scene().add(gltf.scene));
      if (!this.pathtracing) {
        this.startRasterizer();
      }
    }

    this.hideLoadscreen();
  }


  private initStats() {
    this._stats = new (Stats as any)();
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.top = '0px';
    this._stats.domElement.style.cursor = "default";
    this._stats.domElement.style.webkitUserSelect = "none";
    this._stats.domElement.style.MozUserSelect = "none";
    this._stats.domElement.style.zIndex = 1;
    this.container.appendChild(this._stats.domElement);
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

  private updateCameraFromBoundingBox() {
    this.controls.reset();
    let diag = this.sceneBoundingBox.max.distanceTo(this.sceneBoundingBox.min);
    let dist = diag * 2 / Math.tan(45.0 * Math.PI / 180.0);

    let center = new THREE.Vector3();
    this.sceneBoundingBox.getCenter(center);

    let pos = center.clone();
    pos.add(new THREE.Vector3(0, 0, dist));
    pos.add(new THREE.Vector3(0, diag, 0));

    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(center);
    this.camera.updateMatrixWorld();
    this.controls.update();
  }

  private centerView() {
    if (this.controls) {
      let center = new THREE.Vector3();
      this.sceneBoundingBox.getCenter(center);
      this.controls.target = center;
      this.controls.update();
      this.renderer.resetAccumulation();
    }
  }

  initUI() {
    if (this._gui)
      return;

    this._gui = new GUI();
    // GUI.toggleHide();
    this._gui.domElement.classList.add("hidden");
    this._gui.width = 300;

    // let reload_obj = {
    //   reload: () => {
    //     console.log("Reload");
    //     this.loadScenario(this.scene, this.ibl);
    //   }
    // };
    // this._gui.add(reload_obj, 'reload').name('Reload');

    const center_obj = {
      centerView: this.centerView.bind(this)
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

    const scene_names = Object.keys(Assets.scenes);
    let scene = this._gui.addFolder('Scene');
    scene.add(this, "current_scene", scene_names).name('Scene').onChange((value) => {
      const sceneInfo = Assets.scenes[value];
      this.loadSceneFromUri(sceneInfo.url, this.current_ibl);
      this.setSceneInfo(value, sceneInfo.credit);
      this.hideStartpage();
    });

    // this._gui.add(this, 'autoScaleScene').name('Autoscale Scene');

    scene.add(this, 'autoRotate').name('Auto Rotate').onChange((value) => {
      this.controls.autoRotate = value;
      this.renderer.resetAccumulation();
    });
    scene.open();

    const ibl_names = Object.keys(Assets.ibls);
    let lighting = this._gui.addFolder('Lighting');
    lighting.add(this, "current_ibl", ibl_names).name('IBL').onChange((value) => {
      const iblInfo = Assets.ibls[value];
      console.log(`Loading ${value}`);
      this.setIBLInfo(value, iblInfo.credit);
      if (value == "None") {
        this.renderer.useIBL = false;
        this.three_renderer.showBackground = false;
        this.renderer.showBackground = false;
      } else {
        loadIBL(iblInfo.url).then((ibl) => {
          this.renderer.setIBL(ibl);
          this.renderer.exposure = iblInfo.intensity ?? 1.0;
          this.renderer.iblRotation = iblInfo.rotation ?? 180.0;
          this.three_renderer.setIBL(ibl);
          this.renderer.useIBL = true;
          this.three_renderer.showBackground = true;
          this.renderer.showBackground = true;
        });
      }
    });

    lighting.add(this.renderer, 'iblRotation').name('IBL Rotation').min(-180.0).max(180.0).step(0.1).listen();
    lighting.add(this.renderer, 'iblImportanceSampling').name('Importance Sampling');
    lighting.open();

    let interator = this._gui.addFolder('Integrator');
    interator.add(this, 'pathtracing').name('Use Pathtracing').onChange((value) => {
      if (value == false) {
        this.startRasterizer();
      } else {
        this.startPathtracing();
      }
    });

    interator.add(this.renderer, 'debugMode', this.renderer.debugModes).name('Debug Mode');
    // interator.add(this.renderer, 'renderMode', this.renderer.renderModes).name('Integrator');
    interator.add(this.renderer, 'maxBounces').name('Bounce Depth').min(0).max(32).step(1);
    interator.add(this.renderer, 'rayEps').name('Ray Offset');
    interator.open();

    let display = this._gui.addFolder('Display');
    display.add(this.renderer, 'exposure').name('Display Exposure').min(0).max(10).step(0.01).onChange((value) => {
      this.three_renderer.exposure = value;
    }).listen();

    display.add(this.renderer, 'tonemapping', this.renderer.tonemappingModes).name('Tonemapping').onChange(val => {
      this.three_renderer.tonemapping = val;
    });
    display.add(this.renderer, 'enableGamma').name('Gamma');

    display.add(this.renderer, 'pixelRatio').name('Pixel Ratio').min(0.1).max(1.0);
    display.add(this, 'pathtracedInteraction').name('Pathtraced Navigation');
    display.add(this.renderer, 'pixelRatioLowRes').name('Interaction Ratio').min(0.1).max(1.0).step(0.1);
    display.open();

    let background = this._gui.addFolder('Background');
    background.add(this.renderer, 'showBackground').name('Background from IBL').onChange((value) => {
      this.three_renderer.showBackground = value;
    });

    background.color = [0, 0, 0];
    background.addColor(background, 'color').name('Background Color').onChange((value) => {
      this.renderer.backgroundColor = [value[0] / 255.0, value[1] / 255.0, value[2] / 255.0, 1.0];
      this.three_renderer.backgroundColor = [value[0] / 255.0, value[1] / 255.0, value[2] / 255.0];
    });
  }

  showStartpage() {
    this.startpage.style.visibility = "visible";
  }

  hideStartpage() {
    this.startpage.style.visibility = "hidden";
    // GUI.toggleHide();
  }

  showStatusScreen(msg: string) {
    this.status.innerText = msg;
    this.loadscreen.style.visibility = "visible";
    this.spinner.style.visibility = "visible";
  }

  hideLoadscreen() {
    this.loadscreen.style.visibility = "hidden";
    this.spinner.style.visibility = "hidden";
  }

  setIBLInfo(name: string, credit?: any) {
    document.getElementById("ibl-info").innerHTML = `IBL: ${name}`;
    if (credit) document.getElementById("ibl-info").innerHTML += ` - ${credit}`;
  }

  setSceneInfo(name: string, credit?: any) {
    document.getElementById("scene-info").innerHTML = `Scene: ${name}`;
    if (credit) document.getElementById("scene-info").innerHTML += ` - ${credit}`;
  }
}

let app = new DemoViewer();