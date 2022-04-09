import { Scene } from 'three';
import * as glu from './gl_utils';
import { PathtracingSceneData, MaterialTextureInfo, TexInfo, MaterialData, Light } from './scene_data';


export class PathtracingSceneDataAdapterWebGL2 {
  private _gl: WebGL2RenderingContext;
  private _sceneData: PathtracingSceneData;
    public get sceneData() { return this._sceneData;}

  private _bvhDataTexture?: WebGLTexture;
  public get bvhDataTexture() { return this._bvhDataTexture; }

  private _triangleDataTexture?: WebGLTexture;
  public get triangleDataTexture() { return this._triangleDataTexture; }

  private _materialDataTexture?: WebGLTexture;
  public get materialDataTexture() { return this._materialDataTexture; }

  private _materialTextureInfoDataTexture?: WebGLTexture;
  public get materialTextureInfoDataTexture() { return this._materialTextureInfoDataTexture; }

  private _texArrays: { [k: string]: WebGLTexture | null } = {};
  public get texArrays() { return this._texArrays; }

  private _texArrayShaderSnippet: string = "";
  public get texArrayShaderSnippet() { return this._texArrayShaderSnippet; }

  private _lightShaderSnippet: string = "";
  public get lightShaderSnippet() { return this._lightShaderSnippet; }

  constructor(gl: WebGL2RenderingContext, sceneData: PathtracingSceneData) {
    this._gl = gl;
    this._sceneData = sceneData;
  }

  public generateGPUDataBuffers() {
    console.time("Generate gpu data buffers");
    const gl = this._gl;
    this.clear();
    this._bvhDataTexture = glu.createDataTexture(gl, this._sceneData.getFlatBvhBuffer());
    this._triangleDataTexture = glu.createDataTexture(gl, this._sceneData.getFlatTriangleDataBuffer());
    this._materialDataTexture = glu.createDataTexture(gl, this._sceneData.getFlatMaterialBuffer());
    this._materialTextureInfoDataTexture = glu.createDataTexture(gl, this._sceneData.getFlatMaterialTextureInfoBuffer());

    this.generateTextureArrayBuffers();
    this.generateLightBuffers();

    console.timeEnd("Generate gpu data buffers");
  }

  private generateTextureArrayBuffers() {
    const gl = this._gl;
    const texArrayList = this._sceneData.texArrayList;
    for (let i = 0; i < texArrayList.length; i++) {
      const texList = texArrayList[i];
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

      this._texArrays[`u_sampler2DArray_MaterialTextures_${i}`] = texArray;
      this._texArrayShaderSnippet += `uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};\n`
    }

    this._texArrayShaderSnippet += `
    struct TexInfo {
      int texArrayIdx;
      int texIdx;
      int texCoordSet;
      int pad;
      vec2 texOffset;
      vec2 texScale;
    };\n`


    this._texArrayShaderSnippet += "\n";
    this._texArrayShaderSnippet += "vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) { \n";
    this._texArrayShaderSnippet += `  if(texInfo.texArrayIdx < 0) return vec4(1.0);\n`
    for (let i = 0; i < this._sceneData.texArrayList.length; i++) {
      this._texArrayShaderSnippet += `    if(texInfo.texArrayIdx == ${i}) {\n`
      this._texArrayShaderSnippet += `        vec2 tuv = texCoord * texInfo.texScale + texInfo.texOffset;`
      this._texArrayShaderSnippet += `        return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.texIdx));\n`
      this._texArrayShaderSnippet += "   }\n";
    }

    this._texArrayShaderSnippet += `       return vec4(1.0);\n`
    this._texArrayShaderSnippet += "}\n";
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
      this._lightShaderSnippet = `
      #define HAS_POINT_LIGHT 1
      const vec3 cPointLightPosition = vec3(${pos[0]}, ${pos[1]}, ${pos[2]});
      const vec3 cPointLightEmission = vec3(${em[0]}, ${em[1]}, ${em[2]});
      `;
    }
  }

  public clear() {
    const gl = this._gl;
    if (this._bvhDataTexture) gl.deleteTexture(this._bvhDataTexture);
    if (this._triangleDataTexture) gl.deleteTexture(this._triangleDataTexture);
    if (this._materialDataTexture) gl.deleteTexture(this._materialDataTexture);
    if (this._materialTextureInfoDataTexture) gl.deleteTexture(this._materialTextureInfoDataTexture);

    for (let t in this._texArrays) {
      if (this._texArrays[t] !== undefined) {
        gl.deleteTexture(this._texArrays[t]);
      }
    }
  }
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
