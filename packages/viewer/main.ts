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

import { EventEmitter } from 'events'

import { SimpleDropzone } from 'simple-dropzone';
import { ThreeRenderer } from './three_renderer';
import { PathtracingRenderer, ThreeSceneAdapter } from 'dspbr-pt';

import { PerspectiveCamera, Box3, Vector3, Scene, Mesh, FloatType, MOUSE, MeshStandardMaterial, PlaneBufferGeometry } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadSceneFromBlobs, loadSceneFromUrl } from './scene_loader';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

export class DemoViewer extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private canvas_three: HTMLCanvasElement;
  private canvas_pt: HTMLCanvasElement;
  private spinner: HTMLElement;
  private container?: HTMLElement;
  private startpage?: HTMLElement;
  private status?: HTMLElement;
  private loadscreen?: HTMLElement;
  // private scene: string;
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private sceneBoundingBox?: Box3;
  private sceneAdapter?: ThreeSceneAdapter;

  private autoScaleScene = false;
  private showGroundPlane = false;
  private interactionTimeoutId = null;
  private tileRes = 4;

  private three_renderer: ThreeRenderer;

  private _renderer: PathtracingRenderer;
  public get renderer() {
    return this._renderer;
  }

  private _fps = 0.0;
  public get fps() {
    return this._fps;
  }

  public get autoRotate() {
    return this.controls.autoRotate;
  }
  public set autoRotate(flag: boolean) {
    this.toggleInteractionMode(flag);
    this.controls.autoRotate = flag;
  }

  private _pathtracing = true;
  public get togglePathtracing() {
    return this._pathtracing;
  }
  public set togglePathtracing(flag: boolean) {
    if (flag) {
      this.startPathtracing();
    } else {
      this.startRasterizer();
    }
    this._pathtracing = flag;
  }

  private _pixelRatio = 1.0;
  public get pixelRatio() {
    return this._pixelRatio;
  }
  public set pixelRatio(val: number) {
    this._pixelRatio = val;
    this._renderer.pixelRatio = val;
  }

  private _pathtracedInteraction = true;
  public get pathtracedInteraction() {
    return this._pathtracedInteraction;
  }
  public set pathtracedInteraction(flag: boolean) {
    this._pathtracedInteraction = flag;
  }

  private _interactionPixelRatio = 0.1;
  public set interactionPixelRatio(val: number) {
    this._interactionPixelRatio = val;
  }
  public get interactionPixelRatio() {
    return this._interactionPixelRatio;
  }

  constructor(params: { container: HTMLElement }) {
    super(); // EventEmitter
    this.container = params.container;
    document.body.appendChild(this.container);
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    this.startpage = document.getElementById("startpage")!;
    this.loadscreen = document.getElementById("loadscreen")!;
    this.status = document.getElementById("status")!;
    this.spinner = document.getElementsByClassName('spinner')[0] as HTMLElement;

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
      this._renderer.resetAccumulation();
    });

    this.controls.addEventListener('start', () => {
      if (this._pathtracing) {
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

    this._renderer = new PathtracingRenderer({ canvas: this.canvas_pt });
    this.three_renderer = new ThreeRenderer({ canvas: this.canvas_three, powerPreference: "high-performance", alpha: true });
    this._renderer.pixelRatio = 1.0;
    this._renderer.maxBounces = 5;

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
      if (e.dataTransfer)
        e.dataTransfer.dropEffect = 'copy';
    });
  }

  public toggleInteractionMode(flag: boolean, timeout?: number) {
    if (flag) {
      this._renderer.pixelRatio = this.interactionPixelRatio;
      this._renderer.tileRes = 1;
      if (timeout && !this.interactionTimeoutId) {
        setTimeout(() => {
          this.toggleInteractionMode(false);
        }, timeout);
      }
    } else {
      this._renderer.pixelRatio = this.pixelRatio;
      this._renderer.tileRes = this.tileRes;
    }
  }

  private async loadDropFiles(fileMap: any) {
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

  public async loadSceneFromUrl(sceneUrl: string) {
    this.showStatusScreen("Loading Scene...");
    const gltf = await loadSceneFromUrl(sceneUrl, this.autoScaleScene) as GLTF;
    await this.loadScene(gltf);
    this.hideStartpage();
  }

  private async loadScene(gltf: GLTF) {
    this.sceneBoundingBox = new Box3().setFromObject(gltf.scene);
    this.updateCameraFromBoundingBox();
    this.centerView();

    if (this.showGroundPlane) {
      this.addGroundPlane(gltf.scene);
      this.sceneBoundingBox = new Box3().setFromObject(gltf.scene);
    }

    this.sceneAdapter = new ThreeSceneAdapter(gltf.scene, gltf)!;
    await this.sceneAdapter.init();

    await this._renderer.setScene(this.sceneAdapter.scene);
    if (this._pathtracing)
      this.startPathtracing();

    this.three_renderer.setScene(new Scene().add(gltf.scene));
    if (!this._pathtracing) {
      this.startRasterizer();
    }

    this.hideLoadscreen();
    this.emit('sceneLoaded', { scene: this.sceneAdapter.scene });
  }

  public async loadIbl(url: string) {
    const setIbl = (ibl: any) => {
      this._renderer.setIBL(ibl);
      this.three_renderer.setIBL(ibl);
      this._renderer.useIBL = true;
      this.three_renderer.useIBL(true);
      this.three_renderer.showBackground = true;
      this._renderer.showBackground = true;
    };

    if (url == "None") {
      this._renderer.useIBL = false;
      this.three_renderer.showBackground = false;
      this._renderer.showBackground = false;
      return;
    }

    console.log(`Loading ${url}`);
    new RGBELoader()
      .setDataType(FloatType)
      .loadAsync(url).then((ibl) => {
        setIbl(ibl);
      });
  }

  private addGroundPlane(scene: THREE.Scene | THREE.Group) {
    if (!this.sceneBoundingBox) return;

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
      var destCtx = this.canvas.getContext("2d")!;
      destCtx.drawImage(this.canvas_three, 0, 0);
    });
  }

  private stopRasterizer() {
    this.three_renderer.stopRendering();
  }

  private stopPathtracing() {
    this._renderer.stopRendering();
  }

  private lastTimeStamp = 0.0;
  private startPathtracing() {
    this.stopRasterizer();

    this._renderer.render(this.camera, -1,
      () => { // on tile finished
        this.controls.update();
        if (this._pathtracing) {
          var destCtx = this.canvas.getContext("2d")!;
          destCtx.drawImage(this.canvas_pt, 0, 0);
        }
      },
      () => { // on frame finished
        const now = performance.now();
        this._fps = 1000.0 / (now - this.lastTimeStamp);
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

    this._renderer.resize(window.innerWidth, window.innerHeight);
    this.three_renderer.resize(window.innerWidth, window.innerHeight);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private updateCameraFromBoundingBox() {
    if (!this.sceneBoundingBox) return;

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

  public saveImage() {
    var dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement("a");
    link.download = 'capture.png';
    link.href = dataURL;
    link.click();
  }

  public centerView() {
    if (this.controls) {
      let center = new Vector3();
      this.sceneBoundingBox.getCenter(center);
      this.controls.target = center;
      this.controls.update();
      this._renderer.resetAccumulation();
    }
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
}