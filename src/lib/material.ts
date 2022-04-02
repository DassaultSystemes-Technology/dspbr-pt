export class MaterialData {
  private _data = new Float32Array(40);

  public get data() {
    return this._data;
  }

  public set albedo(val: number[]) {
    this._data[0] = val[0];
    this._data[1] = val[1];
    this._data[2] = val[2];
  }
  public get albedo() {
    return [...this._data.slice(0, 3)];
  }

  public set metallic(val: number) {
    this._data[3] = val;
  }
  public get metallic() {
    return this.data[3];
  }

  public set roughness(val: number) {
    this._data[4] = val;
  }
  public get roughness() {
    return this.data[4];
  }

  public set anisotropy(val: number) {
    this._data[5] = val;
  }
  public get anisotropy() {
    return this.data[5];
  }

  public set anisotropyRotation(val: number) {
    this._data[6] = val;
  }
  public get anisotropyRotation() {
    return this.data[6];
  }

  public set transparency(val: number) {
    this._data[7] = val;
  }
  public get transparency() {
    return this.data[7];
  }

  public set cutoutOpacity(val: number) {
    this._data[8] = val;
  }
  public get cutoutOpacity() {
    return this.data[8];
  }

  public set doubleSided(val: number) {
    this._data[9] = val;
  }
  public get doubleSided() {
    return this.data[9];
  }

  public set normalScale(val: number) {
    this._data[10] = val;
  }
  public get normalScale() {
    return this.data[10];
  }

  public set ior(val: number) {
    this._data[11] = val;
  }
  public get ior() {
    return this.data[11];
  }

  public set specular(val: number) {
    this._data[12] = val;
  }
  public get specular() {
    return this.data[12];
  }

  public set specularTint(val: number[]) {
    this._data[13] = val[0];
    this._data[14] = val[1];
    this._data[15] = val[2];
  }
  public get specularTint() {
    return [...this._data.slice(13, 16)];
  }

  public set sheenRoughness(val: number) {
    this._data[16] = val;
  }
  public get sheenRoughness() {
    return this.data[16];
  }

  public set sheenColor(val: number[]) {
    this._data[17] = val[0];
    this._data[18] = val[1];
    this._data[19] = val[2];
  }
  public get sheenColor() {
    return [...this._data.slice(17, 20)];
  }

  public set normalScaleClearcoat(val: number) {
    this._data[20] = val;
  }
  public get normalScaleClearcoat() {
    return this.data[20];
  }

  public set emission(val: number[]) {
    this._data[21] = val[0];
    this._data[22] = val[1];
    this._data[23] = val[2];
  }
  public get emission() {
    return [...this._data.slice(21, 24)];
  }

  public set clearcoat(val: number) {
    this._data[24] = val;
  }
  public get clearcoat() {
    return this.data[24];
  }

  public set clearcoatRoughness(val: number) {
    this._data[25] = val;
  }
  public get clearcoatRoughness() {
    return this.data[25];
  }

  public set translucency(val: number) {
    this._data[26] = val;
  }
  public get translucency() {
    return this.data[26];
  }

  public set alphaCutoff(val: number) {
    this._data[27] = val;
  }
  public get alphaCutoff() {
    return this.data[27];
  }

  public set attenuationDistance(val: number) {
    this._data[28] = val;
  }
  public get attenuationDistance() {
    return this.data[28];
  }

  public set attenuationColor(val: number[]) {
    this._data[29] = val[0];
    this._data[30] = val[1];
    this._data[31] = val[2];
  }
  public get attenuationColor() {
    return [...this._data.slice(29, 32)];
  }

  public set subsurfaceColor(val: number[]) {
    this._data[32] = val[0];
    this._data[33] = val[1];
    this._data[34] = val[2];
  }
  public get subsurfaceColor() {
    return [...this._data.slice(32, 35)];
  }

  public set thinWalled(val: number) {
    this._data[35] = val;
  }
  public get thinWalled() {
    return this.data[35];
  }

  public set anisotropyDirection(val: number[]) {
    this._data[36] = val[0];
    this._data[37] = val[1];
    this._data[38] = val[2];
  }
  public get anisotropyDirection() {
    return [...this._data.slice(36, 39)];
  }

  constructor() {
    this.albedo = [1, 1, 1];
    this.metallic = 0;

    this.roughness = 0;
    this.anisotropy = 0.0;
    this.anisotropyRotation = 0;
    this.transparency = 0;

    this.cutoutOpacity = 1;
    this.doubleSided = 1;
    this.normalScale = 1;
    this.ior = 1.49;

    this.specular = 1;
    this.specularTint = [1, 1, 1];

    this.sheenRoughness = 0;
    this.sheenColor = [0, 0, 0];

    this.normalScaleClearcoat = 1;
    this.emission = [0, 0, 0];

    this.clearcoat = 0;
    this.clearcoatRoughness = 0;
    this.translucency = 0;
    this.alphaCutoff = 0;

    this.attenuationDistance = Number.MAX_VALUE;
    this.attenuationColor = [1, 1, 1];

    this.subsurfaceColor = [1, 1, 1];
    this.thinWalled = 1;

    this.anisotropyDirection = [1,0,0];
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
  anisotropyTexture = new TexInfo();
  anisotropyDirectionTexture = new TexInfo();
}
