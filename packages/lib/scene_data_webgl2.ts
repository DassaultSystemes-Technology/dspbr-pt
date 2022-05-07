import { Scene } from 'three';
import * as glu from './gl_utils';
import { PathtracingSceneData } from './scene_data';

export class PathtracingSceneDataWebGL2 {
  private gl: WebGL2RenderingContext;
  private _sceneData: PathtracingSceneData;
  public get sceneData() { return this._sceneData; }

  private _triangleDataTexture?: WebGLTexture;
  public get triangleDataTexture() { return this._triangleDataTexture; }

  private _materialUniformBuffers: WebGLBuffer[] = [];
  public get materialUniformBuffers() { return this._materialUniformBuffers; }
  private _materialBufferShaderChunk: string = "";
  public get materialBufferShaderChunk() { return this._materialBufferShaderChunk; }

  private _textureInfoUniformBuffer?: WebGLBuffer;
  public get textureInfoUniformBuffer() { return this._textureInfoUniformBuffer; }
  private _texAccessorShaderChunk: string = "";
  public get texAccessorShaderChunk() { return this._texAccessorShaderChunk; }

  private _texArrayTextures: { [k: string]: WebGLTexture | null } = {};
  public get texArrayTextures() { return this._texArrayTextures; }

  private _lightShaderChunk: string = "";
  public get lightShaderChunk() { return this._lightShaderChunk; }

  private _textureDataUsage = 0;

  constructor(gl: WebGL2RenderingContext, sceneData: PathtracingSceneData) {
    this.gl = gl;
    this._sceneData = sceneData;
  }

  public clear() {
    const gl = this.gl;
    if (this._triangleDataTexture) gl.deleteTexture(this._triangleDataTexture);
    if (this._textureInfoUniformBuffer) gl.deleteBuffer(this._textureInfoUniformBuffer);

    this._materialUniformBuffers.map((ubo: WebGLBuffer) => { gl.deleteBuffer(ubo); })

    for (let t in this._texArrayTextures) {
      if (this._texArrayTextures[t] !== undefined) {
        gl.deleteTexture(this._texArrayTextures[t]);
      }
    }
  }

  public generateGPUBuffers() {
    console.time("Generate gpu data buffers");
    const gl = this.gl;
    this.clear();

    this._triangleDataTexture = glu.createDataTexture(gl, this._sceneData.triangleBuffer);
 
    this.generateTextureArrays();
    this.generateUniformMaterialBuffers()
    this.generateLightBuffers();

    console.timeEnd("Generate gpu data buffers");

    // const textureUsage = this._textureDataUsage / (1024 * 1024);
    // const geometryUsage = triangleData.length * 4 / (1024 * 1024);
    // const bvhUsage = bvhData.length * 4 / (1024 * 1024);
    // console.log(`GPU Memory Consumption (MB):
    // Texture: ${textureUsage.toFixed(2)}
    // Geometry: ${geometryUsage.toFixed(2)}
    // Bvh:      ${bvhUsage.toFixed(2)}
    // Total:    ${(textureUsage + geometryUsage + bvhUsage).toFixed(2)}
    // `);
  }

  // TODO I won't understand this garbage the next time I look it. Simplify!
  private generateUniformMaterialBuffers() {
    const gl = this.gl;
    const numMaterials = this._sceneData.num_materials;
    const materialDataSize = this._sceneData.materials[0].data.byteLength;
    const maxBlockSize = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE);

    const materialsPerBlock = Math.floor(maxBlockSize / materialDataSize);
    const numRequiredMaterialBlocks = Math.ceil(numMaterials / materialsPerBlock);

    const materialListFlat = this._sceneData.getFlatMaterialBuffer();
    const numValuesPerMaterial = this._sceneData.materials[0].data.length;

    this._materialBufferShaderChunk = "";
    let numMaterialsToUpload = this._sceneData.num_materials;
    for (let i = 0; i < numRequiredMaterialBlocks; i++) {
      const numMaterialsThisBlock = Math.min(materialsPerBlock, numMaterialsToUpload);
      var materialUniformBuffer = gl.createBuffer();
      this._materialBufferShaderChunk += `
      layout(std140) uniform MaterialBlock${i}
      {
        MaterialData u_materials_${i}[${numMaterialsThisBlock}];
      };
      `
      gl.bindBuffer(gl.UNIFORM_BUFFER, materialUniformBuffer);
      const start = numValuesPerMaterial * materialsPerBlock * i;
      const end = start + numMaterialsThisBlock * numValuesPerMaterial;
      const materialsArraySlice = materialListFlat.slice(start, end);
      gl.bufferData(gl.UNIFORM_BUFFER, materialsArraySlice, gl.STATIC_DRAW);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, i + 2, materialUniformBuffer);
      this._materialUniformBuffers.push(materialUniformBuffer!);

