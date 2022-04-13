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

// @ts-ignore
import { PathtracingSceneData } from './scene_data'
import { PathtracingSceneDataAdapterWebGL2 } from './scene_data_adapter_webgl2'

import * as glu from './gl_utils';

import shader_constants from '/src/lib/shader/constants.glsl';
import copy_shader from '/src/lib/shader/copy.glsl';
import display_shader from '/src/lib/shader/display.frag';

import structs_shader from '/src/lib/shader/structs.glsl';
import rng_shader from '/src/lib/shader/rng.glsl';
import utils_shader from '/src/lib/shader/utils.glsl';
import material_shader from '/src/lib/shader/material.glsl';
import dspbr_shader from '/src/lib/shader/dspbr.glsl';
import bvh_shader from '/src/lib/shader/bvh.glsl';
import lighting_shader from '/src/lib/shader/lighting.glsl';
import diffuse_shader from '/src/lib/shader/bsdfs/diffuse.glsl';
import microfacet_shader from '/src/lib/shader/bsdfs/microfacet.glsl';
import sheen_shader from '/src/lib/shader/bsdfs/sheen.glsl';
import fresnel_shader from '/src/lib/shader/bsdfs/fresnel.glsl';
import iridescence_shader from '/src/lib/shader/bsdfs/iridescence.glsl';

import render_shader from '/src/lib/shader/renderer.frag';
import debug_integrator_shader from '/src/lib/shader/integrator/debug.glsl';
import pt_integrator_shader from '/src/lib/shader/integrator/pt.glsl';
import misptdl_integrator_shader from '/src/lib/shader/integrator/misptdl.glsl';

let vertexShader = ` #version 300 es
layout(location = 0) in vec4 position;
out vec2 v_uv;

void main()
{
  v_uv = position.xy;
  gl_Position = position;
}`;

class IBLImportanceSamplingData {
  pdf: WebGLTexture | null = null;
  cdf: WebGLTexture | null = null;
  yPdf: WebGLTexture | null = null;
  yCdf: WebGLTexture | null = null;
  width: number = 0;
  height: number = 0;
  totalSum: number = 0;
}

export interface PathtracingRendererParameters {
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext;
}

export class PathtracingRenderer {
  private gl: any;
  private canvas: any | undefined;

  private scene?: PathtracingSceneDataAdapterWebGL2;

  private ibl: WebGLTexture | null = null;
  private iblImportanceSamplingData: IBLImportanceSamplingData = new IBLImportanceSamplingData();

  private fbo: WebGLFramebuffer | null = null;
  private copyFbo: WebGLFramebuffer | null = null;
  private copyBuffer: WebGLTexture | null = null;
  private renderBuffer: WebGLTexture | null = null;

  private fbo_lr: WebGLFramebuffer | null = null;
  private copyFbo_lr: WebGLFramebuffer | null = null;
  private copyBuffer_lr: WebGLTexture | null = null;
  private renderBuffer_lr: WebGLTexture | null = null;

  private quadVao: WebGLVertexArrayObject | null = null;
  private ptProgram: WebGLProgram | null = null;
  private copyProgram: WebGLProgram | null = null;
  private displayProgram: WebGLProgram | null = null;
  private quadVertexBuffer: WebGLBuffer | null = null;

  private renderRes: [number, number] = [0, 0];
  private renderResLow: [number, number] = [0, 0];
  private displayRes: [number, number] = [0, 0];

  private _frameCount = 1;
  private _isRendering = false;
  private _currentAnimationFrameId = -1;


  private _exposure = 1.0;
  public get exposure() {
    return this._exposure;
  }
  public set exposure(val) {
    this._exposure = val;
    this.resetAccumulation();
  }

  public debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents", "Transparency", "UV0", "Clearcoat", "IBL PDF", "IBL CDF", "Specular", "SpecularTint", "Fresnel_Schlick"];
  private _debugMode: string = "None";
  public get debugMode() {
    return this._debugMode;
  }
  public set debugMode(val) {
    this._debugMode = val;
    this.resetAccumulation();
  }

  public renderModes = ["PT", "MISPTDL"];
  private _renderMode: string = "MISPTDL";
  public get renderMode() {
    return this._renderMode;
  }
  public set renderMode(val) {
    this._renderMode = val;
    this.resetAccumulation();
  }

  public tonemappingModes = ["None", "Reinhard", "Cineon", "AcesFilm"];
  private _tonemapping: string = "None";
  public get tonemapping() {
    return this._tonemapping;
  }
  public set tonemapping(val) {
    this._tonemapping = val;
    this.resetAccumulation();
  }

  public sheenGModes = ["Charlie", "Ashikhmin"];
  private _sheenG: string = "Charlie";
  public get sheenG() {
    return this._sheenG;
  }
  public set sheenG(val) {
    this._sheenG = val;
    this.resetAccumulation();
  }

