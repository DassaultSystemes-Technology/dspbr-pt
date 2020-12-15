
import * as THREE from 'three';

export class ThreeRenderer {
  gl: any;
  canvas: any | undefined;

  ibl: THREE.Texture;
  pmremGenerator: THREE.PMREMGenerator;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement | undefined, renderPixelRatio:number = 1.0) {
    this.canvas = canvas !== undefined ? canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = this.canvas.getContext('webgl2');

    //THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, context: this.gl, powerPreference: "high-performance", alpha: true });
    this.renderer.setPixelRatio(1.0);
    this.renderer.setSize(canvas.width, canvas.height);
    // this.renderer.getContext().getExtension('EXT_color_buffer_float');
    this.renderer.extensions.get('EXT_color_buffer_float');
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this._renderer.toneMapping = THREE.NoToneMapping
    this.renderer.outputEncoding = THREE.GammaEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  render(camera: THREE.PerspectiveCamera, frameFinishedCB?) {
    this.renderer.render(this.scene, camera); 
  }

  resize(width: number, height: number) {
    this.renderer.setPixelRatio(1.0);
    this.renderer.setSize(width, height);
  }

  setIBL(texture) {
    // this.renderer.state.reset(); 
    if (this.ibl !== undefined) {
      this.ibl.dispose();
    }

    this.ibl = this.pmremGenerator.fromEquirectangular(texture).texture;

    this.scene.background = this.ibl;
    this.scene.environment = this.ibl;
  }

  setScene(scene, callback?) {
    // console.log("GL Renderer state before load:\n", this.renderer.info);
    this.scene = scene;
    if(callback !== undefined) {
      callback()
    }
    //scene.applyMatrix4(y_to_z_up);
  }

}