      numMaterialsToUpload -= materialsPerBlock;
    }

    this._materialBufferShaderChunk += `
    MaterialData get_material(uint idx) {
      MaterialData data;
    `;
    for (let i = 1; i <= numRequiredMaterialBlocks; i++) {
      this._materialBufferShaderChunk +=
        `
        if(idx < ${materialsPerBlock * i}u) {
          return u_materials_${i - 1}[idx - ${materialsPerBlock * (i - 1)}u];
        }
      `;
    }
    this._materialBufferShaderChunk += `
    return data;
    }`;

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  }

  private generateTextureArrays() {
    const gl = this.gl;
    const texArrays = this._sceneData.texArrays;

    // create texture arrays
    const getImageData = (image: ImageBitmap) => {
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

    let i = 0;
    for (const textureList of texArrays.values()) {
      const width = textureList[0].image.width;
      const height = textureList[0].image.height;
      const texSize = width * height * 4;
      let data = new Uint8Array(texSize * textureList.length);

      this._textureDataUsage += data.length;

      data.set(getImageData(textureList[0].image).data);
      for (let t = 1; t < textureList.length; t++) {
        data.set(getImageData(textureList[t].image).data, texSize * t);
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
        width,
        height,
        textureList.length,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
      );
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);

      console.log(`Create material texture array: ${width} x ${height} x ${textureList.length}`)

      this._texArrayTextures[`u_sampler2DArray_MaterialTextures_${i}`] = texArray;
      this._texAccessorShaderChunk += `
      uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};
      `

      i++;
    }

    this._texAccessorShaderChunk += `
    vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) {
    `;

    for (let i = 0; i < texArrays.size; i++) {
      this._texAccessorShaderChunk += `
      if(int(texInfo.tex_array_idx) == ${i}) {
        vec2 tuv = texCoord * texInfo.scale + texInfo.offset;
        return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.tex_idx));
      }`;
    }

    this._texAccessorShaderChunk += `
      return vec4(1.0);
    }`

    var _textureInfoUniformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, _textureInfoUniformBuffer);
    const texInfoListFlat = this._sceneData.getFlatTextureInfoBuffer();
    gl.bufferData(gl.UNIFORM_BUFFER, texInfoListFlat, gl.STATIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, _textureInfoUniformBuffer);

    if(texArrays.size > 0) {
      this._texAccessorShaderChunk +=
      `layout(std140) uniform TextureInfoBlock
      {
        TexInfo u_tex_infos[${this.sceneData.num_textures}];
      };

      vec4 get_texture_value(float tex_info_id, vec2 uv) {
        return tex_info_id < 0.0 ? vec4(1,1,1,1) : evaluateMaterialTextureValue(u_tex_infos[int(tex_info_id)], uv);
      }
      `
    } else {
      this._texAccessorShaderChunk += `
      vec4 get_texture_value(float tex_info_id, vec2 uv) {
        return vec4(1,1,1,1);
      }
      `
    }
  }

  private generateLightBuffers() {
    const lights = this._sceneData.lights;
    if (lights.length > 0) {
      // lightTexture = createDataTexture(lightList, THREE.RGBAFormat, THREE.FloatType);
      // THREE.ShaderChunk[ 'lights' ] = `
      // #define HAS_LIGHTS 1
      // const uint LIGHT_SIZE = 2u;
      // uniform sampler2D u_sampler2D_LightData;
      // const int numLights = ${lightList.length};
      //`
      //_pathTracingUniforms["u_sampler2D_LightData"] = {type: "t", value: lightTexture};

      let pos = lights[0].position;
      let em = lights[0].emission;
      this._lightShaderChunk = `
      #define HAS_POINT_LIGHT 1
      const vec3 cPointLightPosition = vec3(${pos[0]}, ${pos[1]}, ${pos[2]});
      const vec3 cPointLightEmission = vec3(${em[0]}, ${em[1]}, ${em[2]});
      `;
    }
  }
}

