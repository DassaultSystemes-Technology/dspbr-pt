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

import { Pane } from 'tweakpane';
import { SimpleDropzone } from 'simple-dropzone';
import { ThreeRenderer } from './three_renderer';
import { PathtracingRenderer, ThreeSceneAdapter } from 'dspbr-pt';


import { PerspectiveCamera, Box3, Vector3, Scene, Mesh, FloatType, MOUSE, MeshStandardMaterial, PlaneBufferGeometry } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadSceneFromBlobs, loadSceneFromUrl } from './scene_loader';
import * as Assets from './asset_index';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

if (process.env['NODE_ENV'] == 'dev') {
  console.log("Local development: Replacing Asset URLs...");
  for (let [_, ibl] of Object.entries(Assets.ibls)) {
    if (ibl["url"]) {
      ibl["url"] = ibl["url"].replace("https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets", '');
    }
  }
}

class DemoViewer {
  _gui: any;
  canvas: HTMLCanvasElement;
  canvas_three: HTMLCanvasElement;
  canvas_pt: HTMLCanvasElement;
  spinner: HTMLElement;
  container: HTMLElement | null;
  startpage: HTMLElement | null;
  status: HTMLElement | null;
  loadscreen: HTMLElement | null;
  scene: string;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  sceneBoundingBox: Box3;
  sceneAdapter: ThreeSceneAdapter;

  renderer: any;
  three_renderer: ThreeRenderer;

  default_ibl_name = "Artist Workshop";
  current_ibl = this.default_ibl_name;
  current_scene = "";
  useControls = true;
  pathtracing = true;
  autoScaleScene = false;
  autoRotate = false;
  pathtracedInteraction = true;
  resumePathtracing = false;
  showGroundPlane = false;
  interactionTimeoutId = null;
  interactionPixelRatio = 0.1;
  pixelRatio = 1.0;
  tileRes = 4;
  fps = 0.0;

