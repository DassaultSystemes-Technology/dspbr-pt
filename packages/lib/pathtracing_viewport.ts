import { loadIblFromBlob, loadIblFromUrl, type IblTextureLike } from './loaders/ibl_loader';
import {
  loadSceneFromBlobs,
  loadSceneFromUrl,
  type LoadedPathtracingScene,
  type LoadProgressCallback,
} from './loaders/scene_loader';
import {
  PathtracingRenderer,
  type PathtracingCamera,
  type PathtracingRendererDiagnostics,
  type PathtracingRendererParameters,
  type PathtracingRendererProgressCallback,
} from './renderer';
import { PathtracingSceneData } from './scene_data';

export type PathtracingViewportProgressCallback = LoadProgressCallback | PathtracingRendererProgressCallback;

export interface PathtracingViewportSettings {
  exposure?: number;
  toneMapping?: string;
  pixelRatio?: number;
  interactionPixelRatio?: number;
  maxBounces?: number;
  useIBL?: boolean;
  showBackground?: boolean;
  enableGamma?: boolean;
  enableFxaa?: boolean;
  iblRotationDegrees?: number;
  backgroundColor?: [number, number, number, number];
  rayEps?: number;
  clampThreshold?: number;
  tileResolution?: number;
  debugMode?: string;
}

export interface PathtracingViewportOptions extends PathtracingRendererParameters {
  canvas: HTMLCanvasElement;
  settings?: PathtracingViewportSettings;
}

export interface LookAtCameraOptions {
  position: Vec3Like;
  target: Vec3Like;
  up?: Vec3Like;
  fov?: number;
  near?: number;
}

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface PathtracingViewportEventMap {
  sceneLoaded: { scene: PathtracingSceneData; loaded?: LoadedPathtracingScene };
  sceneLoadFailed: { error: unknown };
  iblLoaded: { ibl: IblTextureLike };
  iblLoadFailed: { error: unknown };
  diagnosticsChanged: { diagnostics: PathtracingRendererDiagnostics };
  frameRendered: { frameCount: number };
  renderFinished: { frameCount: number };
}

type PathtracingViewportListener<T> = (event: T) => void;

class ViewportCamera implements PathtracingCamera {
  public fov: number;
  public near: number;
  public readonly position: Vec3Like = { x: 0, y: 0, z: 6 };
  public readonly matrixWorld = { elements: new Float32Array(16) };

  constructor(options?: Partial<LookAtCameraOptions>) {
    this.fov = options?.fov ?? 45;
    this.near = options?.near ?? 0.01;
    const position = options?.position ?? this.position;
    const target = options?.target ?? { x: 0, y: 0, z: 0 };
    this.setLookAt(position, target, options?.up);
  }

  public setLookAt(position: Vec3Like, target: Vec3Like, up: Vec3Like = { x: 0, y: 1, z: 0 }) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    const forward = normalize(sub(target, position), { x: 0, y: 0, z: -1 });
    const right = normalize(cross(forward, up), { x: 1, y: 0, z: 0 });
    const cameraUp = normalize(cross(right, forward), { x: 0, y: 1, z: 0 });
    const backward = scale(forward, -1);

    const e = this.matrixWorld.elements;
    e[0] = right.x;    e[4] = cameraUp.x;    e[8] = backward.x;    e[12] = position.x;
    e[1] = right.y;    e[5] = cameraUp.y;    e[9] = backward.y;    e[13] = position.y;
    e[2] = right.z;    e[6] = cameraUp.z;    e[10] = backward.z;   e[14] = position.z;
    e[3] = 0;          e[7] = 0;             e[11] = 0;            e[15] = 1;
  }
}

export class PathtracingViewport {
  public readonly canvas: HTMLCanvasElement;
  public readonly renderer: PathtracingRenderer;

  private readonly listeners = new Map<keyof PathtracingViewportEventMap, Set<PathtracingViewportListener<unknown>>>();
  private camera: PathtracingCamera | null = null;
  private running = false;
  private sampleLimit = -1;
  private pixelRatio = 1;
  private interactionPixelRatio = 0.5;
  private interactionActive = false;

