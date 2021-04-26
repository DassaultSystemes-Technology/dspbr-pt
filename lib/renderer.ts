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
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
export { PerspectiveCamera } from 'three';

import * as glu from './gl_utils';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimpleTriangleBVH } from './bvh';
import { MaterialData, TexInfo, MaterialTextureInfo } from './material';
import { Scene } from 'three';

type DebugMode = "None" | "Albedo" | "Metalness" | "Roughness" | "Normals" | "Tangents" | "Bitangents" | "Transparency" | "UV0" | "Clearcoat";
type TonemappingMode = "None" | "Reinhard" | "Cineon" | "AcesFilm";
type SheenMode = "Charlie" | "Ashikhmin";

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}


export interface PathtracingRendererParameters {
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext;
}

export class PathtracingRenderer {
  private gl: any;
  private canvas: any | undefined;

  private texArrayList: any[] = [];
  private texArrayDict: { [idx: string]: any; } = {};

  private ibl: WebGLTexture | null = null;
  private renderBuffer: WebGLTexture | null = null;
  private copyBuffer: WebGLTexture | null = null;
  private copyFbo: WebGLFramebuffer | null = null;
  private fbo: WebGLFramebuffer | null = null;
  private quadVao: WebGLVertexArrayObject | null = null;
  private ptProgram: WebGLProgram | null = null;
  private copyProgram: WebGLProgram | null = null;
  private displayProgram: WebGLProgram | null = null;
  private quadVertexBuffer: WebGLBuffer | null = null;

  private pathtracingDataTextures: { [k: string]: WebGLTexture | null } = {};
  private pathtracingTexturesArrays: { [k: string]: WebGLTexture | null } = {};

  private renderRes: [number, number] = [0, 0];
  private displayRes: [number, number] = [0, 0];

  private _exposure = 1.0;
  public get exposure() {
    return this._exposure;
  }
  public set exposure(val) {
    this._exposure = val;
    this.resetAccumulation();
  }

  public debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents", "Transparency", "UV0", "Clearcoat"];
  private _debugMode: DebugMode = "None";
  public get debugMode() {
    return this._debugMode;
  }
  public set debugMode(val) {
    this._debugMode = val;
    this.resetAccumulation();
  }

  public tonemappingModes = ["None", "Reinhard", "Cineon", "AcesFilm"];
  private _tonemapping: TonemappingMode = "None";
  public get tonemapping() {
    return this._tonemapping;
  }
  public set tonemapping(val) {
    this._tonemapping = val;
    this.resetAccumulation();
  }

  public sheenGModes = ["Charlie", "Ashikhmin"];
  private _sheenG: SheenMode = "Charlie";
  public get sheenG() {
    return this._sheenG;
  }
  public set sheenG(val) {
    this._sheenG = val;
    this.resetAccumulation();
  }

  private _maxBounces = 4;
  public get maxBounces() {
    return this._maxBounces;
  }
  public set maxBounces(val) {
    this._maxBounces = val;
    this.resetAccumulation();
  }

  private _useIBL = true;
  public get useIBL() {
    return this._useIBL;
  }
  public set useIBL(val) {
    this._useIBL = val;
    this.resetAccumulation();
  }

  private _showBackground = true;
  public get showBackground() {
    return this._showBackground;
  }
  public set showBackground(val) {
    this._showBackground = val;
    this.resetAccumulation();
  }

  private _forceIBLEval = false;
  public get forceIBLEval() {
    return this._forceIBLEval;
  }
  public set forceIBLEval(val) {
    this._forceIBLEval = val;
    this.resetAccumulation();
  }

  private _enableGamma = true;
  public get enableGamma() {
    return this._enableGamma;
  }
  public set enableGamma(val) {
    this._enableGamma = val;
    this.resetAccumulation();
  }

  private _iblRotation = 0.0;
  public get iblRotation() {
    return this._iblRotation / Math.PI * 180.0;
  }
  public set iblRotation(val) {
    this._iblRotation = val / 180.0 * Math.PI;
    this.resetAccumulation();
  }

