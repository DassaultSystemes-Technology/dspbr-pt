import { MaterialData, TexInfo } from './material';

class Light {
  position = [1, 1, 1];
  type = 0;
  emission = [1, 1, 1];
  pad = 0;
}

export type SceneTextureColorSpace = 'linear' | 'srgb';

export interface SceneTextureLike {
  uuid: string;
  image: CanvasImageSource | null;
  colorSpace: SceneTextureColorSpace;
  offset: { x: number; y: number };
  repeat: { x: number; y: number };
  uvSet?: number;
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
  public get num_textures() { return this._texInfos.length; }

  private _texArrays = new Map<string, SceneTextureLike[]>();
  public get texArrays() { return this._texArrays; }

  private _triangleBuffer?: Float32Array;
  public set triangleBuffer(buffer: Float32Array | undefined) { this._triangleBuffer = buffer; }
  public get triangleBuffer(): Float32Array | undefined { return this._triangleBuffer; }
  public get vertexBuffer(): Float32Array | undefined { return this._triangleBuffer; }

  private _triangleIndexBuffer?: Uint32Array;
  public set triangleIndexBuffer(buffer: Uint32Array | undefined) { this._triangleIndexBuffer = buffer; }
  public get triangleIndexBuffer(): Uint32Array | undefined { return this._triangleIndexBuffer; }

  public get num_triangles() {
    if (this._triangleIndexBuffer) return this._triangleIndexBuffer.length / 3;
    return this._triangleBuffer ? this._triangleBuffer.length / (VERTEX_STRIDE * 3) : 0;
  }

  private _bvhPositionBuffer?: Float32Array;
  public set bvhPositionBuffer(buffer: Float32Array | undefined) { this._bvhPositionBuffer = buffer; }
  public get bvhPositionBuffer(): Float32Array | undefined { return this._bvhPositionBuffer; }

  private _bvhIndexBuffer?: Uint32Array;
  public set bvhIndexBuffer(buffer: Uint32Array | undefined) { this._bvhIndexBuffer = buffer; }
  public get bvhIndexBuffer(): Uint32Array | undefined { return this._bvhIndexBuffer; }

  public getPositionBuffer() {
    if (!this.triangleBuffer) return new Float32Array();
    const buffer = new Float32Array(this.triangleBuffer.length / VERTEX_STRIDE * 3);
    for (let i = 0; i < this.triangleBuffer.length / VERTEX_STRIDE; i++) {
      buffer[i * 3 + 0] = this.triangleBuffer[i * VERTEX_STRIDE + 0]!;
      buffer[i * 3 + 1] = this.triangleBuffer[i * VERTEX_STRIDE + 1]!;
      buffer[i * 3 + 2] = this.triangleBuffer[i * VERTEX_STRIDE + 2]!;
    }
    return buffer;
  }

  public addTexture(tex: SceneTextureLike): number {
    const texInfo = new TexInfo();

    const w = (tex.image as HTMLCanvasElement | null)?.width ?? 0;
    const h = (tex.image as HTMLCanvasElement | null)?.height ?? 0;
    const res = `${w},${h}`;

    if (this._texArrays.has(res)) {
      const texArray = this._texArrays.get(res)!;
      let texIdx = texArray.findIndex(t => t.uuid === tex.uuid);
      if (texIdx < 0) { texArray.push(tex); texIdx = texArray.length - 1; }
      let i = 0;
      for (const key of this._texArrays.keys()) {
        if (key === res) break;
        i++;
      }
      texInfo.texArrayIdx = i;
      texInfo.texIdx = texIdx;
    } else {
      this._texArrays.set(res, [tex]);
      texInfo.texArrayIdx = this._texArrays.size - 1;
      texInfo.texIdx = 0;
    }

    texInfo.texOffset = [tex.offset.x, tex.offset.y];
    texInfo.texScale  = [tex.repeat.x, tex.repeat.y];
    texInfo.uvSet = tex.uvSet ?? 0;

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
    if (this._materials.length === 0) return new Float32Array(0);
    const stride = this._materials[0]!.data.length;
    const result = new Float32Array(this._materials.length * stride);
    for (let i = 0; i < this._materials.length; i++) {
      result.set(this._materials[i]!.data, i * stride);
    }
    return result;
  }

  public getFlatTextureInfoBuffer(): Float32Array {
    if (this._texInfos.length === 0) return new Float32Array(0);
    const stride = this._texInfos[0]!.data.length;
    const result = new Float32Array(this._texInfos.length * stride);
    for (let i = 0; i < this._texInfos.length; i++) {
      result.set(this._texInfos[i]!.data, i * stride);
    }
    return result;
  }
}


export { TexInfo, MaterialData, Light };
