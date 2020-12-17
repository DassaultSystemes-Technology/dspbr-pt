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
  albedoTexture = new TexInfo;
  metallicRoughnessTexture = new TexInfo();
  normalTexture = new TexInfo();
  emissionTexture = new TexInfo();
  specularTexture = new TexInfo();
  specularColorTexture = new TexInfo();
  transmissionTexture = new TexInfo();
  clearcoatTexture = new TexInfo();
  // clearcoatNormalTexture = new TexInfo();
  sheenColorTexture = new TexInfo();
  sheenRoughnessTexture = new TexInfo();
}

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}

let clock = new THREE.Clock();

export class PathtracingRenderer {
  private gl: any;
  private canvas: any | undefined;

  private texArrayList: any[] = [];
  private texArrayDict: { [idx: string]: any; } = {};

  private ibl: WebGLTexture;
  private renderBuffer: WebGLTexture;
  private copyBuffer: WebGLTexture;
  private copyFbo: WebGLFramebuffer;
  private fbo: WebGLFramebuffer;
  private quadVao: WebGLVertexArrayObject;
  private ptProgram: WebGLProgram;
  private copyProgram: WebGLProgram;
  private displayProgram: WebGLProgram;
  private quadVertexBuffer: WebGLBuffer;

  private pathtracingDataTextures = {};
  private pathtracingTexturesArrays = {};

  private renderRes: [number, number];
  private displayRes: [number, number];

  // settings
  private exposure = 1.0;
  private frameCount = 1;
  private isRendering = false;
  private debugMode: DebugMode = "None";
  private maxBounceDepth = 4;
  private useIBL = false;
  private disableBackground = false;
  private pixelRatio;
  private forceIBLEvalOnLastBounce = false;

  private debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents", "Transparency", "UV0"];

  //var y_to_z_up = new THREE.Matrix4().makeRotationX(-Math.PI *0.5);

  constructor(canvas: HTMLCanvasElement | undefined, pixelRatio: number = 1.0) {
    // console.time("Init Pathtracing Renderer");
    this.canvas = canvas !== undefined ? canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = this.canvas.getContext('webgl2');
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.getExtension('OES_texture_float_linear');

    if (pixelRatio !== undefined)
      this.pixelRatio = pixelRatio;
    this.initRenderer();
  }

  resetAccumulation() {
    this.frameCount = 1;
  }

  setPixelRatio(ratio) {
    this.pixelRatio = ratio;
    this.resize(this.displayRes[0], this.displayRes[1]);
  }

  setExposure(value) {
    this.exposure = value;
  }

  setMaxBounceDepth(value) {
    this.maxBounceDepth = value;
    this.resetAccumulation();
  }

  setForceIBLEvalOnLastBounce(flag) {
    this.forceIBLEvalOnLastBounce = flag;
    this.resetAccumulation();
  }

  setDisableBackground(flag) {
    this.disableBackground = flag
    this.resetAccumulation();
  }

  setDebugMode(mode) {
    this.debugMode = mode;
    this.resetAccumulation();
  }

  setUseIBL(flag) {
    this.useIBL = flag;
    this.resetAccumulation();
  }

  resize(width, height) {
    this.isRendering = false;
    this.displayRes = [width, height];
    this.renderRes = [Math.ceil(this.displayRes[0] * this.pixelRatio),
    Math.ceil(this.displayRes[1] * this.pixelRatio)];

    this.initFramebuffers(this.renderRes[0], this.renderRes[1]);
    this.resetAccumulation();
    this.isRendering = true;
  }

  stopRendering() {
    this.isRendering = false;
  };