  private _iblSampling = false;
  public get iblSampling() {
    return this._iblSampling;
  }
  public set iblSampling(val) {
    this._iblSampling = val;
    this.resetAccumulation();
  }

  private _pixelRatio = 1.0;
  public get pixelRatio() {
    return this._pixelRatio;
  }
  public set pixelRatio(val) {
    this._pixelRatio = val;
    this.resize(this.canvas.width, this.canvas.height);
    this.resetAccumulation();
  }

  private _backgroundColor = [0.0, 0.0, 0.0];
  public get backgroundColor() {
    return this._backgroundColor;
  }
  public set backgroundColor(val) {
    this._backgroundColor = val;
    this.resetAccumulation();
  }

  private _frameCount = 1;
  private _isRendering = false;

  constructor(parameters?: PathtracingRendererParameters) {
    this.canvas = parameters.canvas ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = parameters.context ? parameters.context : this.canvas.getContext('webgl2');
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.getExtension('OES_texture_float_linear');

    this.initRenderer();
  }

  resetAccumulation() {
    this._frameCount = 1;
  }

  resize(width: number, height: number) {
    this._isRendering = false;
    this.displayRes = [width, height];
    this.renderRes = [Math.ceil(this.displayRes[0] * this._pixelRatio),
    Math.ceil(this.displayRes[1] * this._pixelRatio)];

    this.initFramebuffers(this.renderRes[0], this.renderRes[1]);
    this.resetAccumulation();
    this._isRendering = true;
  }

  stopRendering() {
    this._isRendering = false;
  };

