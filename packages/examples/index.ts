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
import type { PathtracingRenderer, PathtracingSceneData } from 'dspbr-pt';
import * as Assets from './asset_index';

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  alert('The File APIs are not fully supported in this browser.');
}

if (import.meta.env.DEV) {
  console.log('Local development: replacing asset URLs with local paths...');
  const base = 'https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets';
  for (const ibl of Object.values(Assets.ibls)) {
    if (ibl['url']) ibl['url'] = ibl['url'].replace(base, '');
  }
  for (const scene of Object.values(Assets.scenes)) {
    if (scene['url']) scene['url'] = scene['url'].replace(base, '');
  }
}

class Demo {
  private _viewer: DemoViewer;
  private _renderer: PathtracingRenderer;
  private _scene?: PathtracingSceneData;
  private _ui: Pane;
  private _uiTabs: ReturnType<Pane['addTab']>;
  private _container: HTMLElement;

  private _defaultIblKey = 'Artist Workshop';
  private _currentIbl    = this._defaultIblKey;
  private _currentScene  = '';
  private _params: Record<string, string | null>;

  private _paneMatFolders: Record<string, ReturnType<Pane['addFolder']>> = {};

  constructor() {
    this._container = document.createElement('div');
    this._viewer    = new DemoViewer({ container: this._container });
    this._renderer  = this._viewer.renderer;
    this._ui        = new Pane({ title: 'dspbr-pt' });

    this._params = new Proxy(new URLSearchParams(window.location.search), {
      get: (sp, prop: string) => sp.get(prop),
    }) as unknown as Record<string, string | null>;

    this._viewer.addEventListener('sceneLoaded', (ev: Event) => {
      const { scene } = (ev as CustomEvent<{ scene: PathtracingSceneData }>).detail;
      this._scene = scene;
      this.initMaterialSelector();
    });

    if (this._params['src']) {
      this._viewer.loadSceneFromUrl(this.resolveUrlFromIndex(this._params['src']!));
    }
    if (this._params['ibl']) {
      this._viewer.loadIbl(this.resolveUrlFromIndex(this._params['ibl']!));
    } else {
      this._viewer.loadIbl(this.resolveUrlFromIndex(this._defaultIblKey));
    }
    if (this._params['iblRotation']) {
      this._renderer.iblRotation = parseFloat(this._params['iblRotation']!);
    }
    if (this._params['tileRes']) {
      this._viewer.tileRes = parseInt(this._params['tileRes']!);
    }

    this.initUI();
  }

  private initUI() {
    Object.assign(this._ui.element.style, {
      width: '350px', top: '5px', right: '5px', position: 'absolute', zIndex: '2',
    });

    this._uiTabs = this._ui.addTab({
      pages: [{ title: 'Parameters' }, { title: 'Materials' }],
    });
    const params = this._uiTabs.pages[0]!;

    params.addButton({ title: 'Center View' }).on('click', () => this._viewer.centerView());
    params.addButton({ title: 'Save Image'  }).on('click', () => this._viewer.saveImage());

    // Scene
    const scene = params.addFolder({ title: 'Scene' });
    scene.addBinding(this, '_currentScene', {
      label: 'Scene',
      options: buildOptions(Object.keys(Assets.scenes)),
    }).on('change', ev => {
      if (ev.value) this._viewer.loadSceneFromUrl(this.resolveUrlFromIndex(ev.value));
    });
    scene.addBinding(this._viewer, 'autoRotate', { label: 'Auto Rotate' });

    // Lighting
    const lighting = params.addFolder({ title: 'Lighting' });
    lighting.addBinding(this, '_currentIbl', {
      label: 'IBL',
      options: buildOptions(Object.keys(Assets.ibls)),
    }).on('change', ev => this._viewer.loadIbl(this.resolveUrlFromIndex(ev.value)));

    lighting.addBinding(this._renderer, 'iblRotation', {
      label: 'IBL Rotation', step: 0.1, min: -180, max: 180,
    }).on('change', () => this._viewer.toggleInteractionMode(true, 100));

    lighting.addBinding(this._renderer, 'iblImportanceSampling', { label: 'Importance Sampling' });

    // Integrator
    const integrator = params.addFolder({ title: 'Integrator' });
    integrator.addBinding(this._renderer, 'debugMode', {
      label: 'Debug Mode',
      options: buildOptions(this._renderer.debugModes),
    });
    integrator.addBinding(this._renderer, 'maxBounces',     { label: 'Max Bounces',     step: 1,       min: 0,   max: 32    });
    integrator.addBinding(this._renderer, 'rayEps',         { label: 'Ray Offset',      step: 0.00001, min: 0,   max: 10    });
    integrator.addBinding(this._viewer,   'tileRes',        { label: 'Tile Res',        step: 1,       min: 1,   max: 8     });
    integrator.addBinding(this._renderer, 'clampThreshold', { label: 'Clamp Threshold', step: 0.1,     min: 0,   max: 100   });

    // Display
    const display = params.addFolder({ title: 'Display' });
    display.addBinding(this._renderer, 'exposure',    { label: 'Display Exposure', step: 0.01, min: 0, max: 10 });
    display.addBinding(this._renderer, 'tonemapping', {
      label: 'Tonemapping',
      options: buildOptions(this._renderer.tonemappingModes),
    });
    display.addBinding(this._renderer, 'enableGamma',         { label: 'Gamma' });
    display.addBinding(this._viewer,   'pathtracedInteraction',{ label: 'Pathtraced Navigation' });
    display.addBinding(this._renderer, 'showBackground',      { label: 'Background from IBL' });
    display.addBinding(this._viewer,   'pixelRatio',          { label: 'Pixel Ratio',    step: 0.1, min: 0.1, max: 1 });
    display.addBinding(this._viewer,   'interactionPixelRatio',{ label: 'Interaction Ratio', step: 0.1, min: 0.1, max: 1 });
    display.addBinding(this._renderer, 'enableFxaa',          { label: 'FXAA' });

    // Background color
    const bgState = { color: { r: 0, g: 0, b: 0 } };
    const background = params.addFolder({ title: 'Background' });
    background.addBinding(bgState, 'color', {
      label: 'Color',
      color: { type: 'int' },
    }).on('change', ev => {
      this._renderer.backgroundColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255, 1];
    });

