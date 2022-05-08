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
import { DemoViewer } from 'dspbr-pt-viewer';
import { PathtracingRenderer, PathtracingSceneData } from 'dspbr-pt';
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

class Demo {
  private _viewer: DemoViewer;
  private _renderer: PathtracingRenderer;
  private _scene?: PathtracingSceneData;
  private _ui: Pane;
  private _uiTabs: any;
  private _container: HTMLElement;

  private _defaultIblKey = "Artist Workshop";
  private _currentIbl = this._defaultIblKey;
  private _currentScene = "";

  constructor() {
    this._container = document.createElement('div');
    this._viewer = new DemoViewer({ container: this._container });
    this._renderer = this._viewer.renderer;
    this._ui = new Pane({ title: "dspbr-pt" });
    this._viewer.on("sceneLoaded", (ev: any) => {
      this._scene = ev.scene;
      this.initMaterialSelector();
    })
    this.initUI();

    let iblKey = this._defaultIblKey;
    if (window.location.hash) {
      const uris = window.location.hash.split("#");

      for (const u of uris) {
        // if (u == "ground") {
        //   this.showGroundPlane = true;
        // }
        if (u.includes("ibl")) {
          iblKey = u.replace("ibl:", "");
        }
      }

      const url = this.resolveUrlFromIndex(uris[1]);
      this._viewer.loadSceneFromUrl(url);
    }

    this._viewer.loadIbl(this.resolveUrlFromIndex(iblKey));
  }