  private _maxBounces = 8;
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

  private _pixelRatio = 1.0;
  public get pixelRatio() {
    return this._pixelRatio;
  }
  public set pixelRatio(val) {
    this._pixelRatio = val;
    this.resize(this.canvas.width, this.canvas.height);
    this.resetAccumulation();
  }

  private _pixelRatioLowRes = 0.1;
  public get pixelRatioLowRes() {
    return this._pixelRatioLowRes;
  }
  public set pixelRatioLowRes(val) {
    this._pixelRatioLowRes = val;
    this.resize(this.canvas.width, this.canvas.height);
    this.resetAccumulation();
  }

  private _lowResRenderMode = false;
  private setLowResRenderMode(flag: boolean) {
    this._lowResRenderMode = flag;
    this.resetAccumulation();
  }


  private _backgroundColor = [0.0, 0.0, 0.0, 1.0];
  public get backgroundColor() {
    return this._backgroundColor;
  }
  public set backgroundColor(val) {
    this._backgroundColor = val;
    this.resetAccumulation();
  }

  private _rayEps = 0.0001;
  public get rayEps() {
    return this._rayEps;
  }
  public set rayEps(val) {
    this._rayEps = val;
    this.resetAccumulation();
  }

  constructor(parameters: PathtracingRendererParameters = {}) {
    this.canvas = parameters.canvas ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = parameters.context ? parameters.context : this.canvas.getContext('webgl2', { alpha: true, powerPreference: "high-performance" });
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

    this.renderResLow = [Math.ceil(this.displayRes[0] * this._pixelRatioLowRes),
    Math.ceil(this.displayRes[1] * this._pixelRatioLowRes)];

    this.initFramebuffers();
    this.resetAccumulation();
    this._isRendering = true;
  }

  stopRendering() {
    this._isRendering = false;
};

  interruptFrame() {
    cancelAnimationFrame(this._currentAnimationFrameId);
  }

