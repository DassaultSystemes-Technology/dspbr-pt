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

import constants_shader_source from '/src/lib/shader/constants.glsl';
import copy_shader from '/src/lib/shader/copy.glsl';
import display_shader from '/src/lib/shader/display.frag';
import rng_shader_source from '/src/lib/shader/rng.glsl';
import utils_shader_source from '/src/lib/shader/utils.glsl';
import material_shader_souce from '/src/lib/shader/material.glsl';
import dspbr_shader_source from '/src/lib/shader/dspbr.glsl';
import bvh_shader_source from '/src/lib/shader/bvh.glsl';
import lighting_shader from '/src/lib/shader/lighting.glsl';
import diffuse_shader_source from '/src/lib/shader/bsdfs/diffuse.glsl';
import microfacet_shader_source from '/src/lib/shader/bsdfs/microfacet.glsl';
import sheen_shader_source from '/src/lib/shader/bsdfs/sheen.glsl';
import fresnel_shader_source from '/src/lib/shader/bsdfs/fresnel.glsl';
import iridescence_shader_source from '/src/lib/shader/bsdfs/iridescence.glsl';

import ray_gen_shader_source from '/src/lib/shader/wavefront/ray_gen.glsl';
import trace_shader_source from '/src/lib/shader/wavefront/trace.glsl';
import bounce_shader_source from '/src/lib/shader/wavefront/bounce.glsl';

// import render_shader from '/src/lib/shader/renderer.frag';
// import wavefront_integrator_shader from '/src/lib/shader/wavefront/.glsl';

let fs_quad_shader_source = ` #version 300 es
layout(location = 0) in vec4 position;
out vec2 v_uv;

void main()
{
  v_uv = position.xy;
  gl_Position = position;
}`;

export enum RenderResolutionMode {
  Low,
  High
}

class IBLImportanceSamplingData {
  pdf: WebGLTexture | null = null;
  cdf: WebGLTexture | null = null;
  yPdf: WebGLTexture | null = null;
  yCdf: WebGLTexture | null = null;
  width: number = 0;
  height: number = 0;
  totalSum: number = 0;
}

type RenderParams = {
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext;
}

export class WavefrontRenderer {
  private gl: any;
  private canvas: any | undefined;

  private scene?: PathtracingSceneDataAdapterWebGL2;

  private ibl: WebGLTexture | null = null;
  private iblImportanceSamplingData: IBLImportanceSamplingData = new IBLImportanceSamplingData();

  private fbos: Map<string, WebGLFramebuffer> = new Map<string, WebGLFramebuffer>();
  private renderBuffers: Map<string, WebGLTexture> = new Map<string, WebGLTexture>();
  private shaders: Map<string, WebGLProgram> = new Map<string, WebGLTexture>();

  private quadVao: WebGLVertexArrayObject | null = null;
  private ptProgram: WebGLProgram | null = null;
  private copyProgram: WebGLProgram | null = null;
  private displayProgram: WebGLProgram | null = null;
  private quadVertexBuffer: WebGLBuffer | null = null;

  private renderRes = new Map<RenderResolutionMode, [number, number]>();
  private displayRes: [number, number] = [0, 0];

  private frameCount = 1;
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

  // public renderModes = ["PT", "MISPTDL"];
  // private _renderMode: string = "MISPTDL";
  // public get renderMode() {
  //   return this._renderMode;
  // }
  // public set renderMode(val) {
  //   this._renderMode = val;
  //   this.resetAccumulation();
  // }

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

  private _renderResMode = RenderResolutionMode.High;
  private set renderResMode(mode: RenderResolutionMode) {
    this._renderResMode = mode;
    this.resetAccumulation();
  }
  private get renderResMode() { return this._renderResMode; }

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

  private _lowResRenderMode = false;
  private setLowResRenderMode(flag: boolean) {
    this._lowResRenderMode = flag;
    this.resetAccumulation();
  }


  constructor(parameters: RenderParams = {}) {
    this.canvas = parameters.canvas ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.gl = parameters.context ? parameters.context : this.canvas.getContext('webgl2', { alpha: true, powerPreference: "high-performance" });
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.getExtension('OES_texture_float_linear');

    this.resize(Math.floor(this.canvas.width), Math.floor(this.canvas.height));
    this.initVao();
    this.initFramebuffers();
  }

  resetAccumulation() {
    this.frameCount = 1;
  }