    // FPS monitor
    params.addBinding(this._viewer, 'fps', {
      readonly: true,
      view: 'graph',
      label: 'FPS',
      min: 0,
      max: 60,
    });
  }

  private initMaterialSelector() {
    if (!this._scene) return;
    const materials = this._scene.materials;
    const matTab = this._uiTabs.pages[1]!;

    // Clear old children
    for (const child of [...(matTab as any).children]) {
      (child as any).dispose?.();
    }

    const matNames = materials.map((m, i) => ({ text: m.name || `material_${i}`, value: i }));
    const sel = { index: 0 };
    matTab.addBinding(sel, 'index', { options: matNames }).on('change', ev => {
      this.initMaterialParamUI(ev.value);
    });

    if (materials.length > 0) this.initMaterialParamUI(0);
  }

  private initMaterialParamUI(matIdx: number) {
    if (!this._scene) return;
    const matTab = this._uiTabs.pages[1]!;
    const mat = this._scene.materials[matIdx]!;

    for (const folder of Object.values(this._paneMatFolders)) {
      folder.dispose();
    }
    this._paneMatFolders = {};

    const f01: Parameters<Pane['addBinding']>[2] = { step: 0.01, min: 0, max: 1 };
    const colors = {
      albedo:           { r: mat.albedo[0]! * 255,           g: mat.albedo[1]! * 255,           b: mat.albedo[2]! * 255 },
      specularTint:     { r: mat.specularTint[0]! * 255,     g: mat.specularTint[1]! * 255,     b: mat.specularTint[2]! * 255 },
      translucencyColor:{ r: mat.translucencyColor[0]! * 255,g: mat.translucencyColor[1]! * 255,b: mat.translucencyColor[2]! * 255 },
      sheenColor:       { r: mat.sheenColor[0]! * 255,       g: mat.sheenColor[1]! * 255,       b: mat.sheenColor[2]! * 255 },
      attenuationColor: { r: mat.attenuationColor[0]! * 255, g: mat.attenuationColor[1]! * 255, b: mat.attenuationColor[2]! * 255 },
    };
    const colorOpts = { color: { type: 'int' as const } };
    const emission = { x: mat.emission[0]!, y: mat.emission[1]!, z: mat.emission[2]! };

    const add = (title: string) => {
      const folder = matTab.addFolder({ title });
      this._paneMatFolders[title] = folder;
      return folder;
    };

    const base = add('Base');
    base.addBinding(colors, 'albedo', { ...colorOpts }).on('change', ev => {
      mat.albedo = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });
    base.addBinding(mat, 'roughness', f01);
    base.addBinding(mat, 'metallic',  f01);
    base.addBinding(mat, 'specular',  f01);
    base.addBinding(emission, 'x', { label: 'emission R', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emission = [ev.value, emission.y, emission.z]; });
    base.addBinding(emission, 'y', { label: 'emission G', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emission = [emission.x, ev.value, emission.z]; });
    base.addBinding(emission, 'z', { label: 'emission B', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emission = [emission.x, emission.y, ev.value]; });

    const anisotropy = add('Anisotropy');
    const anisoDir = { x: mat.anisotropyDirection[0]!, y: mat.anisotropyDirection[1]! };
    anisotropy.addBinding(mat, 'anisotropy', { step: 0.01, min: -1, max: 1 });
    anisotropy.addBinding(anisoDir, 'x', { label: 'direction X', step: 0.01, min: -1, max: 1 }).on('change', ev => { mat.anisotropyDirection = [ev.value, anisoDir.y, 0]; });
    anisotropy.addBinding(anisoDir, 'y', { label: 'direction Y', step: 0.01, min: -1, max: 1 }).on('change', ev => { mat.anisotropyDirection = [anisoDir.x, ev.value, 0]; });

    const transmission = add('Transmission');
    transmission.addBinding(mat, 'transparency',  f01);
    transmission.addBinding(mat, 'cutoutOpacity', f01);
    transmission.addBinding(mat, 'translucency',  { ...f01, label: 'diffuse transmission' });
    transmission.addBinding(colors, 'translucencyColor', { ...colorOpts, label: 'diffuse transmission color' }).on('change', ev => {
      mat.translucencyColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const sheen = add('Sheen');
    sheen.addBinding(mat,    'sheenRoughness', f01);
    sheen.addBinding(colors, 'sheenColor', colorOpts).on('change', ev => {
      mat.sheenColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const clearcoat = add('Clearcoat');
    clearcoat.addBinding(mat, 'clearcoat',          f01);
    clearcoat.addBinding(mat, 'clearcoatRoughness', f01);

    const thinWalledState = { thinWalled: mat.thinWalled > 0 };
    const volume = add('Volume');
    volume.addBinding(thinWalledState, 'thinWalled').on('change', ev => { mat.thinWalled = ev.value ? 1 : 0; });
    volume.addBinding(mat, 'ior',               { min: 0, max: 3, step: 0.01 });
    volume.addBinding(mat, 'attenuationDistance',{ step: 0.00001, min: 0, max: 1e5 });
    volume.addBinding(colors, 'attenuationColor', colorOpts).on('change', ev => {
      mat.attenuationColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const iridescence = add('Iridescence');
    iridescence.addBinding(mat, 'iridescence',                f01);
    iridescence.addBinding(mat, 'iridescenceIOR',             { min: 0, max: 3, step: 0.01 });
    iridescence.addBinding(mat, 'iridescenceThicknessMinimum',{ min: 10, max: 1200, step: 1 });
    iridescence.addBinding(mat, 'iridescenceThicknessMaximum',{ min: 10, max: 1200, step: 1 });

    const unfold = this._params['unfold'];
    if (unfold) {
      for (const folder of Object.values(this._paneMatFolders)) folder.expanded = false;
      for (const name of unfold.split(' ')) {
        if (this._paneMatFolders[name]) this._paneMatFolders[name]!.expanded = true;
      }
    }
  }

  private resolveUrlFromIndex(name: string): string {
    if (!name) return 'None';
    const key = name.replaceAll('%20', ' ');
    if (key in Assets.scenes) {
      const s = Assets.scenes[key]!;
      this.setInfo('scene-info', key, s.credit);
      return s.url;
    }
    if (key in Assets.ibls) {
      const ibl = Assets.ibls[key]!;
      this.setInfo('ibl-info', key, ibl.credit);
      this._renderer.exposure   = ibl.intensity ?? 1.0;
      this._renderer.iblRotation = ibl.rotation ?? 180.0;
      return ibl.url;
    }
    return name;
  }

  private setInfo(id: string, name: string, credit?: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `${id === 'ibl-info' ? 'IBL' : 'Scene'}: ${name}`;
    if (credit) el.innerHTML += ` - ${credit}`;
  }
}

function buildOptions(labels: string[]): Record<string, string> {
  return Object.fromEntries([['', ''], ...labels.map(l => [l, l])]);
}

new Demo();
