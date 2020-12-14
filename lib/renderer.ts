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

import * as THREE from 'three';
import * as glu from './gl_utils';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimpleTriangleBVH } from './bvh.js';

var fileLoader = new THREE.FileLoader();
function filePromiseLoader(url, onProgress?) {
  return new Promise<string>((resolve, reject) => {
    fileLoader.load(url, resolve, onProgress, reject);
  });
}

function flattenArray(arr, result = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flattenArray(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};

function cleanupScene(scene) {
  console.log('Cleaning up scene data...!')

  const cleanMaterial = material => {
    console.log('dispose material!')
    material.dispose()

    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && 'minFilter' in value) {
        console.log('dispose texture!')
        value.dispose()
      }
    }
  };

  scene.traverse(object => {
    if (!object.isMesh) return

    console.log('dispose geometry!')
    object.geometry.dispose()

    if (object.material.isMaterial) {
      cleanMaterial(object.material)
    } else {
      // an array of materials
      for (const material of object.material) cleanMaterial(material)
    }
  });
}

type DebugMode = "None" | "Albedo" | "Metalness" | "Roughness" | "Normals" | "Tangents" | "Bitangents" | "Transparency" | "UV0";

class MaterialData {
  albedo = [1.0, 1.0, 1.0];
  metallic = 0.0;

  roughness = 0.0;
  anisotropy = 0.0;
  anisotropyRotation = 0.0;
  transparency = 0.0;

  cutoutOpacity = 1.0;
  sheen = 0.0;
  normalScale = 1.0;
  ior = 1.5;

  specular = 1.0;
  specularTint = [1.0, 1.0, 1.0];

  sheenRoughness = 0.0;
  sheenColor = [1.0, 1.0, 1.0];

  normalScaleClearcoat = 1.0;
  emission = [0.0, 0.0, 0.0];

  clearcoat = 0.0;
  clearcoatRoughness = 0.0;
  flakeCoverage = 0.0;
  flakeSize = 0.02;

  flakeRoughness = 0.2;
  flakeColor = [1.0, 1.0, 1.0];

  attenuationDistance = 100000.0;
  attenuationColor = [1.0, 1.0, 1.0];

  subsurfaceColor = [1.0, 1.0, 1.0];
  thinWalled = 0;

  translucency = 0.0;
  alphaCutoff = 0.0;
  padding = [0.0, 0.0];
}

class TexInfo {
  texArrayIdx = -1;
  texIdx = -1;
  texCoordSet = -1;
  pad = -1;
  texOffset = [0, 0]; // TODO: Where to put these? Removing them here allows to use byte type for texInfoArray.
  texScale = [1, 1];
}

class MaterialTextureInfo {
  albedoMap = new TexInfo;
  metallicRoughnessMap = new TexInfo();
  normalMap = new TexInfo();
  emissionMap = new TexInfo();
  specularMap = new TexInfo();
}

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}

let clock = new THREE.Clock();

export class PathtracingRenderer {
  gl: any;
  canvas: any | undefined;
  controls: OrbitControls;

  // three resources
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  boundingBox: THREE.Box3;
  pmremGenerator: THREE.PMREMGenerator;
  glCubeIBL: any;
  texArrayList: any[] = [];
  texArrayDict: { [idx: string]: any; } = {};

  // pt gl resources
  quadCamera: any;
  content: any | null;


  iblTexture: WebGLTexture;
  renderBuffer: WebGLTexture;
  copyBuffer: WebGLTexture;
  copyFbo: WebGLFramebuffer;
  fbo: WebGLFramebuffer;
  quadVao: WebGLVertexArrayObject;
  ptProgram: WebGLProgram;
  copyProgram: WebGLProgram;
  displayProgram: WebGLProgram;
  quadVertexBuffer: WebGLBuffer;

  pathtracingDataTextures = {};
  pathtracingTexturesArrays = {};

  renderRes: [number, number];
  displayRes: [number, number];

  // settings 
  exposure = 1.0;
  frameCount = 1;
  sceneScaleFactor = 1.0;
  isRendering = false;
  usePathtracing = true;
  debugMode: DebugMode = "None";
  maxBounceDepth = 4;
  useIBL = false;
  disableBackground = false;
  autoScaleOnImport = true;
  pixelRatio = 0.5; // this serves as a multiplier to the devcice pixel ratio, which might be > 1 for e.g. retiana displays
  autoRotate = false;
  forceIBLEvalOnLastBounce = false;
  useControls = true;

  debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents", "Transparency", "UV0"];


  //   //var y_to_z_up = new THREE.Matrix4().makeRotationX(-Math.PI *0.5);

  constructor(canvas: any | undefined, useControls: any | undefined) {
    // console.time("Init Pathtracing Renderer");
    this.canvas = canvas !== undefined ? canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = this.canvas.getContext('webgl2');
    this.useControls = useControls;

    this.scene = new THREE.Scene();
    this.initRenderer();
  }

  reset() {
    // THREE.Cache.clear();

    this.texArrayDict = {};

    for (let ta in this.texArrayList) {
      for (let t in this.texArrayList[ta]) {
        this.texArrayList[ta][t].dispose();
      }
    }

    this.texArrayList = [];

    if (this.content) {
      this.scene.remove(this.content);
      cleanupScene(this.content);
    }  
  }

  getContext() {
    return this.gl;
  }

  getGLRenderer() {
    return this.renderer;
  };

  resetAccumulation() {
    this.frameCount = 1;
    // console.log("Reset Accumulation");
  }

  setPixelRatio(ratio) {
    this.pixelRatio = ratio;
    this.resize(window.innerWidth, window.innerHeight);
  }

  setExposure(value) {
    this.exposure = value;
    this.renderer.toneMappingExposure = value;
  }