  render(camera: THREE.PerspectiveCamera, num_samples, frameFinishedCB, renderingFinishedCB) {
    if (camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }

    this.isRendering = true;
    this.resetAccumulation();

    let _this = this;
    let renderFrame = () => {
      if (!this.isRendering) {
        return;
      }

      let gl = this.gl;
      gl.useProgram(this.ptProgram);

      let numTextureSlots = 0;
      for (let t in this.pathtracingDataTextures) {
        gl.activeTexture(gl.TEXTURE0 + numTextureSlots++);
        gl.bindTexture(gl.TEXTURE_2D, this.pathtracingDataTextures[t]);
      }
      for (let t in this.pathtracingTexturesArrays) {
        gl.activeTexture(gl.TEXTURE0 + numTextureSlots++);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.pathtracingTexturesArrays[t]);
      }
      gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
      gl.bindTexture(gl.TEXTURE_2D, this.ibl);
      let loc = gl.getUniformLocation(this.ptProgram, "u_samplerCube_EnvMap");
      gl.uniform1i(loc, numTextureSlots++);

      loc = gl.getUniformLocation(this.ptProgram, "u_mat4_ViewMatrix");
      gl.uniformMatrix4fv(loc, false, new Float32Array(camera.matrixWorld.elements));
      loc = gl.getUniformLocation(this.ptProgram, "u_vec3_CameraPosition");
      gl.uniform3f(loc, camera.position.x, camera.position.y, camera.position.z);
      loc = gl.getUniformLocation(this.ptProgram, "u_int_FrameCount");
      gl.uniform1i(loc, this.frameCount);
      loc = gl.getUniformLocation(this.ptProgram, "u_int_MaxTextureSize");
      gl.uniform1ui(loc, glu.getMaxTextureSize(gl));
      loc = gl.getUniformLocation(this.ptProgram, "u_int_DebugMode");
      gl.uniform1i(loc, this.debugModes.indexOf(this.debugMode));
      loc = gl.getUniformLocation(this.ptProgram, "u_bool_UseIBL");
      gl.uniform1i(loc, this.useIBL);
      loc = gl.getUniformLocation(this.ptProgram, "u_bool_DisableBackground");
      gl.uniform1i(loc, this.disableBackground);
      loc = gl.getUniformLocation(this.ptProgram, "u_int_MaxBounceDepth");
      gl.uniform1i(loc, this.maxBounceDepth);
      loc = gl.getUniformLocation(this.ptProgram, "u_vec2_InverseResolution");
      gl.uniform2f(loc, 1.0 / this.renderRes[0], 1.0 / this.renderRes[1]);
      let filmHeight = Math.tan(camera.fov * 0.5 * Math.PI / 180.0) * camera.near;
      loc = gl.getUniformLocation(this.ptProgram, "u_float_FilmHeight");
      gl.uniform1f(loc, filmHeight);
      loc = gl.getUniformLocation(this.ptProgram, "u_float_FocalLength");
      gl.uniform1f(loc, camera.near);
      loc = gl.getUniformLocation(this.ptProgram, "u_bool_forceIBLEvalOnLastBounce");
      gl.uniform1i(loc, this.forceIBLEvalOnLastBounce);

      gl.viewport(0, 0, this.renderRes[0], this.renderRes[1]);

      gl.bindVertexArray(this.quadVao);

      // pathtracing render pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
      gl.bindTexture(gl.TEXTURE_2D, this.copyBuffer);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler2D_PreviousTexture"), numTextureSlots);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(null);

      // copy pathtracing render buffer
      // to be used as accumulation input for next frames raytracing pass
      gl.useProgram(this.copyProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo);
      gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
      gl.bindTexture(gl.TEXTURE_2D, this.renderBuffer);
      gl.uniform1i(gl.getUniformLocation(this.copyProgram, "tex"), numTextureSlots);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);


