
import * as THREE from 'three';

export class ThreeRenderer {
  private gl: any;
  private canvas: any | undefined;

  private ibl: THREE.Texture;
  private pmremGenerator: THREE.PMREMGenerator;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private isRendering = false;

  public set exposure(val) {
    this.renderer.toneMappingExposure = val;
  }
  public get exposure() {
    return this.renderer.toneMappingExposure;
  }

  showBackground(flag) {
    if (!flag) {
      this.scene.background = new THREE.Color(0, 0, 0);
    } else {
      this.scene.background = this.ibl;
    }
  }

  public useIBL(val) {
    if (val) {
      this.scene.environment = this.ibl;
    } else {
      this.scene.environment = null;
    }
  }
 
  constructor(canvas: HTMLCanvasElement | undefined, pixelRatio: number = 1.0) {
    this.canvas = canvas !== undefined ? canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = this.canvas.getContext('webgl2');

    //THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, context: this.gl, powerPreference: "high-performance", alpha: true });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.extensions.get('EXT_color_buffer_float');
    this.renderer.extensions.get('EXT_color_buffer_half_float');
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    // this.renderer.toneMapping = THREE.NoToneMapping
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.outputEncoding = THREE.GammaEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  stopRendering() {
    this.isRendering = false;
  }

  render(camera: THREE.PerspectiveCamera, frameFinishedCB?) {
    if (camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }
    this.isRendering = true;

    let _this = this;
    let renderFrame = () => {
      if (!_this.isRendering) {
        return;
      }

      this.renderer.render(_this.scene, camera);

      if (frameFinishedCB !== undefined)
        frameFinishedCB();
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame); // start render loop
  }

  resize(width: number, height: number) {
    // this.renderer.setPixelRatio(1.0);
    this.renderer.setSize(width, height);
  }

  setIBL(texture) {
    if (this.ibl !== undefined) {
      this.ibl.dispose();
    }

    this.ibl = this.pmremGenerator.fromEquirectangular(texture).texture;

    this.scene.background = this.ibl;
    this.scene.environment  = this.ibl;
  }

  setScene(scene) {
    // console.log("GL Renderer state before load:\n", this.renderer.info);
    this.scene = scene;
    //scene.applyMatrix4(y_to_z_up);
  }

}