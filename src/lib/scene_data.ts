
import { MaterialData, TexInfo, MaterialTextureInfo } from './material';
import { Texture } from 'three'

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}

export class PathtracingSceneData {
  private _lights: Light[] = [];
  public get lights() { return this._lights; }

  private _materials: MaterialData[] = [];
  private _materialTexInfos: MaterialTextureInfo[] = [];
  public get num_materials() { return this._materials.length };

  private _texArrayList: any[] = [];
  public get texArrayList() { return this._texArrayList; }

  private _texArrayDict: { [idx: string]: any; } = {};
  public get texArrayDict() { return this._texArrayDict; }

  private _triangleBuffer?: Float32Array;
  public set triangleBuffer(buffer: Float32Array) { this._triangleBuffer = buffer;}
  public get num_triangles() { return this._triangleBuffer ? this._triangleBuffer.length / 3 : 0 };

  private _bvhBuffer?: Float32Array;
  public set bvhBuffer(buffer: Float32Array) {
    this._bvhBuffer = buffer;
  }

  public addTexture(tex: Texture) {
    let texInfo = new TexInfo();

    let findTextureInList = (tex: Texture, texList: Texture[]) => {
      for (let i = 0; i < texList.length; i++) {
        if (tex.uuid === texList[i].uuid)
          return i;
      }
      return -1;
    };

    let res = [tex.image.width, tex.image.height].join(',');
    if (res in this._texArrayDict) {
      let texArrayIdx = this._texArrayDict[res];
      let texIdxInArray = findTextureInList(tex, this._texArrayList[texArrayIdx]);
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

  public addMaterial(mat: MaterialData, matTexInfo: MaterialTextureInfo) {
    this._materials.push(mat);
    this._materialTexInfos.push(matTexInfo);
  }

  public addLight(light: Light) {
    this._lights.push(light);
  }

  public getFlatBvhBuffer(): Float32Array | undefined {
    return this._bvhBuffer;
  }

  public getFlatTriangleDataBuffer(): Float32Array | undefined {
    return this._triangleBuffer;
  }

  public getFlatMaterialBuffer(): Float32Array {
    let flatMaterialParamList = this._materials.map((matInfo: MaterialData) => {
      return Object.values(matInfo.data);
    });
    return new Float32Array(flattenArray(flatMaterialParamList));
  }

  public getFlatMaterialTextureInfoBuffer(): Float32Array {
    let flatTextureParamList = this._materialTexInfos.map(matTexInfo => {
      let texInfos = Object.values(matTexInfo);
      return texInfos.map((texInfo: TexInfo) => {
        return flattenArray(texInfo.data);
      });
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


export { MaterialTextureInfo, TexInfo, MaterialData, Light }