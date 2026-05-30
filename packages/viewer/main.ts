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

import { SimpleDropzone } from 'simple-dropzone';
import { PathtracingRenderer, loadSceneFromBlobs, loadSceneFromUrl, loadIblFromUrl, loadIblFromBlob } from 'dspbr-pt';
import type { PathtracingSceneData, IblTextureLike } from 'dspbr-pt';
import { PerspectiveCamera } from './perspective_camera';
import { WasdCameraController } from './wasd_camera_controller';
import { Vec3, Box3 } from './math';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

export interface SceneLoadedEvent {
  scene: PathtracingSceneData;
}

export class DemoViewer extends EventTarget {
  private canvas: HTMLCanvasElement;
  private spinner: HTMLElement;
  private container?: HTMLElement;
  private startpage?: HTMLElement;
  private status?: HTMLElement;
  private loadscreen?: HTMLElement;

  private camera: PerspectiveCamera;
  private controls: WasdCameraController;

  private _renderer: PathtracingRenderer;
  public get renderer() { return this._renderer; }

  private _fps = 0.0;
  public get fps() { return this._fps; }

  public get autoRotate() { return this.controls.autoRotate; }
  public set autoRotate(flag: boolean) { this.controls.autoRotate = flag; }

  private _pixelRatio = 1.0;
  public get pixelRatio() { return this._pixelRatio; }
  public set pixelRatio(val: number) {
    this._pixelRatio = val;
    this._renderer.pixelRatio = val;
  }

  private _interactionPixelRatio = 0.1;
  public get interactionPixelRatio() { return this._interactionPixelRatio; }
  public set interactionPixelRatio(val: number) { this._interactionPixelRatio = val; }

  private _tileRes = 4;
  public set tileRes(val: number) { this._tileRes = val; this._renderer.tileRes = val; }
  public get tileRes() { return this._tileRes; }

  private interactionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private restoreTileModeAfterNextFrame = false;
  private lastTimeStamp = 0.0;
  private sceneBounds?: Box3;

  constructor(params: { container: HTMLElement }) {
    super();
    this.container = params.container;
    document.body.appendChild(this.container);

    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.startpage  = document.getElementById('startpage')!;
    this.loadscreen = document.getElementById('loadscreen')!;
    this.status     = document.getElementById('status')!;
    this.spinner    = document.getElementsByClassName('spinner')[0] as HTMLElement;

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(45, aspect, 0.01, 1000);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(new Vec3(0, 0, 0));

    this.controls = new WasdCameraController(this.camera, this.canvas);
    this.controls.addEventListener('change', () => {
      this._renderer.resetAccumulation();
    });
    this.controls.addEventListener('start', () => {
      this.toggleInteractionMode(true);
    });
    this.controls.addEventListener('end', () => {
      this.toggleInteractionMode(false);
    });

    this._renderer = new PathtracingRenderer({ canvas: this.canvas });
    this._renderer.maxBounces = 5;
    this._renderer.pixelRatio = this._pixelRatio;
    this._renderer.tileRes = this._tileRes;

    window.addEventListener('resize', () => this.resize(), false);

    const input = document.createElement('input');
    const dropCtrlOverlay = new SimpleDropzone(this.startpage, input);
    dropCtrlOverlay.on('dropstart', () => this.hideStartpage());
    dropCtrlOverlay.on('drop', async ({ files }: { files: Map<string, File> }) => { await this.loadDropFiles(files); });

    const dropCtrlCanvas = new SimpleDropzone(this.canvas, input);
    dropCtrlCanvas.on('drop', async ({ files }: { files: Map<string, File> }) => { await this.loadDropFiles(files); });

    this.container.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
  }

  public toggleInteractionMode(flag: boolean, timeout?: number) {
    if (flag) {
      this.restoreTileModeAfterNextFrame = false;
      this._renderer.pixelRatio = this._interactionPixelRatio;
      this._renderer.tileRes = 1;
      if (timeout && !this.interactionTimeoutId) {
        this.interactionTimeoutId = setTimeout(() => {
          this.interactionTimeoutId = null;
          this.toggleInteractionMode(false);
        }, timeout);
      }
    } else {
      if (this.interactionTimeoutId) {
        clearTimeout(this.interactionTimeoutId);
        this.interactionTimeoutId = null;
      }
      this._renderer.pixelRatio = this._pixelRatio;
      this._renderer.tileRes = 1;
      this.restoreTileModeAfterNextFrame = true;
    }
  }

