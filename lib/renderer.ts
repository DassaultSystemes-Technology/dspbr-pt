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
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimpleTriangleBVH } from './bvh.js';
import { Material } from 'three';

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

type DebugMode = "None" | "Albedo" | "Metalness" | "Roughness" | "Normals" | "Tangents" | "Bitangents" | "Transparency";

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
  _gl: any;
  _canvas: any | undefined;
  _scene: THREE.Scene | null;
  _renderer: any;
  _controls: any;
  _camera: any;
  _quadCamera: any;
  _pathtracingScene: any;
  _pathTracingMesh: any;
  _accumBufferScene: any;
  _displayScene: any;
  _pathTracingRenderTarget: any;
  _accumRenderTarget: any;
  _pathTracingUniforms: any;
  _glCubeIBL: any;
  _boundingBox: any;
  _pmremGenerator: any;
  _content: any | null;

  _frameCount = 1;
  _sceneScaleFactor = 1.0;
  _isRendering = false;
  _usePathtracing = true;
  _debugMode: DebugMode = "None";
  _maxBounceDepth = 4;
  _useIBL = false;
  _disableBackground = false;
  _autoScaleOnImport = true;
  _pixelRatio = 0.5; // this serves as a multiplier to the devcice pixel ratio, which might be > 1 for e.g. retiana displays
  _autoRotate = false;
  _forceIBLEvalOnLastBounce = false;
  _useControls = true;

  _texArrayList: any[] = [];
  _texArrayDict: { [idx: string]: any; } = {};
  _texArray;

  debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents", "Transparency"];

  //   //var y_to_z_up = new THREE.Matrix4().makeRotationX(-Math.PI *0.5);

  constructor(canvas: any | undefined, useControls: any | undefined) {
    console.time("Init Pathtracing Renderer");
    this._canvas = canvas !== undefined ? canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this._gl = this._canvas.getContext('webgl2');

    this._scene = new THREE.Scene();
    this._useControls = useControls;

    THREE.ShaderChunk['pathtracing_defines'] = `
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

    this.initRenderer();
  }

  cleanup() {
    this._texArrayDict = {};

    for (let ta in this._texArrayList) {
      for (let t in this._texArrayList[ta]) {
        this._texArrayList[ta][t].dispose();
      }

      this._pathTracingUniforms[`u_sampler2DArray_MaterialTextures_${ta}`].value.dispose();
    }

    this._texArrayList = [];

    if (this._content) {
      this._scene.remove(this._content);
      cleanupScene(this._content);

      this._scene.background = new THREE.Color(0, 0, 0);
      this._scene.environment = null;
    }

    if (this._glCubeIBL !== undefined)
      this._glCubeIBL.dispose();
  }


  getContext() {
    return this._gl;
  }

  getGLRenderer() {
    return this._renderer;
  };

  resetAccumulation() {
    this._frameCount = 1;
    // console.log("Reset Accumulation");
  }

  setPixelRatio(ratio) {
    this._pixelRatio = ratio;
    this.resize(window.innerWidth, window.innerHeight);
  }

  setMaxBounceDepth(value) {
    this._maxBounceDepth = value;
    this.resetAccumulation();
  }

  usePathtracing(flag) {
    this._usePathtracing = flag;
    this.resetAccumulation();
  }

  autoScaleOnImport(flag) {
    this._autoScaleOnImport = flag;
  }

  forceIBLEvalOnLastBounce(flag) {
    this._forceIBLEvalOnLastBounce = flag;
    this.resetAccumulation();
  }

  enableAutoRotate(flag) {
    if (this._controls) {
      this._controls.autoRotate = flag;
      this.resetAccumulation();
    }
  }

  disableBackground(flag) {
    this._disableBackground = flag
    if (!flag) {
      this._scene.background = this._glCubeIBL;
    } else {
      this._scene.background = new THREE.Color(0x000000);
    }
    this.resetAccumulation();
  }

  setDebugMode(mode) {
    this._debugMode = mode;
    this.resetAccumulation();
  }

  useIBL(flag) {
    this._useIBL = flag;

    if (!flag) {
      this._scene.environment = undefined;
    } else {
      this._scene.environment = this._glCubeIBL;
    }

    this.resetAccumulation();
  }

  resize(width, height) {
    let renderPixelRatio = this._pixelRatio * window.devicePixelRatio
    this._renderer.setPixelRatio(renderPixelRatio);
    this._renderer.setSize(width, height);
    this._pathTracingRenderTarget.setSize(width * renderPixelRatio, height * renderPixelRatio);
    this._accumRenderTarget.setSize(width * renderPixelRatio, height * renderPixelRatio);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this.resetAccumulation();
  }

  getCamera() {
    return this._camera;
  }

  setLookAt(from, at, up) {
    this._camera.position.set(from[0] * this._sceneScaleFactor, from[1] * this._sceneScaleFactor, from[2] * this._sceneScaleFactor);
    this._camera.up.set(up[0], up[1], up[2]);
    this._camera.lookAt(at[0] * this._sceneScaleFactor, at[1] * this._sceneScaleFactor, at[2] * this._sceneScaleFactor);
    this._camera.updateMatrixWorld();
    if (this._controls) this._controls.update();
  }

  setPerspective(vFov, near, far) {
    this._camera.fov = vFov;
    this._camera.near = near;
    this._camera.far = far;
    this._camera.updateProjectionMatrix();
  }

  getBoundingBox() {
    return this._boundingBox;
  }

  centerView() {
    if (this._controls) { // Todo: implement on camera, no controls needed for this
      let center = new THREE.Vector3();
      this._boundingBox.getCenter(center);
      this._controls.target = center;
      this._controls.update();
      this.resetAccumulation();
    }
  }

  stopRendering() {
    this._isRendering = false;
  };

  render(num_samples, frameFinishedCB, renderingFinishedCB) {
    if (this._camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }

    this._isRendering = true;
    this.resetAccumulation();

    let _this = this;
    let renderFrame = function() {
      if (!_this._isRendering || _this._renderer === undefined)
        return;

      if (_this._controls)
        _this._controls.update(clock.getDelta());

      if (_this._usePathtracing) {

        if (_this._pathTracingUniforms !== undefined) {
          _this._pathTracingUniforms.u_mat4_ViewMatrix.value.copy(_this._camera.matrixWorld);
          _this._pathTracingUniforms.u_vec3_CameraPosition.value.copy(_this._camera.position);
          _this._pathTracingUniforms.u_int_FrameCount.value = _this._frameCount;
          _this._pathTracingUniforms.u_int_DebugMode.value = _this.debugModes.indexOf(_this._debugMode);
          _this._pathTracingUniforms.u_bool_UseIBL.value = _this._useIBL;
          _this._pathTracingUniforms.u_bool_DisableBackground.value = _this._disableBackground;
          _this._pathTracingUniforms.u_int_MaxBounceDepth.value = _this._maxBounceDepth;
          _this._pathTracingUniforms.u_vec2_InverseResolution.value.set(1.0 / window.innerWidth, 1.0 / window.innerHeight);
          let filmHeight = Math.tan(_this._camera.fov * 0.5 * Math.PI / 180.0) * _this._camera.near;
          _this._pathTracingUniforms.u_float_FilmHeight.value = filmHeight; //TODO move to shader 
          _this._pathTracingUniforms.u_float_FocalLength.value = _this._camera.near;
          _this._pathTracingUniforms.u_bool_forceIBLEvalOnLastBounce.value = _this._forceIBLEvalOnLastBounce;
          // _pathTracingUniforms.u_float_FilmHeight.value = _camera.getFilmHeight();
          // _pathTracingUniforms.u_float_FocalLength.value = _camera.getFocalLength();
        }

        if (_this._debugMode !== "None") {

          _this._renderer.setRenderTarget(_this._pathTracingRenderTarget);
          _this._renderer.render(_this._pathtracingScene, _this._camera);

          _this._renderer.setRenderTarget(_this._accumRenderTarget);
          _this._renderer.render(_this._accumBufferScene, _this._quadCamera);

          _this._renderer.setRenderTarget(null);
          _this._renderer.render(_this._accumBufferScene, _this._quadCamera);

        } else {

          _this._renderer.setRenderTarget(_this._pathTracingRenderTarget);
          _this._renderer.render(_this._pathtracingScene, _this._camera);

          // STEP 2
          // Render(copy) the pathTracingScene output(pathTracingRenderTarget above) into screenTextureRenderTarget.
          // _This will be used as a new starting point for Step 1 above (essentially creating ping-pong buffers)
          _this._renderer.setRenderTarget(_this._accumRenderTarget);
          _this._renderer.render(_this._accumBufferScene, _this._quadCamera);

          // STEP 3
          // Render full screen quad with generated pathTracingRenderTarget in STEP 1 above.
          // After the image is gamma-corrected, it will be shown on the screen as the final accumulated output
          _this._renderer.setRenderTarget(null);
          _this._renderer.render(_this._displayScene, _this._quadCamera);
        }
      } else {
        _this._renderer.render(_this._scene, _this._camera); // render GL view
      }

      _this._frameCount++;

      if (num_samples !== -1 && _this._frameCount >= num_samples) {
        renderingFinishedCB(); // finished rendering num_samples
        _this._isRendering = false;
      }

      frameFinishedCB(_this._frameCount);
      requestAnimationFrame(renderFrame); // num_samples == -1 || _frameCount < num_samples
    };

    requestAnimationFrame(renderFrame); // start render loop
  }

  initRenderer() {
    //THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);

    this._pathtracingScene = new THREE.Scene();
    this._accumBufferScene = new THREE.Scene();
    this._displayScene = new THREE.Scene();

    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, context: this._gl, powerPreference: "high-performance", alpha: true });
    this._renderer.setPixelRatio(this._pixelRatio * window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.getContext().getExtension('EXT_color_buffer_float');
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this._renderer.toneMapping = THREE.NoToneMapping
    this._renderer.toneMappingExposure = 1.0;
    this._renderer.outputEncoding = THREE.GammaEncoding;
    this._renderer.physicallyCorrectLights = true;

    this._pmremGenerator = new THREE.PMREMGenerator(this._renderer);
    this._pmremGenerator.compileEquirectangularShader();

    let aspect = window.innerWidth / window.innerHeight;
    this._camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);
    this._camera.position.set(0, 0, 3);

    if (this._useControls) {
      this._controls = new OrbitControls(this._camera, this._canvas);
      this._controls.screenSpacePanning = true;

      let that = this;
      this._controls.addEventListener('change', function () {
        that.resetAccumulation();
      });

      this._controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      }
    }

    this._quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._accumBufferScene.add(this._quadCamera);
    this._displayScene.add(this._quadCamera);

    let quadGeometry = new THREE.PlaneBufferGeometry(2, 2);

    let renderPixelRatio = this._pixelRatio * window.devicePixelRatio
    this._pathTracingRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * renderPixelRatio), (window.innerHeight * renderPixelRatio), {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });

    let accumMaterial = new THREE.ShaderMaterial({
      uniforms: this.screenTextureShader.uniforms,
      vertexShader: this.screenTextureShader.vertexShader,
      fragmentShader: this.screenTextureShader.fragmentShader,
      depthWrite: false,
      depthTest: false
    });

    accumMaterial.uniforms.tex.value = this._pathTracingRenderTarget.texture;

    let screenTextureMesh = new THREE.Mesh(quadGeometry, accumMaterial);
    this._accumBufferScene.add(screenTextureMesh);

    accumMaterial.dispose();

    let displayMaterial = new THREE.ShaderMaterial({
      uniforms: this.screenOutputShader.uniforms,
      vertexShader: this.screenOutputShader.vertexShader,
      fragmentShader: this.screenOutputShader.fragmentShader,
      depthWrite: false,
      depthTest: false
    });

    displayMaterial.uniforms.tex.value = this._pathTracingRenderTarget.texture;

    let displayMesh = new THREE.Mesh(quadGeometry, displayMaterial);
    this._displayScene.add(displayMesh);

    quadGeometry.dispose();
    displayMaterial.dispose();

    console.timeEnd("Init Pathtracing Renderer");

    this._accumRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * renderPixelRatio), (window.innerHeight * renderPixelRatio), {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });
  }

  findTextureInList(tex, texList) {
    for (let i = 0; i < texList.length; i++) {
      if (tex.image.src === texList[i].image.src)
        return i;
    }

    return -1;
  }

  parseTexture(tex) {
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


  parseMaterial(mat: THREE.MeshStandardMaterial, materialBuffer: any[], materialTextureInfoBuffer: any[]) {
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
      if ('3DS_materials_transmission' in extensions) {
        let ext = extensions["3DS_materials_transmission"];
        matInfo.transparency = get_param("transmissionFactor", ext, matInfo.transparency);
      }
      if ('KHR_materials_transmission' in extensions) {
        let ext = extensions["KHR_materials_transmission"];
        matInfo.transparency = get_param("transmissionFactor", ext, matInfo.transparency);
      }
      if ('3DS_materials_specular' in extensions) {
        let ext = extensions["3DS_materials_specular"];
        matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
        matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
      }
      if ('KHR_materials_specular' in extensions) {
        let ext = extensions["KHR_materials_specular"];
        matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
        matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
      }
      if ('3DS_materials_ior' in extensions) {
        matInfo.ior = get_param("ior", extensions["3DS_materials_ior"], matInfo.ior);
      }
      if ('KHR_materials_ior' in extensions) {
        matInfo.ior = get_param("ior", extensions["KHR_materials_ior"], matInfo.ior);
      }
      if ('3DS_materials_clearcoat' in extensions) {
        let ext = extensions["3DS_materials_clearcoat"];
        matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
        matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
      }
      if ('KHR_materials_clearcoat' in extensions) {
        let ext = extensions["KHR_materials_clearcoat"];
        matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
        matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
      }
      if ('3DS_materials_sheen' in extensions) {
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
    new RGBELoader()
      .setDataType(THREE.FloatType)
      .load(ibl, function (texture) {
        this._glCubeIBL = this._pmremGenerator.fromEquirectangular(texture).texture;
        this._pmremGenerator.dispose();
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        texture.needsUpdate = true;

        this._scene.background = this._glCubeIBL;
        this._scene.environment = this._glCubeIBL;

        if (this._pathTracingUniforms["u_samplerCube_EnvMap"].value)
          this._pathTracingUniforms["u_samplerCube_EnvMap"].value.dispose();

        this._pathTracingUniforms["u_samplerCube_EnvMap"].value = texture;
        this.useIBL(true);
        if (callback) callback();
      }.bind(this));
  }

  loadScene(scene_path, callback, manager) {
    this.cleanup();
    this.stopRendering();
    THREE.Cache.clear();

    console.log("GL Renderer state before load:\n", this._renderer.info);

    let that = this;
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
      that._sceneScaleFactor = 1.0 / deltaValue;
      // Normalize scene dimensions (needed for easy rt precision control) 
      if (that._autoScaleOnImport) {
        scene.scale.set(that._sceneScaleFactor, that._sceneScaleFactor, that._sceneScaleFactor);
      }

      //scene.matrixAutoUpdate = false;
      scene.updateMatrixWorld()

      // we need a clone where we disconnect geometry refs (see below)
      that._content = scene.clone();

      that._scene.add(that._content);
      //scene.applyMatrix4(y_to_z_up);

      // Break reference of geometry nodes in scene copy
      // we need this because the transforms will baked into geo for path-tracing
      // whereas gl renderer is resolving transforms on pre-render
      that._scene.traverse((node) => {
        if ((<THREE.Mesh>node).isMesh) {
          let meshNode = (<THREE.Mesh>node);
          meshNode.geometry = meshNode.geometry.clone();
        }
      });

      that.createPathTracingScene(scene).then(() => {
        that.resetAccumulation();

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
  async createPathTracingScene(scene) {
    this._boundingBox = new THREE.Box3().setFromObject(scene);

    console.time("InitializingPT");

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

    let that = this;
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
            that.parseMaterial(child.material[0], materialBuffer, materialTextureInfoBuffer)
          } else {
            that.parseMaterial(child.material, materialBuffer, materialTextureInfoBuffer);
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
          console.log(child);

          let l = new Light();
          let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
          l.position = pos.toArray(); // TODO clarify why                     
          l.type = (child.type === "PointLight") ? 0 : 1;
          l.emission = child.color.multiplyScalar(child.intensity).toArray();
          lights.push(l);
        }
        else if (child.isCamera) {
          console.log(child);
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
      if (this._camera !== undefined) {
        this._camera.fov = cameras[0].fov;
        this._camera.near = cameras[0].near;
        //that._camera.aspect = cameras[0].aspect;
        this._camera.matrixWorld = cameras[0].matrixWorld;
        that._camera.updateProjectionMatrix();
        if (this._controls) this._controls.update();
      }
    }
    await this.prepareDataBuffers(flattenedMeshList, lights, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers);
  };

  async prepareDataBuffers(meshList, lightList, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers) {
    // Gather all geometry from the mesh list that now contains loaded models
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

    console.timeEnd("InitializingPT");

    console.time("BvhGeneration");
    console.log("BvhGeneration...");

    //modelMesh.geometry.rotateY(Math.PI);

    // let totalWork = new Uint32Array(total_number_of_triangles);
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

    bufferGeometry.dispose();
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

    let flatMaterialBuffer = materialBuffer.flat(Infinity);
    let flatMaterialTextureInfoBuffer = materialTextureInfoBuffer.flat(Infinity);
    let valueList = [];
    for (let i = 0; i < flatMaterialTextureInfoBuffer.length; i++) {
      let texInfo = flatMaterialTextureInfoBuffer[i];
      let values = flattenArray(Object.values<any>(texInfo));
      valueList.push(values);
    }

    valueList = flattenArray(valueList);

    let bvhTexture = this.createDataTexture(flatBVHData, THREE.RGBAFormat, THREE.FloatType);
    let triangleTexture = this.createDataTexture(triData, THREE.RGBAFormat, THREE.FloatType);
    let normalTexture = this.createDataTexture(normalData, THREE.RGBAFormat, THREE.FloatType);
    let uvTexture = this.createDataTexture(uvData, THREE.RGBAFormat, THREE.FloatType);
    let materialTexture = this.createDataTexture(flatMaterialBuffer, THREE.RGBAFormat, THREE.FloatType);
    let materialInfoTexture = this.createDataTexture(valueList, THREE.RGBAFormat, THREE.FloatType); // TODO can be byte type

    if (this._pathTracingUniforms !== undefined) {
      this._pathTracingUniforms["u_sampler2D_PreviousTexture"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_BVHData"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_TriangleData"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_NormalData"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_UVData"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_MaterialData"].value.dispose();
      this._pathTracingUniforms["u_sampler2D_MaterialTexInfoData"].value.dispose();
      if (modelHasUVs) {
        this._pathTracingUniforms["u_sampler2D_TangentData"].value.dispose();
      }
    }

    this._pathTracingUniforms = {
      u_sampler2D_PreviousTexture: { type: "t", value: this._accumRenderTarget.texture },
      u_sampler2D_BVHData: { type: "t", value: bvhTexture },
      u_sampler2D_TriangleData: { type: "t", value: triangleTexture },
      u_sampler2D_NormalData: { type: "t", value: normalTexture },
      u_sampler2D_UVData: { type: "t", value: uvTexture },
      u_sampler2D_MaterialData: { type: "t", value: materialTexture },
      u_sampler2D_MaterialTexInfoData: { type: "t", value: materialInfoTexture },
      u_samplerCube_EnvMap: { type: "t", value: null },
      u_bool_hasTangents: { type: "b", value: false },

      u_vec2_InverseResolution: { type: "v2", value: new THREE.Vector2(1.0 / window.innerWidth, 1.0 / window.innerHeight) },
      u_int_NumTriangles: { type: "f", value: total_number_of_triangles },
      u_int_MaxTextureSize: { value: this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE) },
      u_mat4_ViewMatrix: { type: "m4", value: new THREE.Matrix4() },
      u_vec3_CameraPosition: { type: "v3", value: new THREE.Vector3(0, -1, 0) },
      u_float_FocalLength: { type: "f", value: 0.1 },
      u_float_FilmHeight: { type: "f", value: 0.04 },
      u_int_FrameCount: { type: "f", value: 1.0 },
      u_int_DebugMode: { type: "i", value: 0 },
      u_bool_UseIBL: { type: "b", value: true },
      u_bool_DisableBackground: { type: "b", value: true },
      u_int_MaxBounceDepth: { value: 1 },
      u_bool_forceIBLEvalOnLastBounce: { value: false }
    };

    bvhTexture.dispose();
    triangleTexture.dispose();
    normalTexture.dispose();
    uvTexture.dispose();
    materialTexture.dispose();
    materialInfoTexture.dispose();

    let tangentTexture;
    if (modelHasUVs) {
      tangentTexture = this.createDataTexture(tangentData, THREE.RGBAFormat, THREE.FloatType);
      this._pathTracingUniforms["u_sampler2D_TangentData"] = { type: "t", value: tangentTexture };
      this._pathTracingUniforms["u_bool_hasTangents"] = { value: true };
      tangentTexture.dispose();
    }

    // single pointlight as static define sufficient for now, need to reduce texture usage :/
    THREE.ShaderChunk['pathtracing_lights'] = ` `
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
      THREE.ShaderChunk['pathtracing_lights'] = `
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

    let tex_array_shader_snippet = "";
    for (let i = 0; i < this._texArrayList.length; i++) {
      const texList = this._texArrayList[i];
      const texSize = texList[0].image.width * texList[0].image.height * 4;
      let data = new Uint8Array(texSize * texList.length);

      data.set(getImageData(texList[0].image).data);
      for (let t = 1; t < texList.length; t++) {
        data.set(getImageData(texList[t].image).data, texSize * t);
      }

      this._texArray = new (<any>THREE).DataTexture2DArray(data, texList[0].image.width, texList[0].image.height, texList.length);
      this._texArray.format = THREE.RGBAFormat;
      this._texArray.type = THREE.UnsignedByteType;
      this._texArray.wrapS = this._texArray.wrapT = THREE.RepeatWrapping;
      this._texArray.needsUpdate = true; //  if texture is already initialized.
      this._pathTracingUniforms[`u_sampler2DArray_MaterialTextures_${i}`] = { value: this._texArray };
      this._texArray.dispose();

      tex_array_shader_snippet += `uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};\n`
    }

    tex_array_shader_snippet += "\n";
    tex_array_shader_snippet += "vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) { \n";

    for (let i = 0; i < this._texArrayList.length; i++) {
      tex_array_shader_snippet += `   if(texInfo.texArrayIdx == ${i}) {\n`
      tex_array_shader_snippet += `       vec2 tuv = texCoord * texInfo.texScale +  texInfo.texOffset;`
      tex_array_shader_snippet += `       return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.texIdx));\n`
      tex_array_shader_snippet += "   }\n";
    }

    //if (texArrayList.length === 0) {
    tex_array_shader_snippet += `       return vec4(1.0);\n`
    //}

    tex_array_shader_snippet += "}\n";

    THREE.ShaderChunk['pathtracing_tex_array_lookup'] = tex_array_shader_snippet;


    let pathTracingDefines = {};

    // load vertex and fragment shader files that are used in the pathTracing material, mesh and scene
    let vertexShader = await filePromiseLoader('./shader/pt.vert');
    let fragmentShader = await filePromiseLoader('./shader/pt.frag');

    THREE.ShaderChunk['pathtracing_rng'] = await filePromiseLoader('./shader/rng.glsl');
    THREE.ShaderChunk['pathtracing_utils'] = await filePromiseLoader('./shader/utils.glsl');
    THREE.ShaderChunk['pathtracing_material'] = await filePromiseLoader('./shader/material.glsl');
    THREE.ShaderChunk['pathtracing_dspbr'] = await filePromiseLoader('./shader/dspbr.glsl');
    THREE.ShaderChunk['pathtracing_rt_kernel'] = await filePromiseLoader('./shader/rt_kernel.glsl');

    let pathTracingMaterial = new THREE.RawShaderMaterial({
      uniforms: this._pathTracingUniforms,
      defines: pathTracingDefines,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthTest: false,
      depthWrite: false
    });

    let pathTracingGeometry = new THREE.PlaneBufferGeometry(2, 2);
    if (this._pathTracingMesh !== undefined) {
      this._pathTracingMesh.material.dispose();
      this._pathtracingScene.remove(this._pathTracingMesh); //cleans up all chached uniform data
    }
    this._pathTracingMesh = new THREE.Mesh(pathTracingGeometry, pathTracingMaterial);
    this._pathtracingScene.add(this._pathTracingMesh);

    pathTracingGeometry.dispose();
    pathTracingMaterial.dispose();

    this._renderer.renderLists.dispose();
    console.timeEnd("BvhGeneration");

    this.resetAccumulation();
  }

  createDataTexture(data, format, type) {
    let maxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);

    let num_components = 4;
    if (format === THREE.RGBFormat)
      num_components = 3;
    if (format === THREE.RGFormat)
      num_components = 2;

    let numRGBABlocks = (data.length / num_components) | 0;
    let sX = Math.min(numRGBABlocks, maxTextureSize);
    let sY = Math.max(1, ((numRGBABlocks + maxTextureSize - 1) / maxTextureSize) | 0);
    console.log("sX = " + sX + "; sY = " + sY);

    var paddedDataBuffer;
    if (type == THREE.FloatType)
      paddedDataBuffer = new Float32Array(sX * sY * num_components);
    else if (type == THREE.ByteType)
      paddedDataBuffer = new Int8Array(sX * sY * num_components);
    else if (type == THREE.UnsignedByteType)
      paddedDataBuffer = new Uint8Array(sX * sY * num_components);

    for (let i = 0; i < data.length; i++) {
      paddedDataBuffer[i] = data[i];
    }

    let tex = new THREE.DataTexture(paddedDataBuffer,
      sX,
      sY,
      format,
      type,
      THREE.Texture.DEFAULT_MAPPING,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter,
      1,
      THREE.LinearEncoding
    );

    tex.flipY = false;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    return tex;
  }

  screenTextureShader = {

    uniforms: THREE.UniformsUtils.merge([
      {
        tex: { type: "t", value: null }
      }
    ]),

    vertexShader: [
      '#version 300 es',

      'precision highp float;',
      'precision highp int;',

      'void main()',
      '{',
      'gl_Position = vec4( position, 1.0 );',
      '}'

    ].join('\n'),

    fragmentShader: [
      '#version 300 es',

      'precision highp float;',
      'precision highp int;',
      'precision highp sampler2D;',

      'uniform sampler2D tex;',
      'out vec4 out_FragColor;',

      'void main()',
      '{',
      'out_FragColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);',
      '}'

    ].join('\n')

  };

  screenOutputShader = {

    uniforms: THREE.UniformsUtils.merge([
      {
        tex: { type: "t", value: null }
      }
    ]),

    vertexShader: [
      '#version 300 es',

      'precision highp float;',
      'precision highp int;',

      'void main()',
      '{',
      'gl_Position = vec4( position, 1.0 );',
      '}'
    ].join('\n'),

    fragmentShader: [
      '#version 300 es',

      'precision highp float;',
      'precision highp int;',
      'precision highp sampler2D;',

      'uniform sampler2D tex;',
      'out vec4 out_FragColor;',

      'void main()',
      '{',
      'vec4 pixelColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);',
      '//pixelColor = ReinhardToneMapping(pixelColor);',
      '//pixelColor = Uncharted2ToneMapping(pixelColor);',
      '//pixelColor = OptimizedCineonToneMapping(pixelColor);',
      'pixelColor.xyz = ACESFilmicToneMapping(pixelColor.xyz);',
      'pixelColor.xyz = pow(pixelColor.xyz, vec3(0.4545));',
      'out_FragColor = vec4(clamp(pixelColor.xyz, 0.0, 1.0), pixelColor.w );',
      '}'

    ].join('\n')
  };

}



// export { PathtracingRenderer };