      // display render pass
      gl.useProgram(this.displayProgram);
      gl.viewport(0, 0, this.displayRes[0], this.displayRes[1]);
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "tex"), numTextureSlots);
      gl.uniform1f(gl.getUniformLocation(this.displayProgram, "exposure"), this.exposure);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindTexture(gl.TEXTURE_2D, null);

      gl.useProgram(null);
      gl.bindVertexArray(null);

      this.frameCount++;

      if (num_samples !== -1 && this.frameCount >= num_samples) {
        renderingFinishedCB(); // finished rendering num_samples
        this.isRendering = false;
      }

      frameFinishedCB(this.frameCount);
      requestAnimationFrame(renderFrame);
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
    // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    this.copyBuffer = glu.createRenderBufferTexture(gl, null, width, height);
    this.copyFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.copyBuffer, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);
    // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private initRenderer() {
    this.resize(Math.floor(this.canvas.width), Math.floor(this.canvas.height));
    let gl = this.gl;
    // glu.printGLInfo(gl);

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
        vec3 color = texture(tex, uv).xyz;
        color = AcesFilm(color);
        color = pow(color, vec3(1.0/2.2));
        out_FragColor = vec4(color, 1.0);
      }`;

    this.copyProgram = glu.createProgramFromSource(gl, vertexShader, copyFragmentShader);
    this.displayProgram = glu.createProgramFromSource(gl, vertexShader, displayFragmentShader);

    // fullscreen quad position buffer
    const positions = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);
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

  private parseTexture(tex) {
    let texInfo = new TexInfo();

    let findTextureInList = (tex, texList) => {
      for (let i = 0; i < texList.length; i++) {
        if (tex.image.src === texList[i].image.src)
          return i;
      }
      return -1;
    };

    let res = [tex.image.width, tex.image.height].join(',');
    if (res in this.texArrayDict) {
      let texArrayIdx = this.texArrayDict[res];
      let texIdxInArray = findTextureInList(tex, this.texArrayList[texArrayIdx]);
      if (texIdxInArray < 0) {
        this.texArrayList[texArrayIdx].push(tex);
        texIdxInArray = this.texArrayList[texArrayIdx].length - 1;
      }
      texInfo.texArrayIdx = texArrayIdx;
      texInfo.texIdx = texIdxInArray;
    } else {
      this.texArrayDict[res] = this.texArrayList.length;
      let tex_array = [tex];
      this.texArrayList.push(tex_array);
      texInfo.texArrayIdx = this.texArrayList.length - 1;
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
      matTexInfo.albedoTexture = this.parseTexture(mat.map);
    }

    matInfo.metallic = mat.metalness || 0;
    matInfo.roughness = mat.roughness || 0;

    matInfo.cutoutOpacity = mat.opacity;
    matInfo.alphaCutoff = mat.alphaTest;
    if (mat.alphaTest == 0.0 && !mat.transparent)
      matInfo.alphaCutoff = 1.0;

    if (mat.metalnessMap) {
      matTexInfo.metallicRoughnessTexture = this.parseTexture(mat.metalnessMap);
    }

    if (mat.normalTexture) {
      matTexInfo.normalTexture = this.parseTexture(mat.normalTexture);
      matInfo.normalScale = mat.normalScale.x;
    }

    if (mat.emissiveMap) {
      matTexInfo.emissionTexture = this.parseTexture(mat.emissiveMap);
      matInfo.emission = mat.emissive.toArray();
    }


    matInfo.clearcoat = mat.clearcoat || 0;
    if (mat.clearcoatMap) {
      matTexInfo.clearcoatTexture = this.parseTexture(mat.clearcoatMap);
    }

    matInfo.clearcoatRoughness = mat.clearcoatRoughness || 0;
    if (mat.clearcoatRoughnessMap) {
      matTexInfo.clearcoatRoughnessTexture = this.parseTexture(mat.clearcoatRoughnessMap);
    }

    matInfo.sheen = mat.sheen || 0;

    matInfo.transmission = mat.transmission || 0;
    if (mat.transmissionMap) {
      matTexInfo.transmissionTexture = this.parseTexture(mat.transmissionMap);
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
      if ('3DS_materials_transmission' in extensions) {
        let ext = extensions["3DS_materials_transmission"];
        matInfo.transparency = get_param("transmissionFactor", ext, matInfo.transparency);
      }
      if ('KHR_materials_specular' in extensions) {
        let ext = extensions["KHR_materials_specular"];
        // matTexInfo.specularTexture = this.parseTexture(mat.);
        matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
        matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
      }
      if ('3DS_materials_specular' in extensions) {
        let ext = extensions["3DS_materials_specular"];
        matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
        matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
      }
      if ('KHR_materials_ior' in extensions) {
        matInfo.ior = get_param("ior", extensions["KHR_materials_ior"], matInfo.ior);
      }
      if ('3DS_materials_ior' in extensions) {
        matInfo.ior = get_param("ior", extensions["3DS_materials_ior"], matInfo.ior);
      }
      if ('KHR_materials_clearcoat' in extensions) {
        let ext = extensions["KHR_materials_clearcoat"];
        matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
        matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
      }
      if ('3DS_materials_clearcoat' in extensions) {
        let ext = extensions["3DS_materials_clearcoat"];
        matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
        matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
      }
      if ('KHR_materials_sheen' in extensions) {
        let ext = extensions["KHR_materials_sheen"];
        matInfo.sheenColor = get_param("sheenColorFactor", ext, matInfo.sheenColor);
        matInfo.sheenRoughness = get_param("sheenRoughnessFactor", ext, matInfo.sheenRoughness);
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

  setIBL(texture) {
    let gl = this.gl;
    if (this.ibl !== undefined)
      this.gl.deleteTexture(this.ibl);

    this.ibl = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.ibl);
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, texture.image.width, texture.image.height,
      0, gl.RGB, gl.FLOAT, texture.image.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.setUseIBL(true);
  }

  setScene(scene, callback?) {
    this.stopRendering();

    if (!scene) {
      throw new Error(
        'This model contains no scene, and cannot be viewed here. However,'
        + ' it may contain individual 3D resources.'
      );
    }
    //scene.applyMatrix4(y_to_z_up);

    let _this = this;
    this.createPathTracingScene(scene).then(() => {
      _this.resetAccumulation();

      if (callback !== undefined)
        callback();
    });
  }

  // Initializes all necessary pathtracing related data structures from three scene
  private async createPathTracingScene(scene) {
    console.time("Inititialized path-tracer");

    this.texArrayDict = {};
    for (let ta in this.texArrayList) {
      for (let t in this.texArrayList[ta]) {
        this.texArrayList[ta][t].dispose();
      }
    }
    this.texArrayList = [];

    let lights = [];
    let meshes = [];
    let materialBuffer = [];
    let materialTextureInfoBuffer = [];
    let triangleMaterialMarkers = [];

    scene.traverse((child) => {
      if (child.isMesh || child.isLight) {

        if (child.isMesh) {
          if (child.material.length > 0) {
            //for (let i = 0; i < child.material.length; i++)
            //new MaterialObject(child.material[i], pathTracingMaterialList);
            this.parseMaterial(child.material[0], materialBuffer, materialTextureInfoBuffer)
          } else {
            this.parseMaterial(child.material, materialBuffer, materialTextureInfoBuffer);
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
          let l = new Light();
          let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
          l.position = pos.toArray(); // TODO clarify why
          l.type = (child.type === "PointLight") ? 0 : 1;
          l.emission = child.color.multiplyScalar(child.intensity).toArray();
          lights.push(l);
        }
      }
    });

    var flattenedMeshList = [].concat.apply([], meshes);
    await this.prepareDataBuffers(flattenedMeshList, lights, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers);

    console.timeEnd("Inititialized path-tracer");
  };

  private async prepareDataBuffers(meshList, lightList, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers) {
    let gl = this.gl;

    let geoList = [];
    for (let i = 0; i < meshList.length; i++) {
      const geo = meshList[i].geometry.clone();
      geo.applyMatrix4(meshList[i].matrixWorld);

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

    let total_number_of_triangles = bufferGeometry.attributes.position.array.length / 9;

    console.time("BvhGeneration");
    //modelMesh.geometry.rotateY(Math.PI);

    var vpa = new Float32Array(bufferGeometry.attributes.position.array);
    if (bufferGeometry.attributes.normal === undefined)
      bufferGeometry.computeVertexNormals();

    var vna = new Float32Array(bufferGeometry.attributes.normal.array);
    var hasUVs = false;
    if (bufferGeometry.attributes.uv !== undefined) {
      var vuv = new Float32Array(bufferGeometry.attributes.uv.array);
      hasUVs = true;
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

      if (hasUVs) {
        vt0.set(vuv[6 * i + 0], vuv[6 * i + 1]);
        vt1.set(vuv[6 * i + 2], vuv[6 * i + 3]);
        vt2.set(vuv[6 * i + 4], vuv[6 * i + 5]);
      } else {
        vt0.set(0, 0);
        vt1.set(0, 0);
        vt2.set(0, 0);
      }

      let vn0 = new THREE.Vector3(vna[9 * i + 0], vna[9 * i + 1], vna[9 * i + 2]).normalize();
      let vn1 = new THREE.Vector3(vna[9 * i + 3], vna[9 * i + 4], vna[9 * i + 5]).normalize();
      let vn2 = new THREE.Vector3(vna[9 * i + 6], vna[9 * i + 7], vna[9 * i + 8]).normalize();

      let vp0 = new THREE.Vector3(vpa[9 * i + 0], vpa[9 * i + 1], vpa[9 * i + 2]);
      let vp1 = new THREE.Vector3(vpa[9 * i + 3], vpa[9 * i + 4], vpa[9 * i + 5]);
      let vp2 = new THREE.Vector3(vpa[9 * i + 6], vpa[9 * i + 7], vpa[9 * i + 8]);

      //TODO Move material index to a per triangle info data buffer
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

    let numChannels = 4;

    let bvh = new SimpleTriangleBVH(numChannels);
    bvh.build(position_buffer);

    let tangent_buffer;
    let hasTangents = hasUVs;
    if (hasUVs) { // tangents will only be generated when uvs are available
      tangent_buffer = new Float32Array(bufferGeometry.attributes.tangent.array);
    }
    bufferGeometry.dispose();

    var combinedMeshBuffer = null;
    combinedMeshBuffer = new Float32Array(position_buffer.length * 4);

    // now we need to reorder the tri data based on the bvh indices created during construction
    //!!TOOPT: do this in place
    let numAttributes = 4;
    let floatsPerSrcTriangle = 3 * numChannels;
    let floatsPerDstTriangle = 3 * numChannels * numAttributes;
    for (let i = 0; i < total_number_of_triangles; i++) { 
      let srcTriangleIdx = bvh.m_pTriIndices[i];
      for (let vertIdx = 0; vertIdx < 3; vertIdx++) { 
        for (let channelIdx = 0; channelIdx < numChannels; channelIdx++) { 
          let srcIdx = srcTriangleIdx * floatsPerSrcTriangle + vertIdx * numChannels + channelIdx;
          let dstIdx = i * floatsPerDstTriangle + vertIdx * numChannels * numAttributes + channelIdx;
          combinedMeshBuffer[dstIdx] = position_buffer[srcIdx];
          combinedMeshBuffer[dstIdx + 4] = normal_buffer[srcIdx];
          combinedMeshBuffer[dstIdx + 8] = uv_buffer[srcIdx];

          if (hasTangents) {
            combinedMeshBuffer[dstIdx + 12] = tangent_buffer[srcIdx];
          }
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

    // clear data textures and texture arrays
    for (let t in this.pathtracingTexturesArrays) {
      if (this.pathtracingTexturesArrays[t] !== undefined) {
        gl.deleteTexture(this.pathtracingTexturesArrays[t]);
      }
    }
    this.pathtracingTexturesArrays = {};
    for (let t in this.pathtracingDataTextures) {
      if (this.pathtracingDataTextures[t] !== undefined) {
        gl.deleteTexture(this.pathtracingDataTextures[t]);
      }
    }
    this.pathtracingDataTextures = {};

    this.pathtracingDataTextures["u_sampler2D_BVHData"] = glu.createDataTexture(gl, flatBVHData);
    this.pathtracingDataTextures["u_sampler2D_TriangleData"] = glu.createDataTexture(gl, combinedMeshBuffer);
    this.pathtracingDataTextures["u_sampler2D_MaterialData"] = glu.createDataTexture(gl, flatMaterialBuffer);
    this.pathtracingDataTextures["u_sampler2D_MaterialTexInfoData"] = glu.createDataTexture(gl, new Float32Array(valueList)); // TODO can be byte type

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

    // create texture arrays for current scene and
    // create shader snippet for texture array access
    let tex_array_shader_snippet = "";
    for (let i = 0; i < this.texArrayList.length; i++) {
      const texList = this.texArrayList[i];
      const texSize = texList[0].image.width * texList[0].image.height * 4;
      let data = new Uint8Array(texSize * texList.length);

      data.set(getImageData(texList[0].image).data);
      for (let t = 1; t < texList.length; t++) {
        data.set(getImageData(texList[t].image).data, texSize * t);
      }

      let texArray = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArray);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);

      // at some point three seems to enable flip_y unpack. We need to disable it as it is not supported by texImage3D
      // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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
          const float EPSILON  = 1e-8;

          const float MINIMUM_ROUGHNESS = 0.001;
          const float TFAR_MAX = 100000.0;

          const float RR_TERMINATION_PROB = 0.9;

          const uint MATERIAL_SIZE = 11u;
          const uint MATERIAL_TEX_INFO_SIZE = 10u;
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
    if (hasTangents) {
      let loc = gl.getUniformLocation(this.ptProgram, "u_bool_hasTangents");
      gl.uniform1i(loc, 1);
    }
    gl.useProgram(null);

    console.timeEnd("BvhGeneration");
    this.resetAccumulation();
  }
}