  render(camera: THREE.PerspectiveCamera, num_samples: number, frameFinishedCB: (frameCount: number) => void, renderingFinishedCB: () => void) {
    if (camera instanceof THREE.Camera === false) {
      console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }

    this._isRendering = true;
    this.resetAccumulation();

    let renderFrame = () => {
      if (!this._isRendering) {
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
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_samplerCube_EnvMap"),
        numTextureSlots++);

      let filmHeight = Math.tan(camera.fov * 0.5 * Math.PI / 180.0) * camera.near;
      gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_float_FilmHeight"),
        filmHeight);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.ptProgram, "u_mat4_ViewMatrix"), false,
        new Float32Array(camera.matrixWorld.elements));
      gl.uniform3f(gl.getUniformLocation(this.ptProgram, "u_vec3_CameraPosition"),
        camera.position.x, camera.position.y, camera.position.z);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_int_FrameCount"),
        this._frameCount);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_int_DebugMode"),
        this.debugModes.indexOf(this._debugMode));
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_int_SheenG"),
        this.sheenGModes.indexOf(this._sheenG));
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_UseIBL"),
        this._useIBL);
      gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_float_iblRotation"),
        this._iblRotation);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_iblSampling"),
        this._iblSampling);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_ShowBackground"),
        this._showBackground);
      gl.uniform3fv(gl.getUniformLocation(this.ptProgram, "u_vec3_BackgroundColor"),
        this._backgroundColor);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_int_maxBounces"),
        this._maxBounces);
      gl.uniform2f(gl.getUniformLocation(this.ptProgram, "u_vec2_InverseResolution"),
        1.0 / this.renderRes[0], 1.0 / this.renderRes[1]);
      gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_float_FocalLength"),
        camera.near);
      gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_forceIBLEval"),
        this._forceIBLEval);

      gl.bindVertexArray(this.quadVao);
      gl.viewport(0, 0, this.renderRes[0], this.renderRes[1]);

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
      gl.uniform1f(gl.getUniformLocation(this.displayProgram, "exposure"), this._exposure);
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "gamma"), this._enableGamma);
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "tonemappingMode"),
        this.tonemappingModes.indexOf(this._tonemapping));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindTexture(gl.TEXTURE_2D, null);

      gl.useProgram(null);
      gl.bindVertexArray(null);

      this._frameCount++;

      if (num_samples !== -1 && this._frameCount >= num_samples) {
        renderingFinishedCB(); // finished rendering num_samples
        this._isRendering = false;
      }

      frameFinishedCB(this._frameCount);
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

  private async initRenderer() {
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

    let displayFragmentShader = await <Promise<string>>filePromiseLoader('./shader/display.frag');
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

  private parseTexture(tex: THREE.Texture) {
    let texInfo = new TexInfo();

    let findTextureInList = (tex: THREE.Texture, texList: THREE.Texture[]) => {
      for (let i = 0; i < texList.length; i++) {
        if (tex.uuid === texList[i].uuid)
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


  private async parseMaterial(mat: THREE.MeshPhysicalMaterial, gltf?: GLTF) {
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

    if (mat.normalMap) {
      matTexInfo.normalTexture = this.parseTexture(mat.normalMap);
      matInfo.normalScale = mat.normalScale.x;
    }

    matInfo.emission = mat.emissive.toArray();
    if (mat.emissiveMap) {
      matTexInfo.emissionTexture = this.parseTexture(mat.emissiveMap);
    }

    matInfo.clearcoat = mat.clearcoat || 0;
    if (mat.clearcoatMap) {
      matTexInfo.clearcoatTexture = this.parseTexture(mat.clearcoatMap);
    }

    matInfo.clearcoatRoughness = mat.clearcoatRoughness || 0;
    if (mat.clearcoatRoughnessMap) {
      matTexInfo.clearcoatRoughnessTexture = this.parseTexture(mat.clearcoatRoughnessMap);
    }

    matInfo.transparency = mat.transmission || 0;
    if (mat.transmissionMap) {
      matTexInfo.transmissionTexture = this.parseTexture(mat.transmissionMap);
    }

    if (gltf) {
      let setTextureTransformFromExt = (texInfo: TexInfo, ext: any) => {
        if ("extensions" in ext && "KHR_texture_transform" in ext.extensions) {
          let transform = ext.extensions["KHR_texture_transform"];
          if ("offset" in transform)
            texInfo.texOffset = transform["offset"];
          if ("scale" in transform)
            texInfo.texScale = transform["scale"];
        }
      };

      if ("gltfExtensions" in mat.userData) {

        let get_param = function (name: string, obj: any, default_value: any) {
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
        if ('3DS_materials_transparency' in extensions) {
          let ext = extensions["3DS_materials_transparency"];
          matInfo.transparency = get_param("transparencyFactor", ext, matInfo.transparency);
        }
        if ('KHR_materials_specular' in extensions) {
          let ext = extensions["KHR_materials_specular"];
          matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
          matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);

          if ("specularTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.specularTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.specularTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.specularTexture, ext.specularTexture);
              });
          }
          if ("specularColorTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.specularColorTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.specularColorTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.specularColorTexture, ext.specularColorTexture);
              });
          }
        }
        if ('3DS_materials_specular' in extensions) {
          let ext = extensions["3DS_materials_specular"];
          matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
          matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);

          if ("specularTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.specularTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.specularTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.specularTexture, ext.specularTexture);
              });
          }
          if ("specularColorTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.specularColorTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.specularColorTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.specularColorTexture, ext.specularColorTexture);
              });
          }
        }
        if ('KHR_materials_ior' in extensions) {
          matInfo.ior = get_param("ior", extensions["KHR_materials_ior"], matInfo.ior);
        }
        if ('3DS_materials_ior' in extensions) {
          matInfo.ior = get_param("ior", extensions["3DS_materials_ior"], matInfo.ior);
        }
        if ('3DS_materials_clearcoat' in extensions) {
          let ext = extensions["3DS_materials_clearcoat"];
          matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
          matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
        }
        if ('KHR_materials_sheen' in extensions) {
          let ext = extensions["KHR_materials_sheen"];
          matInfo.sheen = 1.0;
          matInfo.sheenColor = get_param("sheenColorFactor", ext, matInfo.sheenColor);
          matInfo.sheenRoughness = get_param("sheenRoughnessFactor", ext, matInfo.sheenRoughness);

          if ("sheenColorTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.sheenColorTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.sheenColorTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.sheenColorTexture, ext.sheenColorTexture);
              });
          }
          if ("sheenRoughnessTexture" in ext) {
            await gltf.parser.getDependency('texture', ext.sheenRoughnessTexture.index)
              .then((tex: THREE.Texture) => {
                matTexInfo.sheenRoughnessTexture = this.parseTexture(tex);
                setTextureTransformFromExt(matTexInfo.sheenRoughnessTexture, ext.sheenRoughnessTexture);
              });
          }
        }
        if ('3DS_materials_sheen' in extensions) {
          let ext = extensions["3DS_materials_sheen"];
          matInfo.sheen = get_param("sheenFactor", ext, matInfo.sheen);
          matInfo.sheenColor = get_param("sheenColorFactor", ext, matInfo.sheenColor);
          matInfo.sheenRoughness = get_param("sheenRoughnessFactor", ext, matInfo.sheenRoughness);
        }
        if ('KHR_materials_translucency' in extensions) {
          let ext = extensions["KHR_materials_translucency"];
          matInfo.translucency = get_param("translucencyFactor", ext, matInfo.transparency);
          // if ("translucencyTexture" in ext) {
          //   await this._gltf.parser.getDependency('texture', ext.translucencyTexture.index)
          //     .then((tex) => {
          //       matTexInfo.translucencyTexture = this.parseTexture(tex);
          //       setTextureTransformFromExt(matTexInfo.translucencyTexture, ext.translucencyTexture);
          //     });
          // }
        }
        if ('KHR_materials_volume' in extensions) {
          let ext = extensions["KHR_materials_volume"];
          matInfo.thinWalled = get_param("thicknessFactor", ext, 0.0) > 0.0 ? 0 : 1;
          matInfo.attenuationColor = get_param("attenuationColor", ext, matInfo.attenuationColor);
          matInfo.attenuationDistance = get_param("attenuationDistance", ext, matInfo.attenuationDistance);
        }
        if ('3DS_materials_volume' in extensions) {
          let ext = extensions["3DS_materials_volume"];
          matInfo.thinWalled = get_param("thinWalled", ext, matInfo.thinWalled);
          matInfo.attenuationColor = get_param("attenuationColor", ext, matInfo.attenuationColor);
          matInfo.attenuationDistance = get_param("attenuationDistance", ext, matInfo.attenuationDistance);
          matInfo.subsurfaceColor = get_param("subsurfaceColor", ext, matInfo.subsurfaceColor);
        }
        // if ('KHR_materials_sss' in extensions) {
        //   let ext = extensions["KHR_materials_sss"];
        //   matInfo.scatterColor = get_param("scatterColor", ext, matInfo.scatterColor);
        //   matInfo.scatterDistance = get_param("scatterDistance", ext, matInfo.scatterDistance);
        // }
      }
    }

    return [matInfo, matTexInfo];
  }

  setIBL(texture: any) {
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.resetAccumulation();
  }

  setScene(scene: THREE.Group, gltf?: GLTF) {
    this.stopRendering();
    
    return new Promise<void>((resolve, rejecct) => {
      this.createPathTracingScene(scene, gltf).then(() => {
        this.resetAccumulation();
        resolve();
      });
    });
  }

  // Initializes all necessary pathtracing related data structures from three scene
  private async createPathTracingScene(scene: THREE.Group, gltf?: GLTF) {
    console.time("Inititialized path-tracer");

    this.texArrayDict = {};
    for (let ta in this.texArrayList) {
      for (let t in this.texArrayList[ta]) {
        this.texArrayList[ta][t].dispose();
      }
    }
    this.texArrayList = [];

    let lights: Light[] = [];
    let meshes: THREE.Mesh[] = [];
    let materialBuffer: MaterialData[] = [];
    let materialTextureInfoBuffer: MaterialTextureInfo[] = [];
    let triangleMaterialMarkers: number[] = [];
    let materials: THREE.MeshPhysicalMaterial[] = [];

    scene.traverse((child: any) => {
      if (child.isMesh || child.isLight) {

        if (child.isMesh) {
          if (child.material.length > 0) {
            materials.push(child.material[0]);
          } else {
            materials.push(child.material);
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

    for (let m in materials) {
      const [matInfo, matTexInfo] = await this.parseMaterial(materials[m], gltf);
      materialBuffer.push(<MaterialData>matInfo);
      materialTextureInfoBuffer.push(<MaterialTextureInfo>matTexInfo);
    }

    await this.prepareDataBuffers(meshes, lights, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers);

    console.timeEnd("Inititialized path-tracer");
  };

  private async prepareDataBuffers(meshList: THREE.Mesh[], lightList: Light[], materialBuffer: MaterialData[], materialTextureInfoBuffer: MaterialTextureInfo[], triangleMaterialMarkers: number[]) {
    let gl = this.gl;

    let geoList: THREE.BufferGeometry[] = [];
    for (let i = 0; i < meshList.length; i++) {
      let geo: THREE.BufferGeometry = <THREE.BufferGeometry>meshList[i].geometry.clone();
      geo.applyMatrix4(meshList[i].matrixWorld);

      // mergeBufferGeometries expects consitent attributes throughout all geometries, otherwise it fails
      // we need to get rid of unsupported attributes
      const supportedAttributes = ["position", "normal", "tangent", "uv", "uv2", "color"];

      for (let attr in geo.attributes) {
        if (!supportedAttributes.includes(attr))
          delete geo.attributes[attr];
      }

      if (!geo.attributes.normal)
        geo.computeVertexNormals();
      if (geo.attributes.uv  && !geo.attributes.tangent)
        BufferGeometryUtils.computeTangents(geo);

      const numVertices = geo.attributes.position.count;
      if (!geo.attributes.uv) {
        const uvs = new Float32Array(numVertices * 2);
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      }
      if (!geo.attributes.uv2) {
        const uvs = new Float32Array(numVertices * 2);
        geo.setAttribute('uv2', new THREE.BufferAttribute(uvs, 2));
      }
      if (!geo.attributes.tangent) {
        const tangents = new Float32Array(numVertices * 4);
        geo.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
      }
      if (!geo.attributes.color) {
        const col = new Float32Array(numVertices * 4);
        geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
      }

      geo.morphAttributes = {};
      geo.morphTargetsRelative = false;;

      geoList.push(geo);
    }

    // Merge geometry from all models into a single mesh
    // TODO get rid of this extra merge step and merge directly into the render data buffer
    let modelMesh = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geoList));
    let bufferGeometry = <THREE.BufferGeometry>modelMesh.geometry;
    if (bufferGeometry.index)
      bufferGeometry = bufferGeometry.toNonIndexed();

    let total_number_of_triangles = bufferGeometry.attributes.position.count / 3;

    console.time("BvhGeneration");
    var vpa = new Float32Array(total_number_of_triangles * 12);
    var vna = bufferGeometry.attributes.normal.array;
    var vuv = bufferGeometry.attributes.uv.array;
    var vuv2 = bufferGeometry.attributes.uv2.array;
    let tga = bufferGeometry.attributes.tangent.array;
    let col = bufferGeometry.attributes.color.array;

    let materialIdx = 0;
    let pos = bufferGeometry.attributes.position.array;
    for (let i = 0; i < total_number_of_triangles; i++) {
      if (i >= triangleMaterialMarkers[materialIdx]) {
        materialIdx++;
      }
      vpa[i * 12 + 0] = pos[i * 9 + 0];
      vpa[i * 12 + 1] = pos[i * 9 + 1];
      vpa[i * 12 + 2] = pos[i * 9 + 2];
      vpa[i * 12 + 3] = materialIdx;

      vpa[i * 12 + 4] = pos[i * 9 + 3];
      vpa[i * 12 + 5] = pos[i * 9 + 4];
      vpa[i * 12 + 6] = pos[i * 9 + 5];
      vpa[i * 12 + 7] = materialIdx;

      vpa[i * 12 + 8] = pos[i * 9 + 6];
      vpa[i * 12 + 9] = pos[i * 9 + 7];
      vpa[i * 12 + 10] = pos[i * 9 + 8];
      vpa[i * 12 + 11] = materialIdx;
    }

    let bvh = new SimpleTriangleBVH(4);
    bvh.build(vpa);

    const numFloatsPerVertex = 20;
    var combinedMeshBuffer = new Float32Array(total_number_of_triangles * 3 * numFloatsPerVertex);
    for (let i = 0; i < total_number_of_triangles; i++) {
      let srcTriangleIdx = bvh.m_pTriIndices[i];

      for (let vertIdx = 0; vertIdx < 3; vertIdx++) {
        let dstIdx = i * numFloatsPerVertex * 3 + vertIdx * numFloatsPerVertex;

        // position
        let srcIdx = srcTriangleIdx * 12 + vertIdx * 4;
        combinedMeshBuffer[dstIdx + 0] = vpa[srcIdx + 0];
        combinedMeshBuffer[dstIdx + 1] = vpa[srcIdx + 1];
        combinedMeshBuffer[dstIdx + 2] = vpa[srcIdx + 2];
        combinedMeshBuffer[dstIdx + 3] = vpa[srcIdx + 3];

        // normal
        srcIdx = srcTriangleIdx * 9 + vertIdx * 3;
        combinedMeshBuffer[dstIdx + 4] = vna[srcIdx + 0];
        combinedMeshBuffer[dstIdx + 5] = vna[srcIdx + 1];
        combinedMeshBuffer[dstIdx + 6] = vna[srcIdx + 2];
        combinedMeshBuffer[dstIdx + 7] = 0.0;

        // uv0
        srcIdx = srcTriangleIdx * 6 + vertIdx * 2;
        combinedMeshBuffer[dstIdx + 8] = vuv[srcIdx];
        combinedMeshBuffer[dstIdx + 9] = vuv[srcIdx + 1];

        // uv1
        combinedMeshBuffer[dstIdx + 10] = vuv2[srcIdx];
        combinedMeshBuffer[dstIdx + 11] = vuv2[srcIdx + 1];

        // tangent
        srcIdx = srcTriangleIdx * 12 + vertIdx * 4;

        combinedMeshBuffer[dstIdx + 12] = tga[srcIdx + 0];
        combinedMeshBuffer[dstIdx + 13] = tga[srcIdx + 1];
        combinedMeshBuffer[dstIdx + 14] = tga[srcIdx + 2];
        combinedMeshBuffer[dstIdx + 15] = tga[srcIdx + 3];

        // color
        combinedMeshBuffer[dstIdx + 16] = col[srcIdx + 0];
        combinedMeshBuffer[dstIdx + 17] = col[srcIdx + 1];
        combinedMeshBuffer[dstIdx + 18] = col[srcIdx + 2];
        combinedMeshBuffer[dstIdx + 19] = col[srcIdx + 3];
      }
    }

    bufferGeometry.dispose();

    let flatBVHData = bvh.createAndCopyToFlattenedArray_StandardFormat();

    let flatMaterialParamList = materialBuffer.map((matInfo) => {
      return Object.values(matInfo.data);
    });

    let flatTextureParamList = materialTextureInfoBuffer.map(matTexInfo => {
      let texInfos = Object.values(matTexInfo);
      return texInfos.map(texInfo => {
        return flattenArray(texInfo.data);
      });
    });

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
    this.pathtracingDataTextures = {} as { [k: string]: WebGLTexture | null };
    this.pathtracingDataTextures["u_sampler2D_BVHData"] = glu.createDataTexture(gl, flatBVHData);
    this.pathtracingDataTextures["u_sampler2D_TriangleData"] = glu.createDataTexture(gl, combinedMeshBuffer);
    this.pathtracingDataTextures["u_sampler2D_MaterialData"] = glu.createDataTexture(gl, new Float32Array(flattenArray(flatMaterialParamList)));
    this.pathtracingDataTextures["u_sampler2D_MaterialTexInfoData"] = glu.createDataTexture(gl, new Float32Array(flattenArray(flatTextureParamList))); // TODO can be byte type

    let shaderChunks: { [k: string]: string } = {};
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
    function getImageData(image: ImageBitmap) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height);
      } else {
        throw Error("Couldn't parse image data from texture");
      }
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

      console.log(`Create texture array: ${texList[0].image.width} x ${texList[0].image.height} x ${texList.length}`)

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

    let vertexShader = await <Promise<string>>filePromiseLoader('./shader/pt.vert');
    let fragmentShader = await <Promise<string>>filePromiseLoader('./shader/pt.frag');

    shaderChunks['pathtracing_rng'] = await <Promise<string>>filePromiseLoader('./shader/rng.glsl');
    shaderChunks['pathtracing_utils'] = await <Promise<string>>filePromiseLoader('./shader/utils.glsl');
    shaderChunks['pathtracing_material'] = await <Promise<string>>filePromiseLoader('./shader/material.glsl');
    shaderChunks['pathtracing_dspbr'] = await <Promise<string>>filePromiseLoader('./shader/dspbr.glsl');
    shaderChunks['pathtracing_rt_kernel'] = await <Promise<string>>filePromiseLoader('./shader/rt_kernel.glsl');

    shaderChunks['pathtracing_defines'] = `
          const float PI =               3.14159265358979323;
          const float TWO_PI =           6.28318530717958648;
          const float FOUR_PI =          12.5663706143591729;
          const float ONE_OVER_PI =      0.31830988618379067;
          const float ONE_OVER_TWO_PI =  0.15915494309;
          const float ONE_OVER_FOUR_PI = 0.07957747154594767;
          const float PI_OVER_TWO =      1.57079632679489662;
          const float ONE_OVER_THREE =   0.33333333333333333;
          const float E =                2.71828182845904524;
          const float INFINITY =         1000000.0;

          const float EPS_NORMAL = 0.001;
          const float EPS_COS = 0.001;
          const float EPS_PDF = 0.001;
          const float EPSILON  = 1e-8;

          const float MINIMUM_ROUGHNESS = 0.0001;
          const float TFAR_MAX = 100000.0;

          const float RR_TERMINATION_PROB = 0.9;

          const uint MATERIAL_SIZE = 9u;
          const uint MATERIAL_TEX_INFO_SIZE = 11u;
          const uint TEX_INFO_SIZE = 2u;
          
          const uint VERTEX_STRIDE = 5u;
          const uint TRIANGLE_STRIDE = 3u*VERTEX_STRIDE;
          const uint POSITION_OFFSET = 0u;
          const uint NORMAL_OFFSET = 1u;
          const uint UV_OFFSET = 2u;
          const uint TANGENT_OFFSET = 3u;
          const uint COLOR_OFFSET = 4u;

          const uint NUM_TRIANGLES = ${total_number_of_triangles}u;
          const uint MAX_TEXTURE_SIZE = ${glu.getMaxTextureSize(gl)}u;
      `;

    this.ptProgram = glu.createProgramFromSource(gl, vertexShader, fragmentShader, shaderChunks);

    gl.useProgram(this.ptProgram);

    let numTextureSlots = 0;
    for (let t in this.pathtracingDataTextures) {
      let loc = gl.getUniformLocation(this.ptProgram, t);
      gl.uniform1i(loc, numTextureSlots++);
    }
    for (let t in this.pathtracingTexturesArrays) {
      let loc = gl.getUniformLocation(this.ptProgram, t);
      gl.uniform1i(loc, numTextureSlots++);
    }

    gl.useProgram(null);

    console.timeEnd("BvhGeneration");
    this.resetAccumulation();
  }
}

const fileLoader = new THREE.FileLoader();
function filePromiseLoader(url: string, onProgress?: () => void) {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    fileLoader.load(url, resolve, onProgress, reject);
  });
};

function flattenArray(arr: any, result: number[] = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value: any = arr[i];
    if (Array.isArray(value)) {
      flattenArray(value, result);
    } else {
      result.push(<number>value);
    }
  }
  return result;
};
