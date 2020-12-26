export class SimpleTriangleBVH {
  m_pTriIndices: Int32Array;
  constructor(dataStride: number);
  build(triData: Float32Array) : void;
  createAndCopyToFlattenedArray_StandardFormat(): Float32Array;

}