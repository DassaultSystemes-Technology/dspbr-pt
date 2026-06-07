import { Pane } from 'tweakpane';
import type { PathtracingRenderer, PathtracingSceneData } from 'dspbr-pt';
import * as Assets from './asset_index';
import { DemoViewer } from './demo_viewer';

const VERTEX_STRIDE = 20;
const MATERIAL_OFFSET = 3;
const PICK_EPSILON = 1e-7;
const MATERIAL_PROFILES = ['webgl-lean', 'webgl-full'] as const;
type MaterialProfile = typeof MATERIAL_PROFILES[number];

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
  private _diagnosticsPanel: HTMLDivElement;
  private _diagnosticsVisible = false;
  private _diagnosticsTimer = 0;
  private _helpPanel: HTMLElement | null = null;
  private _helpVisible = false;
  private _materialProfile: MaterialProfile = 'webgl-lean';
  private _materialProfileChoiceButtons: HTMLButtonElement[] = [];
  private _menuOpen = false;
  private _materialSelection = { index: 0 };
  private _materialSelector?: { refresh: () => void };

  private _defaultIblKey = 'Artist Workshop';
  private _currentIbl    = this._defaultIblKey;
  private _currentScene  = '';
  private _params: Record<string, string | null>;

  private _paneMatFolders: Record<string, ReturnType<Pane['addFolder']>> = {};

  constructor() {
    this._container = document.createElement('div');
    this._params = new Proxy(new URLSearchParams(window.location.search), {
      get: (sp, prop: string) => sp.get(prop),
    }) as unknown as Record<string, string | null>;
    this._materialProfile = parseMaterialProfile(new URLSearchParams(window.location.search).get('materialProfile'));
    this._viewer    = new DemoViewer({ container: this._container, materialProfile: this._materialProfile });
    this._renderer  = this._viewer.renderer;
    this._ui        = new Pane({ title: 'dspbr-pt' });
    this._diagnosticsPanel = document.createElement('div');
    this._diagnosticsPanel.className = 'diagnostics-panel';
    this._diagnosticsPanel.hidden = true;
    document.body.appendChild(this._diagnosticsPanel);

    this._viewer.addEventListener('sceneLoaded', (ev: Event) => {
      const { scene } = (ev as CustomEvent<{ scene: PathtracingSceneData }>).detail;
      this._scene = scene;
      this.initMaterialSelector();
      this.renderDiagnosticsPanel();
    });
    window.addEventListener('keydown', ev => {
      if (ev.key === '`') {
        if (isEditingElement(ev.target)) return;
        ev.preventDefault();
        this.toggleDiagnostics();
      }
      if (ev.key === 'Escape' && this._helpVisible) {
        this.toggleHelp(false);
      }
    });
    window.addEventListener('resize', () => this.syncMenuState());
    this._viewer.viewCanvas.addEventListener('pointerdown', ev => this.captureMaterialPickPointer(ev), true);
    this._viewer.viewCanvas.addEventListener('pointerup', ev => this.captureMaterialPickPointer(ev), true);
    this._viewer.viewCanvas.addEventListener('click', ev => this.handleCanvasClick(ev), true);
    this.initOverlayActions();

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
    this.updateMaterialProfilePicker();
    this.syncMenuState();
  }

  private initUI() {
    Object.assign(this._ui.element.style, {
      width: '350px', top: '5px', right: '5px', position: 'absolute', zIndex: '2',
    });
    this._ui.element.classList.add('viewer-controls');

    this._uiTabs = this._ui.addTab({
      pages: [{ title: 'Parameters' }, { title: 'Materials' }],
    });
    const params = this._uiTabs.pages[0]!;

    params.addButton({ title: 'Center View' }).on('click', () => this._viewer.centerView());
    params.addButton({ title: 'Save Image'  }).on('click', () => this._viewer.saveImage());
    params.addButton({ title: 'Diagnostics' }).on('click', () => this.toggleDiagnostics());

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

    // Integrator
    const integrator = params.addFolder({ title: 'Integrator' });
    integrator.addBinding(this._renderer, 'debugMode', {
      label: 'Debug Mode',
      options: buildOptions(this._renderer.debugModes),
    }).on('change', () => this._viewer.restartPathtracing());
    integrator.addBinding(this._viewer, 'sampleLimit',   { label: 'Sample Limit',    step: 1,       min: 1,   max: 4096  });
    integrator.addBinding(this._renderer, 'maxBounces',     { label: 'Max Bounces',     step: 1,       min: 0,   max: 32    }).on('change', () => this._viewer.restartPathtracing());
    integrator.addBinding(this._renderer, 'rayEps',         { label: 'Ray Offset',      step: 0.00001, min: 0,   max: 10    }).on('change', () => this._viewer.restartPathtracing());
    integrator.addBinding(this._renderer, 'clampThreshold', { label: 'Clamp Threshold', step: 0.1,     min: 0,   max: 100   }).on('change', () => this._viewer.restartPathtracing());

    // Display
    const display = params.addFolder({ title: 'Display' });
    display.addBinding(this._renderer, 'exposure',    { label: 'Display Exposure', step: 0.01, min: 0, max: 10 }).on('change', () => this._viewer.restartPathtracing());
    display.addBinding(this._renderer, 'tonemapping', {
      label: 'Tonemapping',
      options: buildOptions(this._renderer.tonemappingModes),
    }).on('change', () => this._viewer.restartPathtracing());
    display.addBinding(this._renderer, 'enableGamma',         { label: 'Gamma' }).on('change', () => this._viewer.restartPathtracing());
    display.addBinding(this._renderer, 'showBackground',      { label: 'Background from IBL' }).on('change', () => this._viewer.restartPathtracing());
    display.addBinding(this._viewer,   'pixelRatio',          { label: 'Pixel Ratio',    step: 0.1, min: 0.1, max: 1 }).on('change', () => this._viewer.restartPathtracing());
    display.addBinding(this._viewer,   'interactionPixelRatio',{ label: 'Interaction Ratio', step: 0.1, min: 0.1, max: 1 });
    display.addBinding(this._renderer, 'enableFxaa',          { label: 'FXAA' }).on('change', () => this._viewer.restartPathtracing());

    // Background color
    const bgState = { color: { r: 0, g: 0, b: 0 } };
    const background = params.addFolder({ title: 'Background' });
    background.addBinding(bgState, 'color', {
      label: 'Color',
      color: { type: 'int' },
    }).on('change', ev => {
      this._renderer.backgroundColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255, 1];
      this._viewer.restartPathtracing();
    });

    // FPS monitor
    params.addBinding(this._viewer, 'fps', {
      readonly: true,
      view: 'graph',
      label: 'FPS',
      min: 0,
      max: 60,
    });

    this._diagnosticsTimer = window.setInterval(() => {
      if (this._diagnosticsVisible) this.renderDiagnosticsPanel();
    }, 500);
  }

  private toggleDiagnostics() {
    this._diagnosticsVisible = !this._diagnosticsVisible;
    this._diagnosticsPanel.hidden = !this._diagnosticsVisible;
    const button = document.getElementById('diagnostics-button');
    button?.setAttribute('aria-pressed', this._diagnosticsVisible ? 'true' : 'false');
    button?.setAttribute('aria-label', this._diagnosticsVisible ? 'Hide diagnostics' : 'Show diagnostics');
    if (this._diagnosticsVisible) this.renderDiagnosticsPanel();
  }

  private initOverlayActions() {
    this._helpPanel = document.getElementById('viewer-help-panel');
    this._materialProfileChoiceButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.material-profile-choice[data-material-profile]'));
    document.getElementById('help-button')?.addEventListener('click', () => this.toggleHelp());
    document.getElementById('diagnostics-button')?.addEventListener('click', () => this.toggleDiagnostics());
    document.getElementById('menu-button')?.addEventListener('click', () => this.toggleMenu());
    for (const button of this._materialProfileChoiceButtons) {
      button.addEventListener('click', () => {
        const profile = parseMaterialProfile(button.dataset.materialProfile ?? '');
        this.selectMaterialProfile(profile);
      });
    }
  }

  private toggleHelp(force?: boolean) {
    this._helpVisible = force ?? !this._helpVisible;
    if (this._helpPanel) this._helpPanel.hidden = !this._helpVisible;
    const button = document.getElementById('help-button');
    button?.setAttribute('aria-expanded', this._helpVisible ? 'true' : 'false');
    button?.setAttribute('aria-label', this._helpVisible ? 'Hide viewer help' : 'Show viewer help');
  }

  private toggleMenu() {
    this._menuOpen = !this._menuOpen;
    this.syncMenuState();
  }

  private syncMenuState() {
    const compact = window.innerWidth < 900 || window.innerHeight < 640 || window.matchMedia?.('(pointer: coarse)').matches === true;
    const visible = this._menuOpen;
    document.body.classList.toggle('viewer-compact-controls', compact);
    document.body.classList.toggle('viewer-controls-toggle-visible', true);
    this._ui.element.hidden = !visible;
    this._ui.element.classList.toggle('viewer-controls-mobile-open', compact && visible);
    const button = document.getElementById('menu-button');
    button?.setAttribute('aria-expanded', visible ? 'true' : 'false');
    button?.setAttribute('aria-label', visible ? 'Hide controls' : 'Show controls');
  }

  private selectMaterialProfile(profile: MaterialProfile) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('materialProfile') === profile) return;
    params.set('materialProfile', profile);
    const nextSearch = params.toString();
    window.location.search = nextSearch ? `?${nextSearch}` : '';
  }

  private updateMaterialProfilePicker() {
    for (const button of this._materialProfileChoiceButtons) {
      const active = button.dataset.materialProfile === this._materialProfile;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  private renderDiagnosticsPanel() {
    const d = this._renderer.diagnostics;
    const profiling = d.profiling ?? {};
    const scene = d.scene;
    const bvh = d.bvh;
    const memory = d.memory;
    this._diagnosticsPanel.innerHTML = [
      `<div class="diagnostics-card">`,
      this.renderDiagnosticsSection('Scene', [
        ['Triangles', formatNumber(scene?.triangles)],
        ['Vertices', formatNumber(scene?.vertices)],
        ['Vertex Idx', formatNumber(scene?.indices)],
        ['Materials', formatNumber(scene?.materials)],
        ['Textures', formatNumber(scene?.textures)],
        ['Lights', formatNumber(scene?.lights)],
      ]),
      this.renderDiagnosticsSection('Renderer', [
        ['Backend', d.backend],
        ['Material', this._materialProfile],
        ['Mode', d.mode],
        ['Samples', formatNumber(d.sampleCount)],
        ['FPS', Number.isFinite(this._viewer.fps) ? this._viewer.fps.toFixed(1) : 'n/a'],
        ['Render', d.renderResolution],
        ['Display', d.displayResolution],
        ['Tile', `${d.tileResolution}x${d.tileResolution}`],
      ]),
      this.renderDiagnosticsSection('Load', [
        ['Read', formatMs(profiling.readMs)],
        ['Transform', formatMs(profiling.transformMs)],
        ['Parse', formatMs(profiling.parseMs)],
        ['Upload', formatMs(profiling.gpuUploadMs)],
        ['BVH', formatMs(profiling.bvhBuildMs)],
        ['Shader', formatMs(profiling.shaderInitMs)],
        ['Setup', formatMs(profiling.rendererSetupMs)],
      ]),
      this.renderDiagnosticsSection('BVH', [
        ['Triangles', formatNumber(bvh?.triangles)],
        ['Nodes', formatNumber(bvh?.nodes)],
        ['Tri Remap', formatNumber(bvh?.indices)],
        ['Build', formatMs(bvh?.buildMs)],
        ['Memory', formatMiB(bvh?.memoryBytes)],
      ]),
      this.renderDiagnosticsSection('Memory', [
        ['Textures', formatMiB(memory?.textureBytes)],
        ['Geometry', formatMiB(memory?.geometryBytes)],
        ['BVH', formatMiB(memory?.bvhBytes)],
        ['Total', formatMiB(memory?.totalBytes)],
      ]),
      this.renderDiagnosticsSection('Shaders', [
        ['Programs', d.shaderPrograms.length > 0 ? d.shaderPrograms.join(', ') : 'n/a'],
        ['Frame Queued', d.framePending ? 'yes' : 'no'],
      ], { wide: true, wrap: true }),
      `</div>`,
    ].join('');
  }

  private renderDiagnosticsSection(title: string, rows: Array<[string, string]>, options: { wide?: boolean; wrap?: boolean } = {}) {
    const classes = `diagnostics-section${options.wide ? ' diagnostics-section-wide' : ''}`;
    return [
      `<section class="${classes}">`,
      `<h3>${escapeHtml(title)}</h3>`,
      ...rows.map(([label, value]) => {
        const valueClass = `diagnostics-value${options.wrap ? ' diagnostics-value-wrap' : ''}`;
        return `<div class="diagnostics-row${options.wide ? ' diagnostics-row-wide' : ''}"><span class="diagnostics-label">${escapeHtml(label)}</span><span class="${valueClass}">${escapeHtml(value)}</span></div>`;
      }),
      `</section>`,
    ].join('');
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
    this._materialSelection.index = Math.min(this._materialSelection.index, Math.max(0, materials.length - 1));
    this._materialSelector = matTab.addBinding(this._materialSelection, 'index', { options: matNames }).on('change', ev => {
      this.initMaterialParamUI(ev.value);
    });

    if (materials.length > 0) this.initMaterialParamUI(0);
  }

  private handleCanvasClick(ev: MouseEvent) {
    if (!ev.altKey || ev.button !== 0) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const materialIdx = this.pickMaterialAt(ev.clientX, ev.clientY);
    if (materialIdx === undefined) return;
    this.selectMaterial(materialIdx);
  }

  private captureMaterialPickPointer(ev: PointerEvent) {
    if (!ev.altKey || ev.button !== 0) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }

  private selectMaterial(materialIdx: number) {
    if (!this._scene || materialIdx < 0 || materialIdx >= this._scene.materials.length) return;
    this._materialSelection.index = materialIdx;
    this._materialSelector?.refresh();
    this.showMaterialsTab();
    this.initMaterialParamUI(materialIdx);
  }

  private showMaterialsTab() {
    const tab = this._uiTabs as any;
    const selectedIndex = tab.controller?.tab?.selectedIndex;
    if (selectedIndex) {
      selectedIndex.rawValue = 1;
      return;
    }
    const tabButtons = this._ui.element.querySelectorAll<HTMLButtonElement>('.tp-tbiv_b');
    tabButtons[1]?.click();
  }

  private pickMaterialAt(clientX: number, clientY: number): number | undefined {
    const scene = this._scene;
    const vertexBuffer = scene?.vertexBuffer;
    const indexBuffer = scene?.triangleIndexBuffer;
    if (!scene || !vertexBuffer || !indexBuffer) return undefined;

    const ray = createCameraRay(this._viewer.activeCamera, this._viewer.viewCanvas, clientX, clientY);
    let bestT = Number.POSITIVE_INFINITY;
    let bestMaterial = -1;

    for (let i = 0; i < indexBuffer.length; i += 3) {
      const i0 = indexBuffer[i]! * VERTEX_STRIDE;
      const i1 = indexBuffer[i + 1]! * VERTEX_STRIDE;
      const i2 = indexBuffer[i + 2]! * VERTEX_STRIDE;
      const t = intersectRayTriangle(
        ray.ox, ray.oy, ray.oz,
        ray.dx, ray.dy, ray.dz,
        vertexBuffer[i0]!, vertexBuffer[i0 + 1]!, vertexBuffer[i0 + 2]!,
        vertexBuffer[i1]!, vertexBuffer[i1 + 1]!, vertexBuffer[i1 + 2]!,
        vertexBuffer[i2]!, vertexBuffer[i2 + 1]!, vertexBuffer[i2 + 2]!,
      );
      if (t < bestT) {
        bestT = t;
        bestMaterial = Math.round(vertexBuffer[i0 + MATERIAL_OFFSET] ?? -1);
      }
    }

    return bestMaterial >= 0 ? bestMaterial : undefined;
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
      baseColor: { r: mat.baseColorFactor[0]! * 255, g: mat.baseColorFactor[1]! * 255, b: mat.baseColorFactor[2]! * 255 },
      specularColor: { r: mat.specularColorFactor[0]! * 255, g: mat.specularColorFactor[1]! * 255, b: mat.specularColorFactor[2]! * 255 },
      diffuseTransmissionColor: { r: mat.diffuseTransmissionColorFactor[0]! * 255, g: mat.diffuseTransmissionColorFactor[1]! * 255, b: mat.diffuseTransmissionColorFactor[2]! * 255 },
      sheenColor: { r: mat.sheenColorFactor[0]! * 255, g: mat.sheenColorFactor[1]! * 255, b: mat.sheenColorFactor[2]! * 255 },
      attenuationColor: { r: mat.attenuationColor[0]! * 255, g: mat.attenuationColor[1]! * 255, b: mat.attenuationColor[2]! * 255 },
    };
    const colorOpts = { color: { type: 'int' as const } };
    const emission = { x: mat.emissiveFactor[0]!, y: mat.emissiveFactor[1]!, z: mat.emissiveFactor[2]! };

    const add = (title: string) => {
      const folder = matTab.addFolder({ title });
      this._paneMatFolders[title] = folder;
      return folder;
    };

    const base = add('Base');
    base.addBinding(colors, 'baseColor', { ...colorOpts, label: 'base color' }).on('change', ev => {
      mat.baseColorFactor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });
    base.addBinding(mat, 'roughnessFactor', { ...f01, label: 'roughness' });
    base.addBinding(mat, 'metallicFactor',  { ...f01, label: 'metallic' });
    base.addBinding(mat, 'specularFactor',  { ...f01, label: 'specular' });
    base.addBinding(emission, 'x', { label: 'emission R', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emissiveFactor = [ev.value, emission.y, emission.z]; });
    base.addBinding(emission, 'y', { label: 'emission G', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emissiveFactor = [emission.x, ev.value, emission.z]; });
    base.addBinding(emission, 'z', { label: 'emission B', min: 0, max: 1e6, step: 0.1 }).on('change', ev => { mat.emissiveFactor = [emission.x, emission.y, ev.value]; });

    const anisotropy = add('Anisotropy');
    const anisoDir = { x: mat.anisotropyDirection[0]!, y: mat.anisotropyDirection[1]! };
    anisotropy.addBinding(mat, 'anisotropy', { step: 0.01, min: 0, max: 1 });
    anisotropy.addBinding(anisoDir, 'x', { label: 'direction X', step: 0.01, min: -1, max: 1 }).on('change', ev => { mat.anisotropyDirection = [ev.value, anisoDir.y, 0]; });
    anisotropy.addBinding(anisoDir, 'y', { label: 'direction Y', step: 0.01, min: -1, max: 1 }).on('change', ev => { mat.anisotropyDirection = [anisoDir.x, ev.value, 0]; });

    const transmission = add('Transmission');
    transmission.addBinding(mat, 'transmissionFactor',  { ...f01, label: 'transmission' });
    transmission.addBinding(mat, 'cutoutOpacity', f01);
    transmission.addBinding(mat, 'diffuseTransmissionFactor',  { ...f01, label: 'diffuse transmission' });
    transmission.addBinding(colors, 'diffuseTransmissionColor', { ...colorOpts, label: 'diffuse transmission color' }).on('change', ev => {
      mat.diffuseTransmissionColorFactor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const sheen = add('Sheen');
    sheen.addBinding(mat, 'sheenRoughnessFactor', { ...f01, label: 'roughness' });
    sheen.addBinding(colors, 'sheenColor', { ...colorOpts, label: 'color' }).on('change', ev => {
      mat.sheenColorFactor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const clearcoat = add('Clearcoat');
    clearcoat.addBinding(mat, 'clearcoatFactor', { ...f01, label: 'factor' });
    clearcoat.addBinding(mat, 'clearcoatRoughnessFactor', { ...f01, label: 'roughness' });

    const thinWalledState = { thinWalled: mat.thinWalled > 0 };
    const volume = add('Volume');
    volume.addBinding(thinWalledState, 'thinWalled').on('change', ev => { mat.thinWalled = ev.value ? 1 : 0; });
    volume.addBinding(mat, 'ior',               { min: 0, max: 3, step: 0.01 });
    volume.addBinding(mat, 'dispersion',        { min: 0, max: 1, step: 0.001 });
    volume.addBinding(mat, 'attenuationDistance',{ step: 0.00001, min: 0, max: 1e5 });
    volume.addBinding(colors, 'attenuationColor', colorOpts).on('change', ev => {
      mat.attenuationColor = [ev.value.r / 255, ev.value.g / 255, ev.value.b / 255];
    });

    const iridescence = add('Iridescence');
    iridescence.addBinding(mat, 'iridescenceFactor', { ...f01, label: 'factor' });
    iridescence.addBinding(mat, 'iridescenceIor', { min: 0, max: 3, step: 0.01 });
    iridescence.addBinding(mat, 'iridescenceThicknessMinimum', { min: 10, max: 1200, step: 1 });
    iridescence.addBinding(mat, 'iridescenceThicknessMaximum', { min: 10, max: 1200, step: 1 });

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

function createCameraRay(
  camera: {
    fov: number;
    near: number;
    matrixWorld: { elements: ArrayLike<number> };
    position: { x: number; y: number; z: number };
  },
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;
  const aspect = Math.max(1e-6, rect.width / Math.max(1, rect.height));
  const filmHeight = Math.tan(camera.fov * 0.5 * Math.PI / 180) * camera.near;

  const vx = x * aspect * filmHeight;
  const vy = y * filmHeight;
  const vz = -camera.near;
  const viewLen = Math.hypot(vx, vy, vz) || 1;
  const nx = vx / viewLen;
  const ny = vy / viewLen;
  const nz = vz / viewLen;
  const e = camera.matrixWorld.elements;
  const dx = e[0]! * nx + e[4]! * ny + e[8]! * nz;
  const dy = e[1]! * nx + e[5]! * ny + e[9]! * nz;
  const dz = e[2]! * nx + e[6]! * ny + e[10]! * nz;
  const dirLen = Math.hypot(dx, dy, dz) || 1;

  return {
    ox: camera.position.x,
    oy: camera.position.y,
    oz: camera.position.z,
    dx: dx / dirLen,
    dy: dy / dirLen,
    dz: dz / dirLen,
  };
}

function intersectRayTriangle(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number,
) {
  const e1x = bx - ax;
  const e1y = by - ay;
  const e1z = bz - az;
  const e2x = cx - ax;
  const e2y = cy - ay;
  const e2z = cz - az;

  const px = dy * e2z - dz * e2y;
  const py = dz * e2x - dx * e2z;
  const pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < PICK_EPSILON) return Number.POSITIVE_INFINITY;

  const invDet = 1 / det;
  const tx = ox - ax;
  const ty = oy - ay;
  const tz = oz - az;
  const u = (tx * px + ty * py + tz * pz) * invDet;
  if (u < 0 || u > 1) return Number.POSITIVE_INFINITY;

  const qx = ty * e1z - tz * e1y;
  const qy = tz * e1x - tx * e1z;
  const qz = tx * e1y - ty * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * invDet;
  if (v < 0 || u + v > 1) return Number.POSITIVE_INFINITY;

  const t = (e2x * qx + e2y * qy + e2z * qz) * invDet;
  return t > PICK_EPSILON ? t : Number.POSITIVE_INFINITY;
}

function buildOptions(labels: string[]): Record<string, string> {
  return Object.fromEntries([['', ''], ...labels.map(l => [l, l])]);
}

function parseMaterialProfile(value: string | null): MaterialProfile {
  return MATERIAL_PROFILES.includes(value as MaterialProfile) ? value as MaterialProfile : 'webgl-lean';
}

function formatNumber(value: number | undefined) {
  return Number.isFinite(value) ? Math.round(value!).toLocaleString('en-US') : 'n/a';
}

function formatMs(value: number | undefined) {
  return Number.isFinite(value) ? `${value!.toFixed(0)}ms` : 'n/a';
}

function formatMiB(value: number | undefined) {
  return Number.isFinite(value) ? `${(value! / (1024 * 1024)).toFixed(1)} MiB` : 'n/a';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]!));
}

function isEditingElement(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

new Demo();