  setMaxBounceDepth(value) {
    this.maxBounceDepth = value;
    this.resetAccumulation();
  }

  setUsePathtracing(flag) {
    this.usePathtracing = flag;

    if (flag === false) {
      this.renderer.state.reset();
    }
    this.resetAccumulation();
  }

  setAutoScaleOnImport(flag) {
    this.autoScaleOnImport = flag;
  }

  setForceIBLEvalOnLastBounce(flag) {
    this.forceIBLEvalOnLastBounce = flag;
    this.resetAccumulation();
  }

  enableAutoRotate(flag) {
    if (this.controls) {
      this.controls.autoRotate = flag;
      this.resetAccumulation();
    }
  }

  setDisableBackground(flag) {
    this.disableBackground = flag
    if (!flag) {
      this.scene.background = this.glCubeIBL;
    } else {
      this.scene.background = new THREE.Color(0x000000);
    }
    this.resetAccumulation();
  }

  setDebugMode(mode) {
    this.debugMode = mode;
    this.resetAccumulation();
  }

  setUseIBL(flag) {
    this.useIBL = flag;

    if (!flag) {
      this.scene.environment = undefined;
    } else {
      this.scene.environment = this.glCubeIBL;
    }

    this.resetAccumulation();
  }

  resize(width, height) {
    this.isRendering = false;

    const renderPixelRatio = this.pixelRatio * window.devicePixelRatio;
    this.renderRes = [Math.floor(window.innerWidth * renderPixelRatio),
    Math.floor(window.innerHeight * renderPixelRatio)];
    this.displayRes = [Math.floor(window.innerWidth), Math.floor(window.innerHeight)];

    this.renderer.setPixelRatio(renderPixelRatio);
    this.renderer.setSize(this.displayRes[0], this.displayRes[1]);

    this.initFramebuffers(this.renderRes[0], this.renderRes[1]);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.resetAccumulation();
    this.isRendering = true;
  }

  getCamera() {
    return this.camera;
  }

  setLookAt(from, at, up) {
    this.camera.position.set(from[0] * this.sceneScaleFactor, from[1] * this.sceneScaleFactor, from[2] * this.sceneScaleFactor);
    this.camera.up.set(up[0], up[1], up[2]);
    this.camera.lookAt(at[0] * this.sceneScaleFactor, at[1] * this.sceneScaleFactor, at[2] * this.sceneScaleFactor);
    this.camera.updateMatrixWorld();
    if (this.controls) this.controls.update();
  }

