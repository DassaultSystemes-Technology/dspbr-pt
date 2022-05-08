
import { MaterialData, TexInfo } from './material';
import { Texture } from 'three'

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}

export const VERTEX_STRIDE = 20;

export class PathtracingSceneData {
  private _lights: Light[] = [];
  public get lights() { return this._lights; }

  private _materials: MaterialData[] = [];
  public get num_materials() { return this._materials.length; }
  public get materials() { return this._materials; }

  private _texInfos: TexInfo[] = [];
  public getTexInfo(idx: number) { return this._texInfos[idx]; }
  public get num_textures() { return this._texInfos.length; } // TODO numTexInfos != actual number of textures, since tex infos reference textures in tex array

  private _texArrays = new Map<string, Texture[]>();
  public get texArrays() { return this._texArrays; }

  private _triangleBuffer?: Float32Array;
  public set triangleBuffer(buffer: Float32Array) { this._triangleBuffer = buffer; }
  public get triangleBuffer() { return this._triangleBuffer; }
  public get num_triangles() { return this._triangleBuffer ? this._triangleBuffer.length / (VERTEX_STRIDE * 3) : 0 };

  public addTexture(tex: Texture): number {
    let texInfo = new TexInfo();

    let res = [tex.image.width, tex.image.height].join(',');
    if (this._texArrays.has(res)) {
      let texArray = this._texArrays.get(res)!;
      let texIdx = texArray.findIndex(t => t.uuid == tex.uuid);
      if (texIdx < 0) {
        texArray.push(tex);
        texIdx = texArray.length - 1;
      }

      let i = 0;
      // find index of element in map (js map stores entries in insertion order)
      // TODO find better alternative
      for (let key of this._texArrays.keys()) {
        if (key == res) break;
        i++
      }
      texInfo.texArrayIdx = i;
      texInfo.texIdx = texIdx;
    } else {
      this._texArrays.set(res, [tex]);
      texInfo.texArrayIdx = this._texArrays.size - 1;
      texInfo.texIdx = 0;
    }

    texInfo.texOffset = [tex.offset.x, tex.offset.y];
    texInfo.texScale = [tex.repeat.x, tex.repeat.y];

    texInfo.uvSet = 0; // TODO Handle second uv set

    this._texInfos.push(texInfo);
    return this._texInfos.length - 1;
  }

  public addMaterial(mat: MaterialData): number {
    this._materials.push(mat);
    return this._materials.length - 1;
  }

  public addLight(light: Light): number {
    this._lights.push(light);
    return this._lights.length - 1;
  }

  public getFlatMaterialBuffer(): Float32Array {
    let flatMaterialParamList = this._materials.map((matInfo: MaterialData) => {
      return Object.values(matInfo.data);
    });
    return new Float32Array(flattenArray(flatMaterialParamList));
  }

  public getFlatTextureInfoBuffer(): Float32Array {
    let flatTextureParamList = this._texInfos.map((texInfo: TexInfo) => {
      return flattenArray(texInfo.data);
    });
    return new Float32Array(flattenArray(flatTextureParamList));
  }
}

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

export { TexInfo, MaterialData, Light }