  private async loadDropFiles(fileMap: Map<string, File>) {
    for (const [key, value] of fileMap) {
      if (key.match(/\.hdr$/)) {
        this.showStatusScreen('Loading HDR...');
        await this.loadIbl(URL.createObjectURL(value));
        this.hideLoadscreen();
      }
      if (key.match(/\.glb$/) || key.match(/\.gltf$/)) {
        this.showStatusScreen('Loading Scene...');
        const files: [string, File][] = Array.from(fileMap);
        await this.loadSceneFromFiles(files);
      }
    }
  }

  private async loadSceneFromFiles(files: [string, File][]) {
    try {
      const { scene } = await loadSceneFromBlobs(files);
      await this.applyScene(scene);
    } catch (err) {
      console.error('Failed to load scene:', err);
      this.hideLoadscreen();
    }
  }

  public async loadSceneFromUrl(url: string) {
    this.showStatusScreen('Loading Scene...');
    try {
      const { scene } = await loadSceneFromUrl(url);
      await this.applyScene(scene);
    } catch (err) {
      console.error('Failed to load scene:', err);
      this.hideLoadscreen();
    }
    this.hideStartpage();
  }

  private async applyScene(scene: PathtracingSceneData) {
    this.computeSceneBounds(scene);
    this.updateCameraFromBounds();
    this.centerView();

    await this._renderer.setScene(scene);
    this.startPathtracing();
    this.hideLoadscreen();

    this.dispatchEvent(new CustomEvent('sceneLoaded', { detail: { scene } }));
  }

  private computeSceneBounds(scene: PathtracingSceneData) {
    const buf = scene.triangleBuffer;
    if (!buf || buf.length === 0) return;
    const bounds = new Box3();
    const stride = 20; // VERTEX_STRIDE
    for (let i = 0; i < buf.length; i += stride) {
      bounds.expandByPoint(new Vec3(buf[i]!, buf[i + 1]!, buf[i + 2]!));
    }
    this.sceneBounds = bounds;
  }

  public async loadIbl(url: string) {
    if (url === 'None') {
      this._renderer.useIBL = false;
      this._renderer.showBackground = false;
      return;
    }
    let ibl: IblTextureLike;
    if (url.startsWith('blob:')) {
      const resp = await fetch(url);
      ibl = await loadIblFromBlob(await resp.blob());
    } else {
      ibl = await loadIblFromUrl(url);
    }
    this._renderer.setIBL(ibl);
    this._renderer.useIBL = true;
    this._renderer.showBackground = true;
  }

  public saveImage() {
    const link = document.createElement('a');
    link.download = 'capture.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  public centerView() {
    if (!this.sceneBounds) return;
    const center = new Vec3();
    this.sceneBounds.getCenter(center);
    this.controls.lookAt(center);
    this._renderer.resetAccumulation();
  }

  private updateCameraFromBounds() {
    if (!this.sceneBounds) return;
    const size = this.sceneBounds.getSize();
    const diag = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z);
    const dist = diag * 2.0 / Math.tan(45.0 * Math.PI / 180.0);
    const center = new Vec3();
    this.sceneBounds.getCenter(center);
    this.camera.position.set(center.x, center.y + diag * 0.5, center.z + dist);
    this.camera.lookAt(center);
    this.camera.updateMatrixWorld();
  }

  private startPathtracing() {
    this._renderer.render(
      this.camera,
      -1,
      () => {
        if (this.restoreTileModeAfterNextFrame) {
          this.restoreTileModeAfterNextFrame = false;
          this._renderer.tileRes = this._tileRes;
        }
      },
      () => {
        const now = performance.now();
        this._fps = 1000.0 / (now - this.lastTimeStamp);
        this.lastTimeStamp = now;
      },
    );
  }

  private resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._renderer.resize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
  }

  showStartpage() { this.startpage!.style.visibility = 'visible'; }
  hideStartpage() { this.startpage!.style.visibility = 'hidden'; }

  showStatusScreen(msg: string) {
    this.status!.innerText = msg;
    this.loadscreen!.style.visibility = 'visible';
    this.spinner.style.visibility = 'visible';
  }

  hideLoadscreen() {
    this.loadscreen!.style.visibility = 'hidden';
    this.spinner.style.visibility = 'hidden';
  }
}

export { PerspectiveCamera } from './perspective_camera';
export { WasdCameraController } from './wasd_camera_controller';
export { Vec3, Mat4, Box3, clamp } from './math';