  private initUI() {
    this._ui.element.style.width = '350px';
    this._ui.element.style.top = '5px';
    this._ui.element.style.right = '5px';
    this._ui.element.style.position = 'absolute';
    this._ui.element.style.zIndex = "2";

    // this.pane = pane;
    this._uiTabs = this._ui.addTab({
      pages: [
        { title: 'Parameters' },
        { title: 'Materials' },
      ],
    });
    const params = this._uiTabs.pages[0];

    params.addButton({
      title: 'Center View'
    }).on('click', () => {
      this._viewer.centerView();
    })

    params.addButton({
      title: 'Save Image'
    }).on('click', () => {
      this._viewer.saveImage();
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

    scene.addInput(this, '_currentScene', {
      label: "Scene",
      options: optionsFromList(Object.keys(Assets.scenes)),
    }).on('change', (ev) => {
      if (ev.value != "") {
        const url = this.resolveUrlFromIndex(ev.value);
        this._viewer.loadSceneFromUrl(url);
      }
    });

    scene.addInput(this._viewer, 'autoRotate', {
      label: "Auto Rotate"
    });

    const lighting = params.addFolder({
      title: 'Lighting',
    });

    lighting.addInput(this, '_currentIbl', {
      label: "IBL",
      options: optionsFromList(Object.keys(Assets.ibls)),
    }).on('change', (ev) => {
      const url = this.resolveUrlFromIndex(ev.value);
      console.log(url);
      this._viewer.loadIbl(url);
    });

    lighting.addInput(this._renderer, 'iblRotation', {
      label: 'IBL Rotation',
      step: 0.1,
      min: -180,
      max: 180
    }).on('change', () => {
      this._viewer.toggleInteractionMode(true, 100.0);
    });

    lighting.addInput(this._renderer, 'iblImportanceSampling', {
      label: 'Importance Sampling'
    })

    const interator = params.addFolder({
      title: 'Integrator',
    });
    interator.addInput(this._viewer, 'togglePathtracing', {
      label: 'Pathtracing'
    });
    interator.addInput(this._renderer, 'debugMode', {
      label: 'Debug Mode',
      options: optionsFromList(this._renderer.debugModes)
    });
    interator.addInput(this._renderer, 'maxBounces', {
      label: 'Max Bounces',
      step: 1,
      min: 0,
      max: 32
    });
    interator.addInput(this._renderer, 'rayEps', {
      label: 'Ray Offset',
      step: 0.00001,
      min: 0,
      max: 10.0
    });
    interator.addInput(this._renderer, 'tileRes', {
      label: 'Tile Res',
      step: 1,
      min: 1,
      max: 8
    });
    interator.addInput(this._renderer, 'clampThreshold', {
      label: 'Clamp Threshold',
      step: 0.1,
      min: 0,
      max: 100
    });

    const display = params.addFolder({
      title: 'Display',
    });
    display.addInput(this._renderer, 'exposure', {
      label: 'Display Exposure',
      step: 0.01,
      min: 0,
      max: 10
    });
    display.addInput(this._renderer, 'tonemapping', {
      label: 'Tonemapping',
      options: optionsFromList(this._renderer.tonemappingModes)
    });
    display.addInput(this._renderer, 'enableGamma', {
      label: 'Gamma'
    });
    display.addInput(this._viewer, 'pathtracedInteraction', {
      label: 'Pathtraced Navigation'
    });
    display.addInput(this._viewer, 'pixelRatio', {
      label: 'Pixel Ratio',
      step: 0.1,
      min: 0.1,
      max: 1
    });
    display.addInput(this._viewer, 'interactionPixelRatio', {
      label: 'Interaction Ratio',
      step: 0.1,
      min: 0.1,
      max: 1
    });
    display.addInput(this._renderer, 'enableFxaa', {
      label: 'Fxaa'
    });

    const background = params.addFolder({
      title: 'Background',
    });
    display.addInput(this._renderer, 'showBackground', {
      label: 'Background from IBL'
    });

    background.color = { r: 0, g: 0, b: 0 };
    background.addInput(background, 'color', {
      label: 'Background Color',
      picker: 'inline',
      expanded: true,
    }).on('change', (ev) => {
      console.log(ev.value);
      this._renderer.backgroundColor = [ev.value.r / 255.0, ev.value.g / 255.0, ev.value.g / 255.0, 1.0];
    });

    params.addMonitor(this._viewer, 'fps', {
      label: 'Fps',
      view: 'graph',
      step: 0.1,
      min: 0,
      max: 10
    });
  }

  private paneMatFolders = [];

  private initMaterialParamUI(matIdx: number) {
    const matTab = this._uiTabs.pages[1];
    const mat = this._scene.materials[matIdx];

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

  private matSelectorUI?:  any;
  private initMaterialSelector() {
    const materials = this._scene.materials;

    if(this.matSelectorUI) this.matSelectorUI.dispose();

    const matTab = this._uiTabs.pages[1];
    const matNameMap = {};
    for (let i = 0; i < materials.length; i++) {
      matNameMap[materials[i].name] = i;
    }
    const opt = {
      name: materials[0].name
    }

    this.matSelectorUI = matTab.addInput(opt, "name", {
      options: matNameMap
    }).on('change', (ev) => {
      this.initMaterialParamUI(ev.value);
    })

    if (materials.length > 0) {
      this.initMaterialParamUI(matNameMap[materials[0].name]);
    }
  }

  private resolveUrlFromIndex(name: string) {
    if(name == "") {
      return "None";
    }

    let sceneUrl = "";
    const key = name.replaceAll('%20', ' ');
    if (key in Assets.scenes) {
      const scene = Assets.scenes[key];
      this.setSceneInfo(key, scene.credit);
      sceneUrl = scene.url;
    }
    if (key in Assets.ibls) {
      const ibl = Assets.ibls[key];
      this.setIBLInfo(key, ibl.credit);
      sceneUrl = ibl.url;
      this._renderer.exposure = ibl.intensity ?? 1.0;
      this._renderer.iblRotation = ibl.rotation ?? 180.0;
    }

    return sceneUrl != "" ? sceneUrl : name;
  }


  private setIBLInfo(name: string, credit?: any) {
    document.getElementById("ibl-info").innerHTML = `IBL: ${name}`;
    if (credit) document.getElementById("ibl-info").innerHTML += ` - ${credit}`;
  }

  private setSceneInfo(name: string, credit?: any) {
    document.getElementById("scene-info").innerHTML = `Scene: ${name}`;
    if (credit) document.getElementById("scene-info").innerHTML += ` - ${credit}`;
  }

}

let demo = new Demo();