  constructor(options: PathtracingViewportOptions) {
    this.canvas = options.canvas;
    this.renderer = new PathtracingRenderer({
      canvas: options.canvas,
      context: options.context,
    });
    this.camera = new ViewportCamera();
    if (options.settings) this.setSettings(options.settings);
  }

  public get diagnostics(): PathtracingRendererDiagnostics {
    return this.renderer.diagnostics;
  }

  public on<K extends keyof PathtracingViewportEventMap>(
    event: K,
    listener: PathtracingViewportListener<PathtracingViewportEventMap[K]>,
  ): () => void {
    let listeners = this.listeners.get(event);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(event, listeners);
    }
    listeners.add(listener as PathtracingViewportListener<unknown>);
    return () => this.off(event, listener);
  }

  public off<K extends keyof PathtracingViewportEventMap>(
    event: K,
    listener: PathtracingViewportListener<PathtracingViewportEventMap[K]>,
  ): void {
    this.listeners.get(event)?.delete(listener as PathtracingViewportListener<unknown>);
  }

  public setSettings(settings: PathtracingViewportSettings): void {
    if (settings.exposure !== undefined) this.renderer.exposure = settings.exposure;
    if (settings.toneMapping !== undefined) this.renderer.tonemapping = settings.toneMapping;
    if (settings.pixelRatio !== undefined) {
      this.pixelRatio = settings.pixelRatio;
      if (!this.interactionActive) this.renderer.pixelRatio = settings.pixelRatio;
    }
    if (settings.interactionPixelRatio !== undefined) {
      this.interactionPixelRatio = settings.interactionPixelRatio;
      if (this.interactionActive) this.renderer.pixelRatio = settings.interactionPixelRatio;
    }
    if (settings.maxBounces !== undefined) this.renderer.maxBounces = settings.maxBounces;
    if (settings.useIBL !== undefined) this.renderer.useIBL = settings.useIBL;
    if (settings.showBackground !== undefined) this.renderer.showBackground = settings.showBackground;
    if (settings.enableGamma !== undefined) this.renderer.enableGamma = settings.enableGamma;
    if (settings.enableFxaa !== undefined) this.renderer.enableFxaa = settings.enableFxaa;
    if (settings.iblRotationDegrees !== undefined) this.renderer.iblRotation = settings.iblRotationDegrees;
    if (settings.backgroundColor !== undefined) this.renderer.backgroundColor = settings.backgroundColor;
    if (settings.rayEps !== undefined) this.renderer.rayEps = settings.rayEps;
    if (settings.clampThreshold !== undefined) this.renderer.clampThreshold = settings.clampThreshold;
    if (settings.tileResolution !== undefined) this.renderer.tileRes = settings.tileResolution;
    if (settings.debugMode !== undefined) this.renderer.debugMode = settings.debugMode;
    this.emitDiagnostics();
  }

  public async loadSceneFromUrl(url: string, progress?: PathtracingViewportProgressCallback): Promise<LoadedPathtracingScene> {
    try {
      const loaded = await loadSceneFromUrl(url, progress);
      await this.setLoadedScene(loaded, progress);
      return loaded;
    } catch (error) {
      this.emit('sceneLoadFailed', { error });
      throw error;
    }
  }

  public async loadSceneFromFiles(files: [string, File][], progress?: PathtracingViewportProgressCallback): Promise<LoadedPathtracingScene> {
    try {
      const loaded = await loadSceneFromBlobs(files, progress);
      await this.setLoadedScene(loaded, progress);
      return loaded;
    } catch (error) {
      this.emit('sceneLoadFailed', { error });
      throw error;
    }
  }

  public async setLoadedScene(loaded: LoadedPathtracingScene, progress?: PathtracingViewportProgressCallback): Promise<void> {
    await this.renderer.setScene(loaded.scene, progress);
    this.renderer.diagnostics.profiling = {
      ...loaded.profile,
      ...this.renderer.diagnostics.profiling,
    };
    this.emit('sceneLoaded', { scene: loaded.scene, loaded });
    this.emitDiagnostics();
    if (this.running) this.start(this.sampleLimit);
  }

  public async setScene(scene: PathtracingSceneData, progress?: PathtracingViewportProgressCallback): Promise<void> {
    await this.renderer.setScene(scene, progress);
    this.emit('sceneLoaded', { scene });
    this.emitDiagnostics();
    if (this.running) this.start(this.sampleLimit);
  }

  public async loadIblFromUrl(url: string): Promise<IblTextureLike> {
    try {
      const ibl = await loadIblFromUrl(url);
      this.setIBL(ibl);
      this.emit('iblLoaded', { ibl });
      return ibl;
    } catch (error) {
      this.emit('iblLoadFailed', { error });
      throw error;
    }
  }

  public async loadIblFromBlob(blob: Blob): Promise<IblTextureLike> {
    try {
      const ibl = await loadIblFromBlob(blob);
      this.setIBL(ibl);
      this.emit('iblLoaded', { ibl });
      return ibl;
    } catch (error) {
      this.emit('iblLoadFailed', { error });
      throw error;
    }
  }

  public setIBL(ibl: IblTextureLike): void {
    this.renderer.setIBL(ibl);
    this.emitDiagnostics();
  }

  public setCamera(camera: PathtracingCamera): void {
    this.camera = camera;
    this.renderer.resetAccumulation();
    this.emitDiagnostics();
  }

  public setLookAtCamera(options: LookAtCameraOptions): void {
    const camera = this.camera instanceof ViewportCamera ? this.camera : new ViewportCamera();
    camera.fov = options.fov ?? camera.fov;
    camera.near = options.near ?? camera.near;
    camera.setLookAt(options.position, options.target, options.up);
    this.setCamera(camera);
  }

  public resize(width = this.canvas.clientWidth, height = this.canvas.clientHeight): void {
    this.canvas.width = Math.max(1, Math.floor(width));
    this.canvas.height = Math.max(1, Math.floor(height));
    this.renderer.resize(this.canvas.width, this.canvas.height);
    this.emitDiagnostics();
  }

  public start(sampleLimit = -1): void {
    if (!this.camera) throw new Error('Cannot start rendering without a camera.');
    this.running = true;
    this.sampleLimit = sampleLimit;
    this.renderer.render(
      this.camera,
      sampleLimit,
      () => this.emitDiagnostics(),
      frameCount => {
        this.emit('frameRendered', { frameCount });
        this.emitDiagnostics();
      },
      () => {
        this.running = false;
        this.emit('renderFinished', { frameCount: this.renderer.diagnostics.sampleCount });
        this.emitDiagnostics();
      },
    );
  }

  public stop(): void {
    this.running = false;
    this.renderer.stopRendering();
    this.emitDiagnostics();
  }

  public resetAccumulation(): void {
    this.renderer.resetAccumulation();
    this.emitDiagnostics();
  }

  public setInteractionMode(active: boolean): void {
    this.interactionActive = active;
    this.renderer.pixelRatio = active ? this.interactionPixelRatio : this.pixelRatio;
    this.renderer.setInteractionMode(active);
    this.emitDiagnostics();
  }

  public dispose(): void {
    this.stop();
    this.listeners.clear();
  }

  private emit<K extends keyof PathtracingViewportEventMap>(event: K, payload: PathtracingViewportEventMap[K]): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    for (const listener of listeners) {
      listener(payload);
    }
  }

  private emitDiagnostics(): void {
    this.emit('diagnosticsChanged', { diagnostics: this.renderer.diagnostics });
  }
}

function sub(a: Vec3Like, b: Vec3Like): Vec3Like {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v: Vec3Like, scalar: number): Vec3Like {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}

function cross(a: Vec3Like, b: Vec3Like): Vec3Like {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(v: Vec3Like, fallback: Vec3Like): Vec3Like {
  const length = Math.hypot(v.x, v.y, v.z);
  if (length <= 1e-10) return { ...fallback };
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

export function createPathtracingViewport(options: PathtracingViewportOptions): PathtracingViewport {
  return new PathtracingViewport(options);
}
