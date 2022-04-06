import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
type DebugMode = "None" | "Albedo" | "Metalness" | "Roughness" | "Normals" | "Tangents" | "Bitangents" | "Transparency" | "UV0" | "Clearcoat" | "IBL PDF" | "IBL CDF" | "Specular" | "SpecularTint" | "Fresnel_Schlick";
type TonemappingMode = "None" | "Reinhard" | "Cineon" | "AcesFilm";
type SheenMode = "Charlie" | "Ashikhmin";
type RenderMode = "PT" | "MISPTDL";
interface PathtracingRendererParameters {
    canvas?: HTMLCanvasElement;
    context?: WebGL2RenderingContext;
}
export class PathtracingRenderer {
    get exposure(): number;
    set exposure(val: number);
    debugModes: string[];
    get debugMode(): DebugMode;
    set debugMode(val: DebugMode);
    renderModes: string[];
    get renderMode(): RenderMode;
    set renderMode(val: RenderMode);
    tonemappingModes: string[];
    get tonemapping(): TonemappingMode;
    set tonemapping(val: TonemappingMode);
    sheenGModes: string[];
    get sheenG(): SheenMode;
    set sheenG(val: SheenMode);
    get maxBounces(): number;
    set maxBounces(val: number);
    get useIBL(): boolean;
    set useIBL(val: boolean);
    get showBackground(): boolean;
    set showBackground(val: boolean);
    get forceIBLEval(): boolean;
    set forceIBLEval(val: boolean);
    get enableGamma(): boolean;
    set enableGamma(val: boolean);
    get iblRotation(): number;
    set iblRotation(val: number);
    get iblSampling(): boolean;
    set iblSampling(val: boolean);
    get pixelRatio(): number;
    set pixelRatio(val: number);
    get backgroundColor(): number[];
    set backgroundColor(val: number[]);
    get rayEps(): number;
    set rayEps(val: number);
    constructor(parameters?: PathtracingRendererParameters);
    resetAccumulation(): void;
    resize(width: number, height: number): void;
    stopRendering(): void;
    render(camera: THREE.PerspectiveCamera, num_samples: number, frameFinishedCB: (frameCount: number) => void, renderingFinishedCB: () => void): void;
    setIBL(texture: any): void;
    setScene(scene: THREE.Group, gltf?: GLTF): Promise<void>;
}
export { PerspectiveCamera, Box3 } from 'three';
export const Loader: {
    loadSceneFromBlobs(files: [string, File][], autoscale: boolean): Promise<unknown>;
    loadIBL(ibl: string): Promise<unknown>;
    loadSceneFromUrl(url: string, autoscale: boolean): Promise<unknown>;
};