  resize(width: number, height: number) {
    this._isRendering = false;
    this.displayRes = [width, height];
    console.log(this.displayRes);

    this.renderRes.set(RenderResolutionMode.High, [Math.ceil(this.displayRes[0] * this._pixelRatio),
    Math.ceil(this.displayRes[1] * this._pixelRatio)]);

    this.renderRes.set(RenderResolutionMode.Low, [Math.ceil(this.displayRes[0] * this._pixelRatioLowRes),
    Math.ceil(this.displayRes[1] * this._pixelRatioLowRes)]);

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

  private rayGenRenderPass(camera: any, renderRes: [number, number]) {
    const gl = this.gl;

    let filmHeight = Math.tan(camera.fov * 0.5 * Math.PI / 180.0) * camera.near;


    const program = this.shaders.get("ray_gen");
    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, "u_film_height"), filmHeight);
    gl.uniform1i(gl.getUniformLocation(program, "u_frame_count"), this.frameCount);
    gl.uniform1i(gl.getUniformLocation(program, "u_max_bounces"), this.maxBounces);
    gl.uniform2f(gl.getUniformLocation(program, "u_inv_res"), 1.0 / renderRes![0], 1.0 / renderRes![1]);
    gl.uniform3f(gl.getUniformLocation(program, "u_cam_pos"), camera.position.x, camera.position.y, camera.position.z);
    gl.uniform1f(gl.getUniformLocation(program, "u_focal_length"), camera.near);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_view_mat"), false, new Float32Array(camera.matrixWorld.elements));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(null);
  }

  private traceRenderPass() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("ray_dir"));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("ray_org"));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.bvhDataTexture);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.triangleDataTexture);

    // gl.viewport(0, 0, this.displayRes[0], this.displayRes[1]);

    const program = this.shaders.get("trace");
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_ray_dir"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_ray_org"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_bvh"), 2);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_triangle_data"), 3);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(null);
  }

  private bounceRenderPass() {
    const gl = this.gl;
    const program = this.shaders.get("bounce");

    let slot = 0;
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("hitpos_matid"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_hitpos_matid"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("shading_normal"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_shading_normal"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("geometry_normal"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_geometry_normal"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("tangent"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_tangent"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("uv"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_uv"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffers.get("ray_dir"));
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_indir"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.materialDataTexture);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_material_data"), slot++);

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.scene?.materialTextureInfoDataTexture);
    gl.uniform1i(gl.getUniformLocation(program, "u_sampler_material_texinfo_data"), slot++);

    for (let t in this.scene?.texArrays) {
      gl.activeTexture(gl.TEXTURE0 + slot);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.scene?.texArrays[t]);
      gl.uniform1i(gl.getUniformLocation(program, t), slot++);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(null);
  }

  renderFrame(camera: any, num_samples: number, frameFinishedCB: (frameCount: number) => void, renderingFinishedCB: () => void) {
    if (!this._isRendering) return;

    const gl = this.gl;
    const renderRes = this.renderRes.get(this.renderResMode);

    gl.bindVertexArray(this.quadVao);
    gl.viewport(0, 0, renderRes![0], renderRes![1]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos.get("ray_gen"));
    // for(let i=0; i<8; i++) {
    this.rayGenRenderPass(camera, renderRes!);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos.get("intersection_state"));
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.traceRenderPass();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbos.get("bounce"));
    if (!this._isRendering) return;
    this.bounceRenderPass();
    // }
    gl.bindVertexArray(null);

    this.frameCount++;

    if (num_samples !== -1 && this.frameCount >= num_samples) {
      renderingFinishedCB(); // finished rendering num_samples
      this._isRendering = false;
    }

    frameFinishedCB(this.frameCount);
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
    console.time("Initializing Framebuffers");
    const gl = this.gl;

    const fbos = this.fbos;
    const renderBuffers = this.renderBuffers;
    const renderRes = this.renderRes.get(RenderResolutionMode.High);

    // cleanup
    for (let fbo in fbos.values()) {
      gl.deleteFramebuffer(fbo);
    }
    for (let tex in renderBuffers.values()) {
      gl.deleteTexture(tex);
    }
    fbos.clear();
    renderBuffers.clear();

    const rayGenFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rayGenFbo);
    renderBuffers.set("ray_org", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    renderBuffers.set("ray_dir", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderBuffers.get("ray_org"), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, renderBuffers.get("ray_dir"), 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1
    ]);
    fbos.set("ray_gen", rayGenFbo);

    const intersectionStateFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, intersectionStateFbo);
    renderBuffers.set("hitpos_matid", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    renderBuffers.set("shading_normal", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    renderBuffers.set("geometry_normal", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    renderBuffers.set("tangent", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    renderBuffers.set("uv", glu.createRenderBufferTexture(gl, null, renderRes![0], renderRes![1])!);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderBuffers.get("hitpos_matid"), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, renderBuffers.get("shading_normal"), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, renderBuffers.get("geometry_normal"), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, renderBuffers.get("tangent"), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT4, gl.TEXTURE_2D, renderBuffers.get("uv"), 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3,
      gl.COLOR_ATTACHMENT4,
    ]);
    fbos.set("intersection_state", intersectionStateFbo);

    console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // this.copyBuffer_lr = glu.createRenderBufferTexture(gl, null, this.renderResLow[0], this.renderResLow[1]);
    // this.copyFbo_lr = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo_lr);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.copyBuffer_lr, 0);
    // gl.drawBuffers([
    //   gl.COLOR_ATTACHMENT0
    // ]);
    // // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    // this.renderBuffer = glu.createRenderBufferTexture(gl, null, this.renderRes[0], this.renderRes[1]);
    // this.fbo = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderBuffer, 0);
    // gl.drawBuffers([
    //   gl.COLOR_ATTACHMENT0
    // ]);
    // // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    // this.copyBuffer = glu.createRenderBufferTexture(gl, null, this.renderRes[0], this.renderRes[1]);
    // this.copyFbo = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.copyFbo);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.copyBuffer, 0);
    // gl.drawBuffers([
    //   gl.COLOR_ATTACHMENT0
    // ]);
    // // console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));

    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    console.timeEnd("Initializing Framebuffers");
  }

  private async initVao() {
    let gl = this.gl;
    // glu.printGLInfo(gl);


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
    this.scene.generateGPUDataBuffers();

    this.initializeShaders();
    this.resetAccumulation();
  }

  private initializeShaders() {
    console.time("Pathtracing shader generation");
    const gl = this.gl;
    if (!this.scene) throw new Error("Scene not initialized");

    for (let s in this.shaders.values()) {
      gl.deleteProgram(s);
    }
    this.shaders.clear();

    this.shaders.set("copy", glu.createProgramFromSource(gl, fs_quad_shader_source, copy_shader));
    this.shaders.set("display", glu.createProgramFromSource(gl, fs_quad_shader_source, display_shader));

    const rayGenShaderSourceDependencies = new Map<string, string>([
      ["rng", rng_shader_source]
    ]);
    this.shaders.set("ray_gen", glu.createProgramFromSource(this.gl,
      fs_quad_shader_source, ray_gen_shader_source, rayGenShaderSourceDependencies));

    const meshConstants = `
      const uint VERTEX_STRIDE = 5u;
      const uint TRIANGLE_STRIDE = 3u*VERTEX_STRIDE;
      const uint POSITION_OFFSET = 0u;
      const uint NORMAL_OFFSET = 1u;
      const uint UV_OFFSET = 2u;
      const uint TANGENT_OFFSET = 3u;
      const uint COLOR_OFFSET = 4u;
      const uint NUM_TRIANGLES = ${this.scene.sceneData.num_triangles}u;
      const uint MAX_TEXTURE_SIZE = ${glu.getMaxTextureSize(this.gl)}u;
    `;

    const traceShaderSourceDependencies = new Map<string, string>([
      ["constants", constants_shader_source],
      ["mesh_constants", meshConstants],
      ["utils", utils_shader_source],
      ["bvh", bvh_shader_source]
    ]);
    this.shaders.set("trace", glu.createProgramFromSource(this.gl,
      fs_quad_shader_source, trace_shader_source, traceShaderSourceDependencies));

    const materialConstants = `
        const uint MATERIAL_SIZE = 11u;
        const uint MATERIAL_TEX_INFO_SIZE = 15u;
        const uint TEX_INFO_SIZE = 2u;
        const uint MAX_TEXTURE_SIZE = ${glu.getMaxTextureSize(this.gl)}u;
    `;

    const bounceShaderSourceDependencies = new Map<string, string>([
      ["constants", constants_shader_source],
      ["material_constants", materialConstants],
      ["tex_array_lookup", this.scene.texArrayShaderSnippet],
      ["utils", utils_shader_source],
      ["diffuse", diffuse_shader_source],
      ["sheen", sheen_shader_source],
      ["fresnel", fresnel_shader_source],
      ["iridescence", iridescence_shader_source],
      ["microfacet", microfacet_shader_source],
      ["material", material_shader_souce],
      ["dspbr", dspbr_shader_source]
    ]);
    this.shaders.set("bounce", glu.createProgramFromSource(this.gl,
      fs_quad_shader_source, bounce_shader_source, bounceShaderSourceDependencies));

    console.timeEnd("Pathtracing shader generation");
  }
}
