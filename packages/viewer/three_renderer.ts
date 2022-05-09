
import * as THREE from 'three';

export class ThreeRenderer {
  private gl: any;
  private canvas: any | undefined;

  private ibl?: THREE.Texture;
  private pmremGenerator: THREE.PMREMGenerator;
  private scene?: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private isRendering = false;

  private dirty = false;

  public set exposure(val: number) {
    this.renderer.toneMappingExposure = val;
    this.setBackground();
  }
  public get exposure() {
    return this.renderer.toneMappingExposure;
  }

  private tonemappingModes = new Map<string, THREE.ToneMapping>([
    ["None", THREE.LinearToneMapping],
    ["Reinhard", THREE.ReinhardToneMapping],
    ["Cineon", THREE.CineonToneMapping],
    ["AcesFilm", THREE.ACESFilmicToneMapping]
  ]);

  set tonemapping(val: string) {
    if(this.tonemappingModes.has(val)) {
      this.renderer.toneMapping = this.tonemappingModes.get(val)!;
      this.dirty = true;
    }
  }

  private _backgroundColor = [0.0, 0.0, 0.0];
  public get backgroundColor() {
    return this._backgroundColor;
  }
  public set backgroundColor(val) {
    this._backgroundColor = val;
    this.setBackground();
  }

  private _showBackground = true;
  public get showBackground() {
    return this._showBackground;
  }
  public set showBackground(val) {
    this._showBackground = val;
    this.setBackground();
  }

  private setBackground() {
    if (!this.scene) {
      return;
    }
    if(this._showBackground) {
      this.scene.background = this.ibl!;
    }
    else {
      this.scene.background = new THREE.Color(
        this._backgroundColor[0] * this.renderer.toneMappingExposure,
        this._backgroundColor[1] * this.renderer.toneMappingExposure,
        this._backgroundColor[2] * this.renderer.toneMappingExposure);
    }
  }

  useIBL(flag: boolean) {
    if (!this.scene) {
      return;
    }
    if (flag) {
      this.scene!.environment = this.ibl!;
      this.showBackground = true ;
    } else {
      this.scene.environment = null;
      this.showBackground = false ;
    }
  }

  setPixelRatio(val: number) {
    this.renderer.setPixelRatio(val);
  }

  constructor(parameters?: THREE.WebGLRendererParameters) {
    this.renderer = new THREE.WebGLRenderer(parameters);
    // this.renderer.setSize(canvas.width, canvas.height);'
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  stopRendering() {
    this.isRendering = false;
  }

  render(camera: THREE.PerspectiveCamera, frameFinishedCB?: Function) {
    if (camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }
    this.isRendering = true;

    let renderFrame = () => {
      if (!this.isRendering) {
        return;
      }

      if(this.dirty) {
        this.renderer.compile(this.scene!, camera);
        this.dirty = false;
      }

      this.renderer.render(this.scene!, camera);
      if (frameFinishedCB) {
        frameFinishedCB();
      }
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame); // start render loop
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  private updateSceneIbl() {
    if(!this.scene || !this.ibl) return;
    this.scene.background = this.ibl;
    this.scene.environment  = this.ibl;
  }

  setIBL(tex: any) {
    if (this.ibl !== undefined) {
      this.ibl.dispose();
    }

    this.ibl = this.pmremGenerator.fromEquirectangular(tex).texture;

    this.updateSceneIbl();
  }

  setScene(scene: THREE.Scene) {
    this.scene = scene;
    this.updateSceneIbl();
  }

}