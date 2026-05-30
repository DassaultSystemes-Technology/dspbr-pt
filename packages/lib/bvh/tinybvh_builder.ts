export interface BvhBuildResult {
  nodeData: Float32Array;
  triangleIndices: Int32Array;
  stats: { nodeCount: number; triangleCount: number; buildTimeMs: number };
}

type TinyBvhModule = {
  HEAPF32: Float32Array;
  HEAP32: Int32Array;
  _alloc_buffer(size: number): number;
  _free_buffer(ptr: number): void;
  _build_bvh(inputPtr: number, floatCount: number, vertexStride: number): number;
  _get_bvh_nodes_ptr(): number;
  _get_bvh_nodes_len(): number;
  _get_bvh_indices_ptr(): number;
  _get_bvh_indices_len(): number;
  _get_bvh_triangle_count(): number;
  _get_bvh_node_count(): number;
  _get_bvh_depth(): number;
  _get_last_error_ptr(): number;
  _get_last_error_len(): number;
};

let modulePromise: Promise<TinyBvhModule | null> | undefined;

async function loadModule(): Promise<TinyBvhModule | null> {
  if (!modulePromise) {
    modulePromise = (async () => {
      try {
        const ns = await import('./generated/tinybvh_builder.js') as { default?: (opts?: Record<string, unknown>) => Promise<unknown> };
        if (typeof ns.default !== 'function') return null;
        return (await ns.default({ noInitialRun: true })) as TinyBvhModule;
      } catch {
        return null;
      }
    })();
  }
  return modulePromise;
}

export async function buildBvh(
  triangleBuffer: Float32Array,
  vertexStride: number,
): Promise<BvhBuildResult> {
  const mod = await loadModule();
  if (!mod) throw new Error('TinyBVH WASM module failed to load');

  const byteLen = triangleBuffer.length * Float32Array.BYTES_PER_ELEMENT;
  const ptr = mod._alloc_buffer(byteLen);
  if (!ptr) throw new Error('TinyBVH: buffer allocation failed');

  try {
    mod.HEAPF32.set(triangleBuffer, ptr >> 2);
    mod._build_bvh(ptr, triangleBuffer.length, vertexStride);

    const errLen = mod._get_last_error_len();
    if (errLen > 0) {
      const errPtr = mod._get_last_error_ptr();
      const msg = new TextDecoder().decode(new Uint8Array(mod.HEAPF32.buffer, errPtr, errLen));
      throw new Error(`TinyBVH build failed: ${msg}`);
    }

    const nodePtr = mod._get_bvh_nodes_ptr();
    const nodeLen = mod._get_bvh_nodes_len();
    const idxPtr  = mod._get_bvh_indices_ptr();
    const idxLen  = mod._get_bvh_indices_len();

    const nodeData = new Float32Array(mod.HEAPF32.buffer, nodePtr, nodeLen).slice();
    const triangleIndices = new Int32Array(mod.HEAPF32.buffer, idxPtr, idxLen).slice();

    return {
      nodeData,
      triangleIndices,
      stats: {
        nodeCount: mod._get_bvh_node_count(),
        triangleCount: mod._get_bvh_triangle_count(),
        buildTimeMs: 0,
      },
    };
  } finally {
    mod._free_buffer(ptr);
  }
}