  constructor() {
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
    this.camera = new PerspectiveCamera(45, aspect, 0.01, 1000);

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
          this.toggleInteractionMode(true);
        } else {
          this.startRasterizer();
        }
      }
    });

    this.controls.addEventListener('end', () => {
      if (this.pathtracedInteraction) {
        this.toggleInteractionMode(false);
      } else {
        this.startPathtracing();
        this.stopRasterizer();
      }
    });

    this.controls.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.PAN,
      RIGHT: MOUSE.DOLLY
    }

    this.renderer = new PathtracingRenderer({ canvas: this.canvas_pt });
    this.three_renderer = new ThreeRenderer({ canvas: this.canvas_three, powerPreference: "high-performance", alpha: true });

    this.renderer.pixelRatio = 1.0;
    this.renderer.maxBounces = 5;
    // this.renderer.iblImportanceSampling = false;

    window.addEventListener('resize', () => {
      this.resize();
    }, false);

    const input = document.createElement('input');
    const dropCtrlOverlay = new SimpleDropzone(this.startpage, input);
    dropCtrlOverlay.on('dropstart', () => {
      this.hideStartpage();
    });
    dropCtrlOverlay.on('drop', async ({ files }) => { await this.loadDropFiles(files) });

    const dropCtrlCanvas = new SimpleDropzone(this.canvas, input);
    dropCtrlCanvas.on('drop', async ({ files }) => {
      await this.loadDropFiles(files);
    });
    // dropCtrl.on('droperror', () => this.hideSpinner());
    this.container.addEventListener('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.initUI();
    this.loadIbl(this.default_ibl_name);

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

      if (ibl) this.loadIbl(ibl);
      this.loadSceneFromUrl(uris[1]);

      this.hideStartpage();
    }
  }

  private toggleInteractionMode(flag: boolean, timeout?: number) {
    if (flag) {
      this.renderer.pixelRatio = this.interactionPixelRatio;
      this.renderer.tileRes = 1;
      if (timeout && !this.interactionTimeoutId) {
        setTimeout(() => {
          this.toggleInteractionMode(false);
        }, timeout);
      }
    } else {
      this.renderer.pixelRatio = this.pixelRatio;
      this.renderer.tileRes = this.tileRes;
    }
  }

  private async loadDropFiles(fileMap) {
    for (const [key, value] of fileMap) {
      if (key.match(/\.hdr$/)) {
        this.showStatusScreen("Loading HDR...");
        await this.loadIbl(URL.createObjectURL(value));
        this.hideLoadscreen();
      }
      if (key.match(/\.glb$/) || key.match(/\.gltf$/)) {
        this.showStatusScreen("Loading Scene...");
        const files: [string, File][] = Array.from(fileMap);
        const gltf = await loadSceneFromBlobs(files, this.autoScaleScene) as GLTF;
        await this.loadScene(gltf);
      }
    }
  }

  private async loadSceneFromUrl(sceneUrl) {
    this.showStatusScreen("Loading Scene...");
    const sceneKey = sceneUrl.replaceAll('%20', ' ');
    if (sceneKey in Assets.scenes) {
      const scene = Assets.scenes[sceneKey];
      this.setSceneInfo(sceneKey, scene.credit);
      sceneUrl = scene.url;
    } else {
      this.setSceneInfo(sceneUrl);
    }

    const gltf = await loadSceneFromUrl(sceneUrl, this.autoScaleScene) as GLTF;
    await this.loadScene(gltf);
  }

  private async loadScene(gltf: GLTF) {
    this.sceneBoundingBox = new Box3().setFromObject(gltf.scene);
    this.updateCameraFromBoundingBox();
    this.centerView();

    if (this.showGroundPlane) {
      this.addGroundPlane(gltf.scene);
      this.sceneBoundingBox = new Box3().setFromObject(gltf.scene);
    }

    this.sceneAdapter = new ThreeSceneAdapter(gltf.scene, gltf);
    await this.sceneAdapter.init();

    await this.renderer.setScene(this.sceneAdapter.scene);
    if (this.pathtracing)
      this.startPathtracing();

    this.three_renderer.setScene(new Scene().add(gltf.scene));
    if (!this.pathtracing) {
      this.startRasterizer();
    }

    this.initMaterialSelector();
    this.hideLoadscreen();
  }

  private async loadIbl(url: string) {
    const setIbl = (ibl: any) => {
      this.renderer.setIBL(ibl);
      this.three_renderer.setIBL(ibl);
      this.current_ibl = ibl;
      this.renderer.useIBL = true;
      this.three_renderer.useIBL(true);
      this.three_renderer.showBackground = true;
      this.renderer.showBackground = true;
    };

    if (url == "None") {
      this.renderer.useIBL = false;
      this.three_renderer.showBackground = false;
      this.renderer.showBackground = false;
      return;
    }

    url = url.replaceAll('%20', ' ');
    console.log(`Loading ${url}`);
    if (url in Assets.ibls) {
      const iblInfo = Assets.ibls[url];
      new RGBELoader()
        .setDataType(FloatType)
        .loadAsync(iblInfo.url).then((ibl) => {
          setIbl(ibl);
          this.renderer.exposure = iblInfo.intensity ?? 1.0;
          this.renderer.iblRotation = iblInfo.rotation ?? 180.0;
        });
    } else {
      new RGBELoader()
        .setDataType(FloatType)
        .loadAsync(url).then((ibl) => {
          setIbl(ibl);
        });
    }
  }

  private addGroundPlane(scene) {
    const floorPlane = new Mesh(
      new PlaneBufferGeometry(),
      new MeshStandardMaterial({
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

  private lastTimeStamp = 0.0;
  private startPathtracing() {
    this.stopRasterizer();

    this.renderer.render(this.camera, -1,
      () => { // on tile finished
        this.controls.update();
        if (this.pathtracing) {
          var destCtx = this.canvas.getContext("2d");
          destCtx.drawImage(this.canvas_pt, 0, 0);
        }
      },
      () => { // on frame finished
        const now = performance.now();
        this.fps = 1000.0 / (now - this.lastTimeStamp);
        this.lastTimeStamp = now;
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

    let center = new Vector3();
    this.sceneBoundingBox.getCenter(center);

    let pos = center.clone();
    pos.add(new Vector3(0, 0, dist));
    pos.add(new Vector3(0, diag, 0));

    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(center);
    this.camera.updateMatrixWorld();
    this.controls.update();
  }

  private centerView() {
    if (this.controls) {
      let center = new Vector3();
      this.sceneBoundingBox.getCenter(center);
      this.controls.target = center;
      this.controls.update();
      this.renderer.resetAccumulation();
    }
  }

  private pane?: Pane;
  private paneTab?: any;
  private paneMatFolders = [];

  private initMaterialParamUI(matIdx: number) {
    const matTab = this.paneTab.pages[1];
    const mat = this.sceneAdapter.scene.materials[matIdx];

    this.paneMatFolders.forEach(p => {
      p.dispose();
    });
    this.paneMatFolders = [];

    const colors = {
      albedo: { r: mat.albedo[0] * 255, g: mat.albedo[1] * 255, b: mat.albedo[2] * 255 },
      specularTint: { r: mat.specularTint[0] * 255, g: mat.specularTint[1] * 255, b: mat.specularTint[2] * 255 },
      translucencyColor: {
        r: mat.translucencyColor[0] * 255,
        g: mat.translucencyColor[1] * 255, b: mat.translucencyColor[2] * 255
      },
      sheenColor: { r: mat.sheenColor[0] * 255, g: mat.sheenColor[1] * 255, b: mat.sheenColor[2] * 255 },
      attenuationColor: { r: mat.attenuationColor[0] * 255, g: mat.attenuationColor[1] * 255, b: mat.attenuationColor[2] * 255 }
    };
    const vectors = {
      emission: { x: mat.emission[0], y: mat.emission[1], z: mat.emission[2] }
    };

    const basicFloatParamSettings = {
      step: 0.01,
      min: 0.0,
      max: 1.0
    };

    const base = matTab.addFolder({
      title: 'Base',
    }); this.paneMatFolders.push(base);

    base.addInput(colors, "albedo").on('change', ev => {
      mat.albedo = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.b / 255.0];
    });

    base.addInput(mat, 'roughness', basicFloatParamSettings);
    base.addInput(mat, 'metallic', basicFloatParamSettings);
    base.addInput(mat, 'specular', basicFloatParamSettings);
    base.addInput(vectors, "emission", {
      x: { min: 0, max: 10e6, step: 0.1 },
      y: { min: 0, max: 10e6, step: 0.1 },
      z: { min: 0, max: 10e6, step: 0.1 }
    }).on('change', ev => {
      mat.emission = [ev.value.x, ev.value.y, ev.value.z];
    });

    const anisotropy = matTab.addFolder({
      title: 'Anisotropy',
    }); this.paneMatFolders.push(anisotropy);
    anisotropy.addInput(mat, 'anisotropy', {
      step: 0.01,
      min: -1.0,
      max: 1.0
    });
    anisotropy.direction = { x: mat.anisotropyDirection[0], y: mat.anisotropyDirection[1] };
    anisotropy.addInput(anisotropy, "direction", {
      picker: 'inline',
      expanded: true,
      x: { min: -1, max: 1, step: 0.01 },
      y: { min: -1, max: 1, step: 0.01 }
    }).on('change', ev => {
      mat.anisotropyDirection = [ev.value.x, ev.value.y];
    });

    const transmission = matTab.addFolder({
      title: 'Transmission',
    }); this.paneMatFolders.push(transmission);
    transmission.addInput(mat, 'transparency', basicFloatParamSettings);
    transmission.addInput(mat, 'cutoutOpacity', basicFloatParamSettings);
    transmission.addInput(mat, 'translucency', { ...basicFloatParamSettings, ...{ label: 'diffuse transmission' } });
    transmission.addInput(colors, "translucencyColor", {
      ...basicFloatParamSettings,
      ...{ label: 'diffuse transmission color' }
    }).on('change', ev => {
      mat.translucencyColor = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.b / 255.0];
    });

    const sheen = matTab.addFolder({
      title: 'Sheen',
    }); this.paneMatFolders.push(sheen);
    sheen.addInput(mat, 'sheenRoughness', basicFloatParamSettings);
    sheen.addInput(colors, "sheenColor").on('change', ev => {
      mat.sheenColor = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.b / 255.0];
    });

    const clearcoat = matTab.addFolder({
      title: 'Clearcoat',
    }); this.paneMatFolders.push(clearcoat);
    clearcoat.addInput(mat, 'clearcoat', basicFloatParamSettings);
    clearcoat.addInput(mat, 'clearcoatRoughness', basicFloatParamSettings);

    const volume = matTab.addFolder({
      title: 'Volume',
    }); this.paneMatFolders.push(volume);
    volume.thinWalled = mat.thinWalled > 0 ? true : false;
    volume.addInput(volume, 'thinWalled').on('change', ev => {
      mat.thinWalled = ev.value ? 1 : 0;
    });
    volume.addInput(mat, 'ior', {
      min: 0,
      max: 3,
      step: 0.01
    });
    volume.addInput(mat, 'attenuationDistance', {
      step: 0.00001,
      min: 0.0,
      max: 10e5
    });
    volume.addInput(colors, "attenuationColor").on('change', ev => {
      mat.attenuationColor = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.b / 255.0];
    });

    const iridescence = matTab.addFolder({
      title: 'Iridescence',
    }); this.paneMatFolders.push(iridescence);
    iridescence.addInput(mat, 'iridescence', basicFloatParamSettings);
    iridescence.addInput(mat, 'iridescenceIOR', {
      min: 0,
      max: 3,
      step: 0.01
    });
    iridescence.addInput(mat, 'iridescenceThicknessMinimum', {
      min: 10,
      max: 1200,
      step: 1
    });
    iridescence.addInput(mat, 'iridescenceThicknessMaximum', {
      min: 10,
      max: 1200,
      step: 1
    });
  }

  private initMaterialSelector() {
    const matTab = this.paneTab.pages[1];

    const materials = this.sceneAdapter.scene.materials;

    const matNameMap = {};
    for (let i = 0; i < materials.length; i++) {
      matNameMap[materials[i].name] = i;
    }
    const opt = {
      name: materials[0].name
    }

    matTab.addInput(opt, "name", {
      options: matNameMap
    }).on('change', (ev) => {
      this.initMaterialParamUI(ev.value);
    })

    if(materials.length > 0)
      this.initMaterialParamUI(matNameMap[materials[0].name]);

  }


  private initUI() {
    if (this.pane)
      return;

    const pane = new Pane({
      title: "dspbr-pt"
    });
    pane.element.style.width = '350px';
    pane.element.style.top = '5px';
    pane.element.style.right = '5px';
    pane.element.style.position = 'absolute';
    pane.element.style.zIndex = "2";

    // this.pane = pane;
    this.paneTab = pane.addTab({
      pages: [
        { title: 'Parameters' },
        { title: 'Materials' },
      ],
    });
    const params = this.paneTab.pages[0];

    params.addButton({
      title: 'Center View'
    }).on('click', () => {
      this.centerView();
    })

    params.addButton({
      title: 'Save Image'
    }).on('click', () => {
      console.log("Save Image");
      var dataURL = this.canvas.toDataURL('image/png');
      const link = document.createElement("a");
      link.download = 'capture.png';
      link.href = dataURL;
      link.click();
    });

    const scene = params.addFolder({
      title: 'Scene',
    });

    const optionsFromList = (l) => {
      const obj = {
        "": ""
      };
      for (let e in l) {
        obj[l[e]] = l[e];
      }
      return obj;
    };

    scene.addInput(this, 'current_scene', {
      label: "Scene",
      options: optionsFromList(Object.keys(Assets.scenes)),
    }).on('change', (ev) => {
      if(ev.value != "") {
        this.loadSceneFromUrl(ev.value);
        this.hideStartpage();
      }
    });

    scene.addInput(this, 'autoRotate', {
      label: "Auto Rotate"
    }).on('change', (ev) => {
      this.controls.autoRotate = ev.value;
      this.toggleInteractionMode(ev.value);
    });

    const lighting = params.addFolder({
      title: 'Lighting',
    });

    lighting.addInput(this, 'current_ibl', {
      label: "IBL",
      options: optionsFromList(Object.keys(Assets.ibls)),
    }).on('change', (ev) => {
      this.loadIbl(ev.value);
    });

    lighting.addInput(this.renderer, 'iblRotation', {
      label: 'IBL Rotation',
      step: 0.1,
      min: -180,
      max: 180
    }).on('change', () => {
      this.toggleInteractionMode(true, 10.0);
    });

    lighting.addInput(this.renderer, 'iblImportanceSampling', {
      label: 'Importance Sampling'
    })

    const interator = params.addFolder({
      title: 'Integrator',
    });

    interator.addInput(this, 'pathtracing', {
      label: 'Pathtracing'
    }).on('change', (ev) => {
      if (ev.value == false) {
        this.startRasterizer();
      } else {
        this.startPathtracing();
      }
    });

    interator.addInput(this.renderer, 'debugMode', {
      label: 'Debug Mode',
      options: optionsFromList(this.renderer.debugModes)
    });
    interator.addInput(this.renderer, 'maxBounces', {
      label: 'Max Bounces',
      step: 1,
      min: 0,
      max: 32
    });
    interator.addInput(this.renderer, 'rayEps', {
      label: 'Ray Offset',
      step: 0.00001,
      min: 0,
      max: 10.0
    });
    interator.addInput(this, 'tileRes', {
      label: 'Tile Res',
      step: 1,
      min: 1,
      max: 8
    }).on('change', (ev) => {
      this.renderer.tileRes = ev.value;
    });
    interator.addInput(this.renderer, 'clampThreshold', {
      label: 'Clamp Threshold',
      step: 0.1,
      min: 0,
      max: 100
    });

    const display = params.addFolder({
      title: 'Display',
    });
    display.addInput(this.renderer, 'exposure', {
      label: 'Display Exposure',
      step: 0.01,
      min: 0,
      max: 10
    });
    display.addInput(this.renderer, 'tonemapping', {
      label: 'Tonemapping',
      options: optionsFromList(this.renderer.tonemappingModes)
    }).on('change', (ev) => {
      this.three_renderer.tonemapping = ev.val;
    });
    display.addInput(this.renderer, 'enableGamma', {
      label: 'Gamma'
    });
    display.addInput(this.renderer, 'exposure', {
      label: 'Display Exposure',
      step: 0.1,
      min: 0.1,
      max: 10
    });
    display.addInput(this, 'pathtracedInteraction', {
      label: 'Pathtraced Navigation'
    });
    display.addInput(this, 'interactionPixelRatio', {
      label: 'Interaction Ratio',
      step: 0.1,
      min: 0.1,
      max: 1
    });
    display.addInput(this.renderer, 'enableFxaa', {
      label: 'Fxaa'
    });

    const background = params.addFolder({
      title: 'Background',
    });
    display.addInput(this.renderer, 'showBackground', {
      label: 'Background from IBL'
    }).on('change', (ev) => {
      this.three_renderer.showBackground = ev.val;
    });

    background.color = { r: 0, g: 0, b: 0 };
    background.addInput(background, 'color', {
      label: 'Background Color',
      picker: 'inline',
      expanded: true,
    }).on('change', (ev) => {
      console.log(ev.value);
      this.renderer.backgroundColor = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.g / 255.0, 1.0];
    });

    params.addMonitor(this, 'fps', {
      label: 'Fps',
      view: 'graph',
      step: 0.1,
      min: 0,
      max: 10
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