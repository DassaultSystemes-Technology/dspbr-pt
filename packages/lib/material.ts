
export class MaterialData {
  private _data = new Float32Array(64);

  public get data() {
    return this._data;
  }

  private _name = "";
  public get name() {
    return this._name;
  }
  public set name(val: string) {
    this._name = val;
  }

  private _dirty = false;
  public get dirty() {
    return this._dirty;
  }
  public set dirty(flag: boolean) {
    this._dirty = flag;
  }

  public set albedo(val: number[]) {
    this._data[0] = val[0];
    this._data[1] = val[1];
    this._data[2] = val[2];
    this.dirty = true;
  }
  public get albedo() {
    return [...this._data.slice(0, 3)];
  }

  public set metallic(val: number) {
    this._data[3] = val;
    this.dirty = true;
  }
  public get metallic() : number{
    return this.data[3];
  }

  public set roughness(val: number) {
    this._data[4] = val;
    this.dirty = true;
  }
  public get roughness() : number {
    return this.data[4];
  }

  public set anisotropy(val: number) {
    this._data[5] = val;
    this.dirty = true;
  }
  public get anisotropy() {
    return this.data[5];
  }

  public set anisotropyRotation(val: number) {
    this._data[6] = val;
    this.dirty = true;
  }
  public get anisotropyRotation() {
    return this.data[6];
  }

  public set transparency(val: number) {
    this._data[7] = val;
    this.dirty = true;
  }
  public get transparency() {
    return this.data[7];
  }

  public set cutoutOpacity(val: number) {
    this._data[8] = val;
    this.dirty = true;
  }
  public get cutoutOpacity() {
    return this.data[8];
  }

  public set doubleSided(val: number) {
    this._data[9] = val;
    this.dirty = true;
  }
  public get doubleSided() {
    return this.data[9];
  }

  public set normalScale(val: number) {
    this._data[10] = val;
    this.dirty = true;
  }
  public get normalScale() {
    return this.data[10];
  }

  public set ior(val: number) {
    this._data[11] = val;
    this.dirty = true;
  }
  public get ior() {
    return this.data[11];
  }

  public set specularTint(val: number[]) {
    this._data[12] = val[0];
    this._data[13] = val[1];
    this._data[14] = val[2];
    this.dirty = true;
  }
  public get specularTint() {
    return [...this._data.slice(12, 15)];
  }

  public set specular(val: number) {
    this._data[15] = val;
    this.dirty = true;
  }
  public get specular() {
    return this.data[15];
  }

  public set sheenColor(val: number[]) {
    this._data[16] = val[0];
    this._data[17] = val[1];
    this._data[18] = val[2];
    this.dirty = true;
  }
  public get sheenColor() {
    return [...this._data.slice(16, 19)];
  }

  public set sheenRoughness(val: number) {
    this._data[19] = val;
    this.dirty = true;
  }
  public get sheenRoughness() {
    return this.data[19];
  }

  public set emission(val: number[]) {
    this._data[20] = val[0];
    this._data[21] = val[1];
    this._data[22] = val[2];
    this.dirty = true;
  }
  public get emission() {
    return [...this._data.slice(20, 23)];
  }

  public set normalScaleClearcoat(val: number) {
    this._data[23] = val;
    this.dirty = true;
  }
  public get normalScaleClearcoat() {
    return this.data[23];
  }

  public set clearcoat(val: number) {
    this._data[24] = val;
    this.dirty = true;
  }
  public get clearcoat() {
    return this.data[24];
  }

  public set clearcoatRoughness(val: number) {
    this._data[25] = val;
    this.dirty = true;
  }
  public get clearcoatRoughness() {
    return this.data[25];
  }

