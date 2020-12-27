export class MaterialData {
  private _data = new Float32Array(36);

  public get data() {
    return this._data;
  }

  public set albedo(val: number[]) {
    this._data[0] = val[0];
    this._data[1] = val[1];
    this._data[2] = val[2];
  }

  public set metallic(val: number) {
    this._data[3] = val;
  }

  public set roughness(val: number) {
    this._data[4] = val;
  }

  public set anisotropy(val: number) {
    this._data[5] = val;
  }

  public set anisotropyRotation(val: number) {
    this._data[6] = val;
  }

  public set transparency(val: number) {
    this._data[7] = val;
  }

  public set cutoutOpacity(val: number) {
    this._data[8] = val;
  }
  public set sheen(val: number) {
    this._data[9] = val;
  }
  public set normalScale(val: number) {
    this._data[10] = val;
  }
  public set ior(val: number) {
    this._data[11] = val;
  }

  public set specular(val: number) {
    this._data[12] = val;
  }

  public set specularTint(val: number[]) {
    this._data[13] = val[0];
    this._data[14] = val[1];
    this._data[15] = val[2];
  }

  public set sheenRoughness(val: number) {
    this._data[16] = val;
  }

  public set sheenColor(val: number[]) {
    this._data[17] = val[0];
    this._data[18] = val[1];
    this._data[19] = val[2];
  }

  public set normalScaleClearcoat(val: number) {
    this._data[20] = val;
  }

  public set emission(val: number[]) {
    this._data[21] = val[0];
    this._data[22] = val[1];
    this._data[23] = val[2];
  }

  public set clearcoat(val: number) {
    this._data[24] = val;
  }
  public set clearcoatRoughness(val: number) {
    this._data[25] = val;
  }
  public set translucency(val: number) {
    this._data[26] = val;
  }
  public set alphaCutoff(val: number) {
    this._data[27] = val;
  }

  public set attenuationDistance(val: number) {
    this._data[28] = val;
  }

  public set attenuationColor(val: number[]) {
    this._data[29] = val[0];
    this._data[30] = val[1];
    this._data[31] = val[2];
  }

  public set subsurfaceColor(val: number[]) {
    this._data[32] = val[0];
    this._data[33] = val[1];
    this._data[34] = val[2];
  }

  public set thinWalled(val: number) {
    this._data[35] = val;
  }

  constructor() {
    this.albedo = [1, 1, 1];
    this.metallic = 0;

    this.roughness = 0;
    this.anisotropy = 0;
    this.anisotropyRotation = 0;
    this.transparency = 0;

    this.cutoutOpacity = 1;
    this.sheen = 0; // deprecated
    this.normalScale = 1;
    this.ior = 1;

    this.specular = 1;
    this.specularTint = [1, 1, 1];

    this.sheenRoughness = 0;
    this.sheenColor = [1, 1, 1];

    this.normalScaleClearcoat = 1;
    this.emission = [0, 0, 0];

    this.clearcoat = 0;
    this.clearcoatRoughness = 0;
    this.translucency = 0;
    this.alphaCutoff = 0;

    this.attenuationDistance = 100000;
    this.attenuationColor = [1, 1, 1];

    this.subsurfaceColor = [1, 1, 1];
    this.thinWalled = 1;
  }
}

export class TexInfo {
  private _data = new Float32Array(8);

  public get data() {
    return this._data;
  }
  
  public set texArrayIdx(val: number) {
    this._data[0] = val;
  }
  public set texIdx(val: number) {
    this._data[1] = val;
  }
  public set texCoordSet(val: number) {
    this._data[2] = val;
  }
  public set texOffset(val: number[]) {
    this._data[4] = val[0];
    this._data[5] = val[1];
  }
  public set texScale(val: number[]) {
    this._data[6] = val[0];
    this._data[7] = val[1];
  }

  constructor() {
    this.texArrayIdx = -1;
    this.texIdx = -1;
    this.texCoordSet = -1;
    this.texOffset = [0, 0]; 
    this.texScale = [1, 1];
  }
}

export class MaterialTextureInfo {
  albedoTexture = new TexInfo;
  metallicRoughnessTexture = new TexInfo();
  normalTexture = new TexInfo();
  emissionTexture = new TexInfo();
  specularTexture = new TexInfo();
  specularColorTexture = new TexInfo();
  transmissionTexture = new TexInfo();
  clearcoatTexture = new TexInfo();
  clearcoatRoughnessTexture = new TexInfo();
  // clearcoatNormalTexture = new TexInfo();
  sheenColorTexture = new TexInfo();
  sheenRoughnessTexture = new TexInfo();
}