  setPerspective(vFov, near, far) {
    this.camera.fov = vFov;
    this.camera.near = near;
    this.camera.far = far;
    this.camera.updateProjectionMatrix();
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  centerView() {
    if (this.controls) { // Todo: implement on camera, no controls needed for this
      let center = new THREE.Vector3();
      this.boundingBox.getCenter(center);
      this.controls.target = center;
      this.controls.update();
      this.resetAccumulation();
    }
  }

  stopRendering() {
    this.isRendering = false;
  };

  render(num_samples, frameFinishedCB, renderingFinishedCB) {
    if (this.camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }

    this.isRendering = true;
    this.resetAccumulation();

    let _this = this;
    let renderFrame = function () {
      if (!_this.isRendering || _this.renderer === undefined)
        return;

      if (_this.controls)
        _this.controls.update();

      if (_this.usePathtracing) {
        let gl = _this.gl;
        gl.useProgram(_this.ptProgram);

        let numTextureSlots = 0;
        for (let t in _this.pathtracingDataTextures) {
          gl.activeTexture(gl.TEXTURE0 + numTextureSlots++);
          gl.bindTexture(gl.TEXTURE_2D, _this.pathtracingDataTextures[t]);
        }
        for (let t in _this.pathtracingTexturesArrays) {
          gl.activeTexture(gl.TEXTURE0 + numTextureSlots++);
          gl.bindTexture(gl.TEXTURE_2D_ARRAY, _this.pathtracingTexturesArrays[t]);
        }

        gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
        gl.bindTexture(gl.TEXTURE_2D, _this.iblTexture);
        let loc = gl.getUniformLocation(_this.ptProgram, "u_samplerCube_EnvMap");
        gl.uniform1i(loc, numTextureSlots++);

        gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
        gl.bindTexture(gl.TEXTURE_2D, _this.copyBuffer);
        loc = gl.getUniformLocation(_this.ptProgram, "u_sampler2D_PreviousTexture");
        gl.uniform1i(loc, numTextureSlots);

        loc = gl.getUniformLocation(_this.ptProgram, "u_mat4_ViewMatrix");
        gl.uniformMatrix4fv(loc, false, new Float32Array(_this.camera.matrixWorld.elements));
        loc = gl.getUniformLocation(_this.ptProgram, "u_vec3_CameraPosition");
        gl.uniform3f(loc, _this.camera.position.x, _this.camera.position.y, _this.camera.position.z);
        loc = gl.getUniformLocation(_this.ptProgram, "u_int_FrameCount");
        gl.uniform1i(loc, _this.frameCount);
        loc = gl.getUniformLocation(_this.ptProgram, "u_int_MaxTextureSize");
        gl.uniform1ui(loc, glu.getMaxTextureSize(gl));
        loc = gl.getUniformLocation(_this.ptProgram, "u_int_DebugMode");
        gl.uniform1i(loc, _this.debugModes.indexOf(_this.debugMode));
        loc = gl.getUniformLocation(_this.ptProgram, "u_bool_UseIBL");
        gl.uniform1i(loc, _this.useIBL);
        loc = gl.getUniformLocation(_this.ptProgram, "u_bool_DisableBackground");
        gl.uniform1i(loc, _this.disableBackground);
        loc = gl.getUniformLocation(_this.ptProgram, "u_int_MaxBounceDepth");
        gl.uniform1i(loc, _this.maxBounceDepth);
        loc = gl.getUniformLocation(_this.ptProgram, "u_vec2_InverseResolution");
        gl.uniform2f(loc, 1.0 / _this.renderRes[0], 1.0 / _this.renderRes[1]);
        let filmHeight = Math.tan(_this.camera.fov * 0.5 * Math.PI / 180.0) * _this.camera.near;
        loc = gl.getUniformLocation(_this.ptProgram, "u_float_FilmHeight");
        gl.uniform1f(loc, filmHeight);
        loc = gl.getUniformLocation(_this.ptProgram, "u_float_FocalLength");
        gl.uniform1f(loc, _this.camera.near);
        loc = gl.getUniformLocation(_this.ptProgram, "u_bool_forceIBLEvalOnLastBounce");
        gl.uniform1i(loc, _this.forceIBLEvalOnLastBounce);

        //if (_this.debugMode !== "None") {
        gl.bindVertexArray(_this.quadVao);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        // pathtracing render pass
        gl.bindFramebuffer(gl.FRAMEBUFFER, _this.fbo);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.viewport(0, 0, _this.renderRes[0], _this.renderRes[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(null);

        // copy pathtracing render buffer 
        // to be used as accumulation input for next frames raytracing pass
        gl.useProgram(_this.copyProgram);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, _this.copyFbo);
        gl.viewport(0, 0, _this.renderRes[0], _this.renderRes[1]);
        gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
        gl.bindTexture(gl.TEXTURE_2D, _this.renderBuffer);
        gl.uniform1i(gl.getUniformLocation(_this.copyProgram, "tex"), numTextureSlots);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        // display render pass
        gl.useProgram(_this.displayProgram);
        gl.viewport(0, 0, _this.renderRes[0], _this.renderRes[1]);
        gl.uniform1i(gl.getUniformLocation(_this.displayProgram, "tex"), numTextureSlots);
        gl.uniform1f(gl.getUniformLocation(_this.displayProgram, "exposure"), _this.exposure);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(null);
        gl.bindVertexArray(null);

      } else {
        _this.renderer.render(_this.scene, _this.camera); // render GL view
      }

      _this.frameCount++;

      if (num_samples !== -1 && _this.frameCount >= num_samples) {
        renderingFinishedCB(); // finished rendering num_samples
        _this.isRendering = false;
      }

      frameFinishedCB(_this.frameCount);
      requestAnimationFrame(renderFrame); // num_samples == -1 || _frameCount < num_samples
    };

    requestAnimationFrame(renderFrame); // start render loop
  }

  private initFramebuffers(width: number, height: number) {
    const gl = this.gl;
    if (this.fbo !== undefined) {
      gl.deleteFramebuffer(this.fbo);
      gl.deleteFramebuffer(this.copyFbo);
    }
    if (this.renderBuffer !== undefined) {
      gl.deleteTexture(this.renderBuffer);
      gl.deleteTexture(this.copyBuffer);
    }

    this.renderBuffer = glu.createRenderBufferTexture(gl, null, width, height);
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderBuffer, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);

    this.copyBuffer = glu.createRenderBufferTexture(gl, null, width, height);
    this.copyFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.copyBuffer, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private initRenderer() {
    const renderPixelRatio = this.pixelRatio * window.devicePixelRatio;
    this.renderRes = [Math.floor(window.innerWidth * renderPixelRatio),
    Math.floor(window.innerHeight * renderPixelRatio)];
    this.displayRes = [Math.floor(window.innerWidth), Math.floor(window.innerHeight)];

    //THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, context: this.gl, powerPreference: "high-performance", alpha: true });
    this.renderer.setPixelRatio(renderPixelRatio);
    this.renderer.setSize(this.displayRes[0], this.displayRes[1]);
    // this.renderer.getContext().getExtension('EXT_color_buffer_float');
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this._renderer.toneMapping = THREE.NoToneMapping  
    this.renderer.outputEncoding = THREE.GammaEncoding;
    this.renderer.physicallyCorrectLights = true;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    let aspect = this.displayRes[0] / this.displayRes[1];
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);
    this.camera.position.set(0, 0, 3);

    if (this.useControls) {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.controls.screenSpacePanning = true;

      let _this = this;
      this.controls.addEventListener('change', () => {
        _this.resetAccumulation();
      });

      let tmpPixelRatio;
      this.controls.addEventListener('start', () => {
          if (_this.usePathtracing) {
            tmpPixelRatio = _this.pixelRatio;
            _this.setPixelRatio(0.2);
          }
        });

      this.controls.addEventListener('end', () => {
        if (_this.usePathtracing)
          _this.setPixelRatio(tmpPixelRatio);
      });

      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      }
    }

    // console.timeEnd("Init Pathtracing Renderer");

    let gl = this.gl;
    // glu.printGLInfo(gl);

    this.initFramebuffers(this.renderRes[0], this.renderRes[1]);

    let vertexShader = ` #version 300 es
      layout(location = 0) in vec4 position;
      out vec2 uv;

      void main()
      {
        uv = (position.xy + vec2(1.0)) * 0.5;
        gl_Position = position;
      }`;

    let copyFragmentShader = `#version 300 es
      precision highp float;
      precision highp int;
      precision highp sampler2D;

      uniform sampler2D tex;
      in vec2 uv;
      out vec4 out_FragColor;

      void main()
      {
        // out_FragColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);
        out_FragColor = texture(tex, uv);
      }`;

    let displayFragmentShader = `#version 300 es
      precision highp float;
      precision highp int;
      precision highp sampler2D;

      uniform sampler2D tex;
      uniform float exposure;
      // uniform vec3 whitePoint;

      in vec2 uv;
      out vec4 out_FragColor;

     #ifndef saturate
       #define saturate(a) clamp( a, 0.0, 1.0 )
     #endif
   
      // exposure only
      vec3 LinearToneMapping( vec3 color ) {
        return exposure * color;
      }

      vec3 ReinhardToneMapping( vec3 color ) {
        color *= exposure;
        return saturate( color / ( vec3( 1.0 ) + color ) );
      }

      // #define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
      // vec3 Uncharted2ToneMapping( vec3 color ) {
      //   // John Hable's filmic operator from Uncharted 2 video game
      //   color *= exposure;
      //   return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( whitePoint ) ) );

      // }

      vec3 OptimizedCineonToneMapping( vec3 color ) {
        // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
        color *= exposure;
        color = max( vec3( 0.0 ), color - 0.004 );
        return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
      }

      vec3 AcesFilm(vec3 color) {
        color *= exposure;
        return saturate( ( color * ( 2.51 * color + 0.03 ) ) / ( color * ( 2.43 * color + 0.59 ) + 0.14 ) );
      }

      void main()
      {
        //vec3 color = texture(tex, uv).xyz;
        vec3 color = texelFetch(tex, ivec2(gl_FragCoord.xy), 0).xyz;
        color = AcesFilm(color);
        color = pow(color, vec3(1.0/2.2));
        out_FragColor = vec4(color, 1.0);
      }`; 

    this.copyProgram = glu.createProgramFromSource(gl, vertexShader, copyFragmentShader);
    this.displayProgram = glu.createProgramFromSource(gl, vertexShader, displayFragmentShader);

    // fullscreen quad position buffer
    const positions = new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      1.0, 1.0
    ]);
    this.quadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // fullscreen quad vao
    this.quadVao = gl.createVertexArray();
    gl.bindVertexArray(this.quadVao);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  findTextureInList(tex, texList) {
    for (let i = 0; i < texList.length; i++) {
      if (tex.image.src === texList[i].image.src)
        return i;
    }

    return -1;
  }

  private parseTexture(tex) {
    let texInfo = new TexInfo();

    let res = [tex.image.width, tex.image.height].join(',');
    if (res in this._texArrayDict) {
      let texArrayIdx = this._texArrayDict[res];
      let texIdxInArray = this.findTextureInList(tex, this._texArrayList[texArrayIdx]);
      if (texIdxInArray < 0) {
        this._texArrayList[texArrayIdx].push(tex);
        texIdxInArray = this._texArrayList[texArrayIdx].length - 1;
      }
      texInfo.texArrayIdx = texArrayIdx;
      texInfo.texIdx = texIdxInArray;
    } else {
      this._texArrayDict[res] = this._texArrayList.length;
      let tex_array = [tex];
      this._texArrayList.push(tex_array);
      texInfo.texArrayIdx = this._texArrayList.length - 1;
      texInfo.texIdx = 0;
    }

    texInfo.texOffset = [tex.offset.x, tex.offset.y];
    texInfo.texScale = [tex.repeat.x, tex.repeat.y];

    texInfo.texCoordSet = 0; // TODO Handle second uv set
    return texInfo;
  }


  private parseMaterial(mat: THREE.MeshStandardMaterial, materialBuffer: any[], materialTextureInfoBuffer: any[]) {
    let matInfo = new MaterialData();
    let matTexInfo = new MaterialTextureInfo();

    matInfo.albedo = mat.color.toArray();

    if (mat.map) {
      matTexInfo.albedoMap = this.parseTexture(mat.map);
    }

    matInfo.metallic = mat.metalness || 0;
    matInfo.roughness = mat.roughness || 0;

    matInfo.cutoutOpacity = mat.opacity;
    matInfo.alphaCutoff = mat.alphaTest;
    if (mat.alphaTest == 0.0 && !mat.transparent)
      matInfo.alphaCutoff = 1.0;

    if (mat.metalnessMap) {
      matTexInfo.metallicRoughnessMap = this.parseTexture(mat.metalnessMap);
    }

    if (mat.normalMap) {
      matTexInfo.normalMap = this.parseTexture(mat.normalMap);
      matInfo.normalScale = mat.normalScale.x;
    }

    if (mat.emissiveMap) {
      matTexInfo.emissionMap = this.parseTexture(mat.emissiveMap);
      matInfo.emission = mat.emissive.toArray();
    }

    if ("gltfExtensions" in mat.userData) {

      let get_param = function (name, obj, default_value) {
        return (name in obj) ? obj[name] : default_value;
      };

      let extensions = mat.userData.gltfExtensions;

      if ('3DS_materials_anisotropy' in extensions) {
        let ext = extensions["3DS_materials_anisotropy"];
        matInfo.anisotropy = get_param("anisotropyFactor", ext, matInfo.anisotropy);
        matInfo.anisotropyRotation = get_param("anisotropyRotationFactor", ext, matInfo.anisotropyRotation);
      }
      if ('KHR_materials_anisotropy' in extensions) {
        let ext = extensions["KHR_materials_anisotropy"];
        matInfo.anisotropy = get_param("anisotropyFactor", ext, matInfo.anisotropy);
        matInfo.anisotropyRotation = get_param("anisotropyRotationFactor", ext, matInfo.anisotropyRotation);
      }
      if ('KHR_materials_transmission' in extensions) {
        let ext = extensions["KHR_materials_transmission"];
        matInfo.transparency = get_param("transmissionFactor", ext, matInfo.transparency);
      }
      if ('KHR_materials_specular' in extensions) {
        let ext = extensions["KHR_materials_specular"];
        matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
        matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
      }
      if ('KHR_materials_ior' in extensions) {
        matInfo.ior = get_param("ior", extensions["KHR_materials_ior"], matInfo.ior);
      }
      if ('KHR_materials_clearcoat' in extensions) {
        let ext = extensions["KHR_materials_clearcoat"];
        matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
        matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
      }
      if ('KHR_materials_sheen' in extensions) {
        let ext = extensions["3DS_materials_sheen"];
        matInfo.sheen = get_param("sheenFactor", ext, matInfo.sheen);
        matInfo.sheenColor = get_param("sheenColorFactor", ext, matInfo.sheenColor);
        matInfo.sheenRoughness = get_param("sheenRoughnessFactor", ext, matInfo.sheenRoughness);
      }
    }

    materialBuffer.push(Object.values(matInfo));
    materialTextureInfoBuffer.push(Object.values(matTexInfo));
  }

  loadSceneFromBlobs(fileList, callback) {
    var manager = new THREE.LoadingManager();

    let blobs = {};
    for (var i = 0; i < fileList.length; i++) {
      let name = fileList[i].name;
      if (getFileExtension(fileList[i].name) !== "gltf" &&
        getFileExtension(fileList[i].name) !== "glb") {
        name = "./" + name;
      }

      blobs[name] = fileList[i];
    }

    // Initialize loading manager with URL callback.
    var objectURLs = [];
    manager.setURLModifier((url) => {
      if (url.startsWith("blob"))
        return url;

      console.log("Parsing blob resource: " + url);
      url = URL.createObjectURL(blobs[url]);
      objectURLs.push(url);
      return url;
    });

    function getFileExtension(filename) {
      return filename.split('.').pop();
    }

    for (var i = 0; i < fileList.length; i++) {
      if (getFileExtension(fileList[i].name) === "gltf" ||
        getFileExtension(fileList[i].name) === "glb")
        this.loadScene(fileList[i].name, callback, manager);
    }
  }

  loadIBL(ibl, callback) {
    let _this = this;
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .load(ibl, function (texture) {
        this.renderer.state.reset(); // three IBL replacement won't work when state is not configured properly

        if (this._glCubeIBL !== undefined) {
          this._glCubeIBL.dispose();
        }
        _this.glCubeIBL = _this.pmremGenerator.fromEquirectangular(texture).texture;
             
        _this.scene.background = _this.glCubeIBL;
        _this.scene.environment = _this.glCubeIBL;

        let gl = _this.gl;
        if (_this.iblTexture !== undefined)
          _this.gl.deleteTexture(_this.iblTexture);

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        _this.iblTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, _this.iblTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, texture.image.width, texture.image.height,
          0, gl.RGB, gl.FLOAT, texture.image.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        _this.resetAccumulation();

        if (callback) {
          callback();
        }
      }.bind(_this));
  }

  loadScene(scene_path, callback, manager) {
    this.stopRendering();
    this.reset();

    // console.log("GL Renderer state before load:\n", this.renderer.info);

    let _this = this;
    var loader = new GLTFLoader(manager);
    loader.load(scene_path, function (gltf) {

      const scene = gltf.scene || gltf.scenes[0];

      if (!scene) {
        // Valid, but not supported by this viewer.
        throw new Error(
          'This model contains no scene, and cannot be viewed here. However,'
          + ' it may contain individual 3D resources.'
        );
      }

      var bbox = new THREE.Box3().setFromObject(scene);
      const minValue = Math.min(bbox.min.x, Math.min(bbox.min.y, bbox.min.z));
      const maxValue = Math.max(bbox.max.x, Math.max(bbox.max.y, bbox.max.z));
      const deltaValue = maxValue - minValue;
      _this.sceneScaleFactor = 1.0 / deltaValue;
      // Normalize scene dimensions (needed for easy rt precision control) 
      if (_this.autoScaleOnImport) {
        scene.scale.set(_this.sceneScaleFactor, _this.sceneScaleFactor, _this.sceneScaleFactor);
      }

      //scene.matrixAutoUpdate = false;
      scene.updateMatrixWorld()

      // we need a clone where we disconnect geometry refs (see below)
      _this.content = scene.clone();

      _this.scene.add(_this.content);
      //scene.applyMatrix4(y_to_z_up);

      // Break reference of geometry nodes in scene copy
      // we need this because the transforms will baked into geo for path-tracing
      // whereas gl renderer is resolving transforms on pre-render
      _this.scene.traverse((node) => {
        if ((<THREE.Mesh>node).isMesh) {
          let meshNode = (<THREE.Mesh>node);
          meshNode.geometry = meshNode.geometry.clone();
        }
      });

      _this.createPathTracingScene(scene).then(() => {
        _this.resetAccumulation();

        scene.traverse((node) => {
          if ((<THREE.Mesh>node).isMesh) {
            (<THREE.Mesh>node).geometry.dispose();
          }
        });
        callback();
      });
    });
  };

  // Initializes all necessary pathtracing related data structures from three scene
  private async createPathTracingScene(scene) {
    this.boundingBox = new THREE.Box3().setFromObject(scene);

    console.time("Parsing scene data");

    //if (meshGroup.scene)
    //    meshGroup = meshGroup.scene;      

    let lights = [];
    let cameras = [];
    let meshes = [];
    let materialBuffer = [];
    let materialTextureInfoBuffer = [];
    let triangleMaterialMarkers = [];

    let matrixStack = [];
    let parent;

    matrixStack.push(new THREE.Matrix4());

    let _this = this;
    scene.traverse(function (child) {
      if (child.isMesh || child.isLight || child.isCamera) {
        if (parent !== undefined && parent.name !== child.parent.name) {
          matrixStack.pop();
          parent = undefined;
        }

        //child.matrix.premultiply(matrixStack[matrixStack.length - 1]);

        if (child.isMesh) {

          child.geometry.applyMatrix4(child.matrixWorld);

          if (child.material.length > 0) {
            //for (let i = 0; i < child.material.length; i++)
            //new MaterialObject(child.material[i], pathTracingMaterialList);
            _this.parseMaterial(child.material[0], materialBuffer, materialTextureInfoBuffer)
          } else {
            _this.parseMaterial(child.material, materialBuffer, materialTextureInfoBuffer);
          }

          if (child.geometry.groups.length > 0) {
            for (let i = 0; i < child.geometry.groups.length; i++) {
              triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
                triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0) +
                child.geometry.groups[i].count / 3);
            }
          } else {
            triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
              triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0)
              + child.geometry.index.count / 3);
          }

          meshes.push(child);
        }
        else if (child.isLight) {
          // console.log(child);

          let l = new Light();
          let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
          l.position = pos.toArray(); // TODO clarify why                     
          l.type = (child.type === "PointLight") ? 0 : 1;
          l.emission = child.color.multiplyScalar(child.intensity).toArray();
          lights.push(l);
        }
        else if (child.isCamera) {
          // console.log(child);
          child.position.applyMatrix4(child.matrix);
          cameras.push(child);
        }
      } else if (child.isObject3D) {
        if (parent !== undefined)
          matrixStack.pop();

        let matrixPeek = new THREE.Matrix4().copy(matrixStack[matrixStack.length - 1]).multiply(child.matrix);
        matrixStack.push(matrixPeek);
        parent = child;
      }
    });

    var flattenedMeshList = [].concat.apply([], meshes);

    if (cameras.length > 0) { // just use camera 0 for now
      if (this.camera !== undefined) {
        this.camera.fov = cameras[0].fov;
        this.camera.near = cameras[0].near;
        //_this._camera.aspect = cameras[0].aspect;
        this.camera.matrixWorld = cameras[0].matrixWorld;
        _this.camera.updateProjectionMatrix();
        if (this.controls) this.controls.update();
      }
    }
    await this.prepareDataBuffers(flattenedMeshList, lights, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers);
  };

  private async prepareDataBuffers(meshList, lightList, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers) {
    let gl = this.gl;
    // Gather all geometry from the mesh list _this now contains loaded models
    let geoList = [];
    for (let i = 0; i < meshList.length; i++) {
      const geo = meshList[i].geometry;

      // mergeBufferGeometries expect consitent attributes throughout all geometries, otherwise it fails
      // we don't use the second uv set yet, but as some geos might have it, we need to check for it and remove it when present
      if ('uv2' in geo.attributes) {
        delete geo.attributes['uv2'];
      }
      geoList.push(geo);
    }

    // Merge geometry from all models into one new mesh
    let modelMesh = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geoList));

    let bufferGeometry = <THREE.BufferGeometry>modelMesh.geometry;
    if (bufferGeometry.attributes.tangent === undefined)
      BufferGeometryUtils.computeTangents(bufferGeometry);
    if (bufferGeometry.index)
      bufferGeometry = bufferGeometry.toNonIndexed(); // TODO: why do we need NonIndexed geometry?

    // 9 floats per triangle
    let total_number_of_triangles = bufferGeometry.attributes.position.array.length / 9;

    console.log(`Loaded glTF consisting of ${total_number_of_triangles} total triangles.`);

    console.timeEnd("Parsing scene data");

    console.time("BvhGeneration");
    console.log("BvhGeneration...");

    //modelMesh.geometry.rotateY(Math.PI);

    var vpa = new Float32Array(bufferGeometry.attributes.position.array);
    if (bufferGeometry.attributes.normal === undefined)
      bufferGeometry.computeVertexNormals();

    var vna = new Float32Array(bufferGeometry.attributes.normal.array);
    var modelHasUVs = false;
    if (bufferGeometry.attributes.uv !== undefined) {
      var vuv = new Float32Array(bufferGeometry.attributes.uv.array);
      modelHasUVs = true;
    }

    let position_buffer = new Float32Array(total_number_of_triangles * 12);
    let normal_buffer = new Float32Array(total_number_of_triangles * 12);
    let uv_buffer = new Float32Array(total_number_of_triangles * 12);

    let materialIdx = 0;
    for (let i = 0; i < total_number_of_triangles; i++) {

      if (i >= triangleMaterialMarkers[materialIdx])
        materialIdx++;

      let vt0 = new THREE.Vector2();
      let vt1 = new THREE.Vector2();
      let vt2 = new THREE.Vector2();
      // record vertex texture coordinates (UVs)
      if (modelHasUVs) {
        vt0.set(vuv[6 * i + 0], vuv[6 * i + 1]);
        vt1.set(vuv[6 * i + 2], vuv[6 * i + 3]);
        vt2.set(vuv[6 * i + 4], vuv[6 * i + 5]);
      } else {
        vt0.set(0, 0);
        vt1.set(0, 0);
        vt2.set(0, 0);
      }

      // record vertex normals
      let vn0 = new THREE.Vector3(vna[9 * i + 0], vna[9 * i + 1], vna[9 * i + 2]).normalize();
      let vn1 = new THREE.Vector3(vna[9 * i + 3], vna[9 * i + 4], vna[9 * i + 5]).normalize();
      let vn2 = new THREE.Vector3(vna[9 * i + 6], vna[9 * i + 7], vna[9 * i + 8]).normalize();

      // record vertex positions
      let vp0 = new THREE.Vector3(vpa[9 * i + 0], vpa[9 * i + 1], vpa[9 * i + 2]);
      let vp1 = new THREE.Vector3(vpa[9 * i + 3], vpa[9 * i + 4], vpa[9 * i + 5]);
      let vp2 = new THREE.Vector3(vpa[9 * i + 6], vpa[9 * i + 7], vpa[9 * i + 8]);

      // TODO Move material index to a per triangle info data buffer
      position_buffer[12 * i + 0] = vp0.x; position_buffer[12 * i + 1] = vp0.y; position_buffer[12 * i + 2] = vp0.z; position_buffer[12 * i + 3] = materialIdx;
      position_buffer[12 * i + 4] = vp1.x; position_buffer[12 * i + 5] = vp1.y; position_buffer[12 * i + 6] = vp1.z; position_buffer[12 * i + 7] = materialIdx;
      position_buffer[12 * i + 8] = vp2.x; position_buffer[12 * i + 9] = vp2.y; position_buffer[12 * i + 10] = vp2.z; position_buffer[12 * i + 11] = materialIdx;

      normal_buffer[12 * i + 0] = vn0.x; normal_buffer[12 * i + 1] = vn0.y; normal_buffer[12 * i + 2] = vn0.z; normal_buffer[12 * i + 3] = materialIdx;
      normal_buffer[12 * i + 4] = vn1.x; normal_buffer[12 * i + 5] = vn1.y; normal_buffer[12 * i + 6] = vn1.z; normal_buffer[12 * i + 7] = materialIdx;
      normal_buffer[12 * i + 8] = vn2.x; normal_buffer[12 * i + 9] = vn2.y; normal_buffer[12 * i + 10] = vn2.z; normal_buffer[12 * i + 11] = materialIdx;

      uv_buffer[12 * i + 0] = vt0.x; uv_buffer[12 * i + 1] = vt0.y; uv_buffer[12 * i + 2] = 0; uv_buffer[12 * i + 3] = 0;
      uv_buffer[12 * i + 4] = vt1.x; uv_buffer[12 * i + 5] = vt1.y; uv_buffer[12 * i + 6] = 0; uv_buffer[12 * i + 7] = 0;
      uv_buffer[12 * i + 8] = vt2.x; uv_buffer[12 * i + 9] = vt2.y; uv_buffer[12 * i + 10] = 0; uv_buffer[12 * i + 11] = 0;
    }

    (<THREE.Material>modelMesh.material).dispose();

    let rgba_stride = 4;

    let bvh = new SimpleTriangleBVH(rgba_stride);
    bvh.build(position_buffer);

    // now we need to reorder the tri data based on the bvh indices created during construction
    //!!TOOPT: do this in place   
    let triData = new Float32Array(position_buffer.length);
    let normalData = new Float32Array(normal_buffer.length);
    let uvData = new Float32Array(uv_buffer.length);

    let tangentData;
    let tangent_buffer;
    if (modelHasUVs) { // tangents will only be generated when uvs are available    
      tangent_buffer = new Float32Array(bufferGeometry.attributes.tangent.array);
      tangentData = new Float32Array(tangent_buffer);
    }

    bufferGeometry.dispose();

    for (let i = 0; i < total_number_of_triangles; i++) {
      let srcIdx = bvh.m_pTriIndices[i];
      for (let j = 0; j < (3 * rgba_stride); j++) {
        triData[i * (3 * rgba_stride) + j] = position_buffer[srcIdx * (3 * rgba_stride) + j];
        normalData[i * (3 * rgba_stride) + j] = normal_buffer[srcIdx * (3 * rgba_stride) + j];
        uvData[i * (3 * rgba_stride) + j] = uv_buffer[srcIdx * (3 * rgba_stride) + j];

        if (modelHasUVs) {
          tangentData[i * (3 * rgba_stride) + j] = tangent_buffer[srcIdx * (3 * rgba_stride) + j];
        }
      }
    }

    let flatBVHData = bvh.createAndCopyToFlattenedArray_StandardFormat();

    let flatMaterialBuffer = new Float32Array(materialBuffer.flat(Infinity));
    let flatMaterialTextureInfoBuffer = materialTextureInfoBuffer.flat(Infinity);
    let valueList = [];
    for (let i = 0; i < flatMaterialTextureInfoBuffer.length; i++) {
      let texInfo = flatMaterialTextureInfoBuffer[i];
      let values = flattenArray(Object.values<any>(texInfo));
      valueList.push(values);
    }

    valueList = flattenArray(valueList);

    for (let t in this.pathtracingDataTextures) {
      if (this.pathtracingDataTextures[t] !== undefined) {
        gl.deleteTexture(this.pathtracingDataTextures[t]);
      }
    }
    this.pathtracingDataTextures = {};

    this.pathtracingDataTextures["u_sampler2D_BVHData"] = glu.createDataTexture(gl, flatBVHData);
    this.pathtracingDataTextures["u_sampler2D_TriangleData"] = glu.createDataTexture(gl, triData);
    this.pathtracingDataTextures["u_sampler2D_NormalData"] = glu.createDataTexture(gl, normalData);
    this.pathtracingDataTextures["u_sampler2D_UVData"] = glu.createDataTexture(gl, uvData);
    this.pathtracingDataTextures["u_sampler2D_MaterialData"] = glu.createDataTexture(gl, flatMaterialBuffer);
    this.pathtracingDataTextures["u_sampler2D_MaterialTexInfoData"] = glu.createDataTexture(gl, new Float32Array(valueList)); // TODO can be byte type

    if (modelHasUVs) {
      this.pathtracingDataTextures["u_sampler2D_TangentData"] = glu.createDataTexture(gl, tangentData);
    }

    let shaderChunks = {};
    // single pointlight as static define sufficient for now, need to reduce texture usage :/
    shaderChunks['pathtracing_lights'] = ` `
    if (lightList.length > 0) {
      // lightTexture = createDataTexture(lightList, THREE.RGBAFormat, THREE.FloatType);
      // THREE.ShaderChunk[ 'pathtracing_lights' ] = `
      // #define HAS_LIGHTS 1
      // const uint LIGHT_SIZE = 2u;
      // uniform sampler2D u_sampler2D_LightData;
      // const int numLights = ${lightList.length};            
      //`
      //_pathTracingUniforms["u_sampler2D_LightData"] = {type: "t", value: lightTexture};

      let pos = lightList[0].position;
      let em = lightList[0].emission;
      shaderChunks['pathtracing_lights'] = `
                #define HAS_LIGHTS 1
                const vec3 cPointLightPosition = vec3(${pos[0]}, ${pos[1]}, ${pos[2]});
                const vec3 cPointLightEmission = vec3(${em[0]}, ${em[1]}, ${em[2]});            
                `
    }

    // create texture arrays
    function getImageData(image) {
      var canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      return context.getImageData(0, 0, image.width, image.height);
    }

    // clear texture arrays
    for (let t in this.pathtracingTexturesArrays) {
      if (this.pathtracingTexturesArrays[t] !== undefined) {
        gl.deleteTexture(this.pathtracingTexturesArrays[t]);
      }
    }
    this.pathtracingTexturesArrays = {};

    // create texture arrays for current scene and
    // create shader snippet for texture array access
    let tex_array_shader_snippet = "";
    for (let i = 0; i < this.texArrayList.length; i++) {
      const texList = this._texArrayList[i];
      const texSize = texList[0].image.width * texList[0].image.height * 4;
      let data = new Uint8Array(texSize * texList.length);

      data.set(getImageData(texList[0].image).data);
      for (let t = 1; t < texList.length; t++) {
        data.set(getImageData(texList[t].image).data, texSize * t);
      }

      let texArray =  gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArray);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);

      // at some point three seems to enable flip_y unpack. We need to disable it as it is not supported by texImage3D
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); 
      gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        texList[0].image.width,
        texList[0].image.height,
        texList.length,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

      this.pathtracingTexturesArrays[`u_sampler2DArray_MaterialTextures_${i}`] = texArray;
      tex_array_shader_snippet += `uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};\n`
    }

    tex_array_shader_snippet += "\n";
    tex_array_shader_snippet += "vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) { \n";

    for (let i = 0; i < this.texArrayList.length; i++) {
      tex_array_shader_snippet += `   if(texInfo.texArrayIdx == ${i}) {\n`
      tex_array_shader_snippet += `       vec2 tuv = texCoord * texInfo.texScale + texInfo.texOffset;`
      tex_array_shader_snippet += `       return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.texIdx));\n`
      tex_array_shader_snippet += "   }\n";
    }

    tex_array_shader_snippet += `       return vec4(1.0);\n`
    tex_array_shader_snippet += "}\n";

    shaderChunks['pathtracing_tex_array_lookup'] = tex_array_shader_snippet;

    let vertexShader = await filePromiseLoader('./shader/pt.vert');
    let fragmentShader = await filePromiseLoader('./shader/pt.frag');

    shaderChunks['pathtracing_rng'] = await filePromiseLoader('./shader/rng.glsl');
    shaderChunks['pathtracing_utils'] = await filePromiseLoader('./shader/utils.glsl');
    shaderChunks['pathtracing_material'] = await filePromiseLoader('./shader/material.glsl');
    shaderChunks['pathtracing_dspbr'] = await filePromiseLoader('./shader/dspbr.glsl');
    shaderChunks['pathtracing_rt_kernel'] = await filePromiseLoader('./shader/rt_kernel.glsl');

    shaderChunks['pathtracing_defines'] = `
          #define PI               3.14159265358979323
          #define TWO_PI           6.28318530717958648
          #define FOUR_PI          12.5663706143591729
          #define ONE_OVER_PI      0.31830988618379067
          #define ONE_OVER_TWO_PI  0.15915494309
          #define ONE_OVER_FOUR_PI 0.07957747154594767
          #define PI_OVER_TWO      1.57079632679489662
          #define ONE_OVER_THREE   0.33333333333333333
          #define E                2.71828182845904524
          #define INFINITY         1000000.0

          const float EPS_NORMAL = 0.001;
          const float EPS_COS = 0.001;
          const float EPS_PDF = 0.001;
          const float EPSILON  = 1e-6;

          const float MINIMUM_ROUGHNESS = 0.001;
          const float TFAR_MAX = 100000.0;

          const float RR_TERMINATION_PROB = 0.9;

          const uint MATERIAL_SIZE = 11u;
          const uint MATERIAL_TEX_INFO_SIZE = 5u;
          const uint TEX_INFO_SIZE = 2u;
      `;

    if (this.ptProgram !== undefined) {
      gl.useProgram(null);
      gl.deleteProgram(this.ptProgram); 
    }

    this.ptProgram = glu.createProgramFromSource(gl, vertexShader, fragmentShader, shaderChunks);

    gl.useProgram(this.ptProgram);
    let loc = gl.getUniformLocation(this.ptProgram, "u_int_NumTriangles");
    gl.uniform1ui(loc, total_number_of_triangles);
    
    let numTextureSlots = 0;
    for (let t in this.pathtracingDataTextures) {
      let loc = gl.getUniformLocation(this.ptProgram, t);
      gl.uniform1i(loc, numTextureSlots++);
    }
    for (let t in this.pathtracingTexturesArrays) {
      let loc = gl.getUniformLocation(this.ptProgram, t);
      gl.uniform1i(loc, numTextureSlots++);
    }
    if ("u_sampler2D_TangentData" in this.pathtracingDataTextures) {
      let loc = gl.getUniformLocation(this.ptProgram, "u_bool_hasTangents");
      gl.uniform1i(loc, 1);
    }
    gl.useProgram(null);

    console.timeEnd("BvhGeneration");
    this.resetAccumulation();
  }


}



// export { PathtracingRenderer };