  public set translucency(val: number) {
    this._data[26] = val;
    this.dirty = true;
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

  public set attenuationColor(val: number[]) {
    this._data[28] = val[0];
    this._data[29] = val[1];
    this._data[30] = val[2];
    this.dirty = true;
  }
  public get attenuationColor() {
    return [...this._data.slice(28, 31)];
  }

  public set attenuationDistance(val: number) {
    this._data[31] = val;
    this.dirty = true;
  }
  public get attenuationDistance() {
    return this.data[31];
  }

  public set subsurfaceColor(val: number[]) {
    this._data[32] = val[0];
    this._data[33] = val[1];
    this._data[34] = val[2];
    this.dirty = true;
  }
  public get subsurfaceColor() {
    return [...this._data.slice(32, 35)];
  }

  public set thinWalled(val: number) {
    this._data[35] = val;
    this.dirty = true;
  }
  public get thinWalled() {
    return this.data[35];
  }

  public set anisotropyDirection(val: number[]) {
    this._data[36] = val[0];
    this._data[37] = val[1];
    this._data[38] = val[2];
    this.dirty = true;
  }
  public get anisotropyDirection() {
    return [...this._data.slice(36, 39)];
  }

  public set translucencyTextureId(val: number) {
    this._data[39] = val;
  }
  public get translucencyTextureId() {
    return this._data[39];
  }

  public set iridescence(val: number) {
    this._data[40] = val;
    this.dirty = true;
  }
  public get iridescence() {
    return this._data[40];
  }

  public set iridescenceIOR(val: number) {
    this._data[41] = val;
    this.dirty = true;
  }
  public get iridescenceIOR() {
    return this._data[41];
  }

  public set iridescenceThicknessMinimum(val: number) {
    this._data[42] = val;
    this.dirty = true;
  }
  public get iridescenceThicknessMinimum() {
    return this._data[42];
  }

  public set iridescenceThicknessMaximum(val: number) {
    this._data[43] = val;
    this.dirty = true;
  }
  public get iridescenceThicknessMaximum() {
    return this._data[43];
  }

  public set albedoTextureId(val: number) {
    this._data[44] = val;
  }
  public get albedoTextureId() {
    return this._data[44];
  }

  public set metallicRoughnessTextureId(val: number) {
    this._data[45] = val;
  }
  public get metallicRoughnessTextureId() {
    return this._data[45];
  }

  public set normalTextureId(val: number) {
    this._data[46] = val;
  }
  public get normalTextureId() {
    return this._data[46];
  }

  public set emissionTextureId(val: number) {
    this._data[47] = val;
  }
  public get emissionTextureId() {
    return this._data[47];
  }

  public set specularTextureId(val: number) {
    this._data[48] = val;
  }
  public get specularTextureId() {
    return this._data[48];
  }

  public set specularColorTextureId(val: number) {
    this._data[49] = val;
  }
  public get specularColorTextureId() {
    return this._data[49];
  }

  public set transmissionTextureId(val: number) {
    this._data[50] = val;
  }
  public get transmissionTextureId() {
    return this._data[50];
  }

  public set clearcoatTextureId(val: number) {
    this._data[51] = val;
    this.dirty = true;
  }
  public get clearcoatTextureId() {
    return this._data[51];
  }

  public set clearcoatRoughnessTextureId(val: number) {
    this._data[52] = val;
  }
  public get clearcoatRoughnessTextureId() {
    return this._data[52];
  }

  public set clearcoatNormalTextureId(val: number) {
    this._data[53] = val;
  }
  public get clearcoatNormalTextureId() {
    return this._data[53];
  }

  public set sheenColorTextureId(val: number) {
    this._data[54] = val;
  }
  public get sheenColorTextureId() {
    return this._data[54];
  }

  public set sheenRoughnessTextureId(val: number) {
    this._data[55] = val;
  }
  public get sheenRoughnessTextureId() {
    return this._data[55];
  }

  public set anisotropyTextureId(val: number) {
    this._data[56] = val;
  }
  public get snisotropyTextureId() {
    return this._data[56];
  }

  public set anisotropyDirectionTextureId(val: number) {
    this._data[57] = val;
  }
  public get anisotropyDirectionTextureId() {
    return this._data[57];
  }

  public set iridescenceTextureId(val: number) {
    this._data[58] = val;
  }
  public get iridescenceTextureId() {
    return this._data[58];
  }

  public set iridescenceThicknessTextureId(val: number) {
    this._data[59] = val;
  }
  public get iridescenceThicknessTextureId() {
    return this._data[59];
  }

  public set translucencyColor(val: number[]) {
    this._data[60] = val[0];
    this._data[61] = val[1];
    this._data[62] = val[2];
    this.dirty = true;
  }
  public get translucencyColor() {
    return [...this._data.slice(60, 63)];
  }

  public set translucencyColorTextureId(val: number) {
    this._data[63] = val;
  }
  public get translucencyColorTextureId() {
    return this._data[63];
  }

  constructor() {
    this.albedo = [1, 1, 1];
    this.metallic = 0;

    this.roughness = 0;
    this.anisotropy = 0.0;
    this.anisotropyRotation = 0; // not used
    this.transparency = 0;

    this.cutoutOpacity = 1;
    this.doubleSided = 1;
    this.normalScale = 1;
    this.ior = 1.49;

    this.specularTint = [1, 1, 1];
    this.specular = 1;

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

    this.anisotropyDirection = [1, 0, 0];
    this.translucencyTextureId = -1;

    this.iridescence = 0.0;
    this.iridescenceIOR = 1.3;
    this.iridescenceThicknessMinimum = 100.0;
    this.iridescenceThicknessMaximum = 400.0;

    this.albedoTextureId = -1;
    this.metallicRoughnessTextureId = -1;
    this.normalTextureId = -1;
    this.emissionTextureId = -1;

    this.specularTextureId = -1;
    this.specularColorTextureId = -1;
    this.transmissionTextureId = -1;
    this.clearcoatTextureId = -1;

    this.clearcoatRoughnessTextureId = -1;
    this.clearcoatNormalTextureId = -1;
    this.sheenColorTextureId = -1;
    this.sheenRoughnessTextureId = -1;

    this.anisotropyTextureId = -1;
    this.anisotropyDirectionTextureId = -1;
    this.iridescenceTextureId = -1;
    this.iridescenceThicknessTextureId = -1;

    this.translucencyColor = [1, 1, 1];
    this.translucencyColorTextureId = -1;
  }
}

export class TexInfo {
  private _data = new Float32Array(8);

  public get byteLength() {
    return this._data.byteLength;
  }

  public get data() {
    return this._data;
  }

  public set texOffset(val: number[]) {
    this._data[0] = val[0];
    this._data[1] = val[1];
  }

  public set texArrayIdx(val: number) {
    this._data[2] = val;
  }

  public set texIdx(val: number) {
    this._data[3] = val;
  }

  public set texScale(val: number[]) {
    this._data[4] = val[0];
    this._data[5] = val[1];
  }

  public set uvSet(val: number) {
    this._data[6] = val;
  }

  constructor() {
    this.texOffset = [0, 0];
    this.texArrayIdx = 255;
    this.texIdx = 255;
    this.texScale = [1, 1];
    this.uvSet = 255;
  }
}