  renderFrame(camera: any, num_samples: number, frameFinishedCB: (frameCount: number) => void, renderingFinishedCB: () => void)
  {
    if (!this._isRendering) {
      return;
    }

    const fbo = this._lowResRenderMode ? this.fbo_lr : this.fbo;
    const copyFbo = this._lowResRenderMode ? this.copyFbo_lr : this.copyFbo;
    const renderRes = this._lowResRenderMode ? this.renderResLow : this.renderRes;
    const copyBuffer = this._lowResRenderMode ? this.copyBuffer_lr : this.copyBuffer;
    const renderBuffer = this._lowResRenderMode ? this.renderBuffer_lr : this.renderBuffer;

    let gl = this.gl;
    let numTextureSlots = this.bindPathtracingDataTextures(this.ptProgram!, 0);

    gl.useProgram(this.ptProgram);
    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, this.ibl);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler_env_map"),
      numTextureSlots++);

    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, this.iblImportanceSamplingData.pdf);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler_env_map_pdf"),
      numTextureSlots++);

    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, this.iblImportanceSamplingData.cdf);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler_env_map_cdf"),
      numTextureSlots++);

    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, this.iblImportanceSamplingData.yPdf);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler_env_map_yPdf"),
      numTextureSlots++);

    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, this.iblImportanceSamplingData.yCdf);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler_env_map_yCdf"),
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
    gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_ibl_rotation"),
      this._iblRotation);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_ShowBackground"),
      this._showBackground);
    gl.uniform4fv(gl.getUniformLocation(this.ptProgram, "u_BackgroundColor"),
      this._backgroundColor);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_max_bounces"),
      this._maxBounces);
    gl.uniform2i(gl.getUniformLocation(this.ptProgram, "u_ibl_resolution"),
      this.iblImportanceSamplingData.width, this.iblImportanceSamplingData.height);
    gl.uniform2f(gl.getUniformLocation(this.ptProgram, "u_vec2_InverseResolution"),
      1.0 / renderRes[0], 1.0 / renderRes[1]);
    gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_float_FocalLength"),
      camera.near);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_bool_forceIBLEval"),
      this._forceIBLEval);
    gl.uniform1f(gl.getUniformLocation(this.ptProgram, "u_float_ray_eps"),
      this._rayEps);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_int_RenderMode"),
      this.renderModes.indexOf(this._renderMode));

    gl.bindVertexArray(this.quadVao);
    gl.viewport(0, 0, renderRes[0], renderRes[1]);

    // pathtracing render pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, copyBuffer);
    gl.uniform1i(gl.getUniformLocation(this.ptProgram, "u_sampler2D_PreviousTexture"), numTextureSlots);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);

    if (!this._isRendering) {
      return;
    }
    // copy pathtracing render buffer
    // to be used as accumulation input for next frames raytracing pass
    gl.useProgram(this.copyProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, copyFbo);
    gl.activeTexture(gl.TEXTURE0 + numTextureSlots)
    gl.bindTexture(gl.TEXTURE_2D, renderBuffer);
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
    this._currentAnimationFrameId = requestAnimationFrame(() => {
      this.renderFrame(camera, num_samples, frameFinishedCB, renderingFinishedCB)
    });
  };

  render(camera: any, num_samples: number, frameFinishedCB: (frameCount: number) => void, renderingFinishedCB: () => void) {
    this._isRendering = true;
    this.resetAccumulation();

    this._currentAnimationFrameId = requestAnimationFrame(() => {
      this.renderFrame(camera, num_samples, frameFinishedCB, renderingFinishedCB)
    }); // start render loop
  }

  private initFramebuffers() {
    const gl = this.gl;
    if (this.fbo !== undefined) {
      gl.deleteFramebuffer(this.fbo);
      gl.deleteFramebuffer(this.copyFbo);
      gl.deleteFramebuffer(this.fbo_lr);
      gl.deleteFramebuffer(this.copyFbo_lr);
    }
    if (this.renderBuffer !== undefined) {
      gl.deleteTexture(this.renderBuffer);
      gl.deleteTexture(this.copyBuffer);
      gl.deleteTexture(this.renderBuffer_lr);
      gl.deleteTexture(this.copyBuffer_lr);
    }

    this.renderBuffer_lr = glu.createRenderBufferTexture(gl, null, this.renderResLow[0], this.renderResLow[1]);
    this.fbo_lr = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo_lr);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderBuffer_lr, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);
    // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    this.copyBuffer_lr = glu.createRenderBufferTexture(gl, null, this.renderResLow[0], this.renderResLow[1]);
    this.copyFbo_lr = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo_lr);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.copyBuffer_lr, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);
    // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    this.renderBuffer = glu.createRenderBufferTexture(gl, null, this.renderRes[0], this.renderRes[1]);
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderBuffer, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0
    ]);
    // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    this.copyBuffer = glu.createRenderBufferTexture(gl, null, this.renderRes[0], this.renderRes[1]);
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

    this.copyProgram = glu.createProgramFromSource(gl, vertexShader, copy_shader);
    this.displayProgram = glu.createProgramFromSource(gl, vertexShader, display_shader);

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

  setIBL(texture: any) {
    let gl = this.gl;
    if (this.ibl !== undefined) {
      this.gl.deleteTexture(this.ibl);
      this.gl.deleteTexture(this.iblImportanceSamplingData.pdf);
      this.gl.deleteTexture(this.iblImportanceSamplingData.cdf);
      this.gl.deleteTexture(this.iblImportanceSamplingData.yCdf);
      this.gl.deleteTexture(this.iblImportanceSamplingData.yPdf);
    }

    this.ibl = glu.createTexture(gl, gl.TEXTURE_2D, gl.RGBA32F, texture.image.width,
      texture.image.height, gl.RGBA, gl.FLOAT, texture.image.data, 0);
    this.iblImportanceSamplingData.width = texture.image.width;
    this.iblImportanceSamplingData.height = texture.image.height;

    //Importance sampling buffers
    this.iblImportanceSamplingData.pdf = glu.createTexture(gl, gl.TEXTURE_2D, gl.R32F, texture.image.width, texture.image.height, gl.RED, gl.FLOAT, texture.pcPDF, 0);
    this.iblImportanceSamplingData.cdf = glu.createTexture(gl, gl.TEXTURE_2D, gl.R32F, texture.image.width, texture.image.height, gl.RED, gl.FLOAT, texture.pcCDF, 0);
    this.iblImportanceSamplingData.yPdf = glu.createTexture(gl, gl.TEXTURE_2D, gl.R32F, texture.image.height, 1, gl.RED, gl.FLOAT, texture.yPDF, 0);
    this.iblImportanceSamplingData.yCdf = glu.createTexture(gl, gl.TEXTURE_2D, gl.R32F, texture.image.height, 1, gl.RED, gl.FLOAT, texture.yCDF, 0);
    // this.iblImportanceSamplingData.totalSum = texture.totalSum;

    this.resetAccumulation();
  }

  setScene(sceneData: PathtracingSceneData) {
    this.stopRendering();

    this.scene = new PathtracingSceneDataAdapterWebGL2(this.gl, sceneData);
    this.scene.generateGPUBuffers();

    this.initializeShaders();
    this.resetAccumulation();
  }

  private bindPathtracingDataTextures(program: WebGLProgram, startSlot: number) {
    const gl = this.gl;

    gl.useProgram(program);

    let texSlot = startSlot;
    let loc = -1;
    loc = gl.getUniformLocation(program, "u_sampler_bvh");
    gl.uniform1i(loc, texSlot);
    gl.activeTexture(gl.TEXTURE0 + texSlot++);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.bvhDataTexture);

    loc = gl.getUniformLocation(program, "u_sampler_triangle_data");
    gl.uniform1i(loc, texSlot);
    gl.activeTexture(gl.TEXTURE0 + texSlot++);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.triangleDataTexture);

    for (let t in this.scene?.texArrayTextures) {
      let loc = gl.getUniformLocation(program, t);
      gl.uniform1i(loc, texSlot);
      gl.activeTexture(gl.TEXTURE0 + texSlot++);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.scene?.texArrayTextures[t]);
    }

    const materialUniformBuffers = this.scene?.materialUniformBuffers!;
    for(let i=0; i<materialUniformBuffers.length; i++) {
      let matBlockIdx = gl.getUniformBlockIndex(program, `MaterialBlock${i}`);
      gl.uniformBlockBinding(program, matBlockIdx, i+1);
    }
    // const materialBlockSize = gl.getActiveUniformBlockParameter(
    //   program,
    //   matBlockIdx,
    //   gl.UNIFORM_BLOCK_DATA_SIZE
    // );
    //const expectedMaterialBlockSize = 240*this.scene!.sceneData.num_materials;

    let texInfoBlockIdx = gl.getUniformBlockIndex(program, "TextureInfoBlock");
    gl.uniformBlockBinding(program, texInfoBlockIdx, 0);
    // const textureInfoBlockSize = gl.getActiveUniformBlockParameter(
    //   program,
    //   texInfoBlockIdx,
    //   gl.UNIFORM_BLOCK_DATA_SIZE
    // );
    // const expectedTextureInfoBlockSize = 32*this.scene!.sceneData.num_textures;

    // if(materialBlockSize != expectedMaterialBlockSize)
    //   throw new Error(`Material uniform buffer WebGL expected size of ${materialBlockSize}doesn't match real size ${expectedMaterialBlockSize}. Check alignment and padding!`);
    // if(textureInfoBlockSize != expectedTextureInfoBlockSize)
    //   throw new Error(`Texture Block uniform buffer WebGL expected size of ${textureInfoBlockSize} doesn't match real size${expectedTextureInfoBlockSize}. Check alignment and padding!`);


    gl.useProgram(null);
    return texSlot;
  }

  private initializeShaders() {
    if (!this.scene) throw new Error("Scene not initialized");
    console.time("Pathtracing shader generation");

    const bufferAccessSnippet = `
    const uint MAX_TEXTURE_SIZE = ${glu.getMaxTextureSize(this.gl)}u;
    ivec2 getStructParameterTexCoord(uint structIdx, uint paramIdx, uint structStride) {
    return ivec2((structIdx * structStride + paramIdx) % MAX_TEXTURE_SIZE,
                (structIdx * structStride + paramIdx) / MAX_TEXTURE_SIZE);
    }
    `;

    const meshConstants = `
    const uint VERTEX_STRIDE = 5u;
    const uint TRIANGLE_STRIDE = 3u*VERTEX_STRIDE;
    const uint POSITION_OFFSET = 0u;
    const uint NORMAL_OFFSET = 1u;
    const uint UV_OFFSET = 2u;
    const uint TANGENT_OFFSET = 3u;
    const uint COLOR_OFFSET = 4u;
    const uint NUM_TRIANGLES = ${this.scene.sceneData.num_triangles}u;
    `;

    const materialBlock = `
    layout(std140) uniform TextureInfoBlock
    {
      TexInfo u_tex_infos[${this.scene.sceneData.num_textures}];
    };
    `

    console.log( this.scene.materialBufferShaderChunk);
    const shaderChunks = new Map<string, string>([
      ['structs', structs_shader],
      ['rng', rng_shader],
      ['constants', shader_constants],
      ['lights', this.scene.lightShaderChunk],
      ['utils', utils_shader],
      ['material', material_shader],
      ['buffer_accessor', bufferAccessSnippet],
      ['texture_accessor', this.scene.texAccessorShaderChunk],
      ['material_block', materialBlock + this.scene.materialBufferShaderChunk],
      ['dspbr', dspbr_shader],
      ['bvh', bvh_shader],
      ['lighting', lighting_shader],
      ['diffuse', diffuse_shader],
      ['microfacet', microfacet_shader],
      ['sheen', sheen_shader],
      ['fresnel', fresnel_shader],
      ['iridescence', iridescence_shader],
      ['debug_integrator', debug_integrator_shader],
      ['pt_integrator', pt_integrator_shader],
      ['misptdl_integrator', misptdl_integrator_shader],
      ['mesh_constants', meshConstants],
    ]);
    this.ptProgram = glu.createProgramFromSource(this.gl, vertexShader, render_shader, shaderChunks);
    console.timeEnd("Pathtracing shader generation");
  }
}
