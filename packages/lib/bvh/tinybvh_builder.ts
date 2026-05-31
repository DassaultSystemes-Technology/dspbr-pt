export interface BvhBuildResult {
  nodeData: Float32Array;
  triangleIndices: Int32Array;
  stats: { nodeCount: number; triangleCount: number; buildTimeMs: number };
}

type TinyBvhModule = {
  HEAPU8: Uint8Array;
  HEAPF32: Float32Array;
  HEAP32: Int32Array;
  _alloc_buffer(size: number): number;
  _free_buffer(ptr: number): void;
  _build_bvh(inputPtr: number, floatCount: number, vertexStride: number): number;
  _build_bvh_indexed(positionPtr: number, positionFloatCount: number, indexPtr: number, indexCount: number): number;
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

  if (vertexStride < 3 || triangleBuffer.length % vertexStride !== 0) {
    throw new Error(`TinyBVH: incompatible vertex stride ${vertexStride} for ${triangleBuffer.length} floats`);
  }
  const vertexCount = triangleBuffer.length / vertexStride;
  if (vertexCount % 3 !== 0) {
    throw new Error(`TinyBVH: incomplete triangle stream with ${vertexCount} vertices`);
  }

  const byteLen = triangleBuffer.byteLength;
  const ptr = mod._alloc_buffer(byteLen);
  const memoryByteLength = mod.HEAPU8.buffer.byteLength;
  const inputEnd = ptr + byteLen;
  if (!Number.isFinite(ptr) || ptr < 0 || inputEnd > memoryByteLength) {
    throw new Error(
      `TinyBVH: buffer allocation failed for ${byteLen} bytes ` +
      `(ptr=${ptr}, memory=${memoryByteLength})`
    );
  }

  let buildOk = 0;
  const start = performance.now();
  try {
    mod.HEAPU8.set(
      new Uint8Array(triangleBuffer.buffer, triangleBuffer.byteOffset, triangleBuffer.byteLength),
      ptr,
    );
    try {
      buildOk = mod._build_bvh(ptr, triangleBuffer.length, vertexStride);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `TinyBVH wasm trapped while building ${Math.floor(vertexCount / 3)} triangles ` +
        `from ${byteLen} bytes: ${detail}`
      );
    }

    const errLen = mod._get_last_error_len();
    if (errLen > 0) {
      const errPtr = mod._get_last_error_ptr();
      const msg = errPtr >= 0 && errPtr + errLen <= mod.HEAPU8.buffer.byteLength
        ? new TextDecoder().decode(mod.HEAPU8.subarray(errPtr, errPtr + errLen))
        : 'unknown native error';
      throw new Error(`TinyBVH build failed: ${msg}`);
    }

    if (!buildOk) {
      throw new Error('TinyBVH build failed without native error details');
    }

    const nodePtr = mod._get_bvh_nodes_ptr();
    const nodeLen = mod._get_bvh_nodes_len();
    const idxPtr  = mod._get_bvh_indices_ptr();
    const idxLen  = mod._get_bvh_indices_len();
    const outputMemoryByteLength = mod.HEAPU8.buffer.byteLength;
    const nodeEnd = nodePtr + nodeLen * Float32Array.BYTES_PER_ELEMENT;
    const idxEnd = idxPtr + idxLen * Int32Array.BYTES_PER_ELEMENT;
    if (nodePtr < 0 || nodeEnd > outputMemoryByteLength) {
      throw new Error(
        `TinyBVH returned out-of-bounds node buffer ` +
        `(ptr=${nodePtr}, len=${nodeLen}, memory=${outputMemoryByteLength})`
      );
    }
    if (idxPtr < 0 || idxEnd > outputMemoryByteLength) {
      throw new Error(
        `TinyBVH returned out-of-bounds index buffer ` +
        `(ptr=${idxPtr}, len=${idxLen}, memory=${outputMemoryByteLength})`
      );
    }

    const nodeData = new Float32Array(nodeLen);
    new Uint8Array(nodeData.buffer).set(
      mod.HEAPU8.subarray(nodePtr, nodePtr + nodeLen * Float32Array.BYTES_PER_ELEMENT),
    );
    const triangleIndices = new Int32Array(idxLen);
    new Uint8Array(triangleIndices.buffer).set(
      mod.HEAPU8.subarray(idxPtr, idxPtr + idxLen * Int32Array.BYTES_PER_ELEMENT),
    );

    return {
      nodeData,
      triangleIndices,
      stats: {
        nodeCount: mod._get_bvh_node_count(),
        triangleCount: mod._get_bvh_triangle_count(),
        buildTimeMs: performance.now() - start,
      },
    };
  } finally {
    mod._free_buffer(ptr);
  }
}

export async function buildIndexedBvh(
  positionBuffer: Float32Array,
  indexBuffer: Uint32Array,
): Promise<BvhBuildResult> {
  const mod = await loadModule();
  if (!mod) throw new Error('TinyBVH WASM module failed to load');

  if (positionBuffer.length % 3 !== 0) {
    throw new Error(`TinyBVH: position buffer must be packed float3, got ${positionBuffer.length} floats`);
  }
  if (indexBuffer.length % 3 !== 0) {
    throw new Error(`TinyBVH: index buffer does not describe whole triangles, got ${indexBuffer.length} indices`);
  }

  const positionPtr = mod._alloc_buffer(positionBuffer.byteLength);
  const indexPtr = mod._alloc_buffer(indexBuffer.byteLength);
  const memoryByteLength = mod.HEAPU8.buffer.byteLength;
  const positionEnd = positionPtr + positionBuffer.byteLength;
  const indexEnd = indexPtr + indexBuffer.byteLength;
  if (!Number.isFinite(positionPtr) || positionPtr < 0 || positionEnd > memoryByteLength) {
    if (indexPtr) mod._free_buffer(indexPtr);
    throw new Error(
      `TinyBVH: position allocation failed for ${positionBuffer.byteLength} bytes ` +
      `(ptr=${positionPtr}, memory=${memoryByteLength})`
    );
  }
  if (!Number.isFinite(indexPtr) || indexPtr < 0 || indexEnd > memoryByteLength) {
    mod._free_buffer(positionPtr);
    throw new Error(
      `TinyBVH: index allocation failed for ${indexBuffer.byteLength} bytes ` +
      `(ptr=${indexPtr}, memory=${memoryByteLength})`
    );
  }

  let buildOk = 0;
  const start = performance.now();
  try {
    mod.HEAPU8.set(
      new Uint8Array(positionBuffer.buffer, positionBuffer.byteOffset, positionBuffer.byteLength),
      positionPtr,
    );
    mod.HEAPU8.set(
      new Uint8Array(indexBuffer.buffer, indexBuffer.byteOffset, indexBuffer.byteLength),
      indexPtr,
    );
    try {
      buildOk = mod._build_bvh_indexed(positionPtr, positionBuffer.length, indexPtr, indexBuffer.length);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `TinyBVH wasm trapped while building indexed BVH for ${Math.floor(indexBuffer.length / 3)} triangles ` +
        `from ${positionBuffer.byteLength + indexBuffer.byteLength} bytes: ${detail}`
      );
    }

    const errLen = mod._get_last_error_len();
    if (errLen > 0) {
      const errPtr = mod._get_last_error_ptr();
      const msg = errPtr >= 0 && errPtr + errLen <= mod.HEAPU8.buffer.byteLength
        ? new TextDecoder().decode(mod.HEAPU8.subarray(errPtr, errPtr + errLen))
        : 'unknown native error';
      throw new Error(`TinyBVH indexed build failed: ${msg}`);
    }

    if (!buildOk) {
      throw new Error('TinyBVH indexed build failed without native error details');
    }

    return readBuildResult(mod, performance.now() - start);
  } finally {
    mod._free_buffer(positionPtr);
    mod._free_buffer(indexPtr);
  }
}

function readBuildResult(mod: TinyBvhModule, buildTimeMs: number): BvhBuildResult {
  const nodePtr = mod._get_bvh_nodes_ptr();
  const nodeLen = mod._get_bvh_nodes_len();
  const idxPtr  = mod._get_bvh_indices_ptr();
  const idxLen  = mod._get_bvh_indices_len();
  const outputMemoryByteLength = mod.HEAPU8.buffer.byteLength;
  const nodeEnd = nodePtr + nodeLen * Float32Array.BYTES_PER_ELEMENT;
  const idxEnd = idxPtr + idxLen * Int32Array.BYTES_PER_ELEMENT;
  if (nodePtr < 0 || nodeEnd > outputMemoryByteLength) {
    throw new Error(
      `TinyBVH returned out-of-bounds node buffer ` +
      `(ptr=${nodePtr}, len=${nodeLen}, memory=${outputMemoryByteLength})`
    );
  }
  if (idxPtr < 0 || idxEnd > outputMemoryByteLength) {
    throw new Error(
      `TinyBVH returned out-of-bounds index buffer ` +
      `(ptr=${idxPtr}, len=${idxLen}, memory=${outputMemoryByteLength})`
    );
  }

  const nodeData = new Float32Array(nodeLen);
  new Uint8Array(nodeData.buffer).set(
    mod.HEAPU8.subarray(nodePtr, nodePtr + nodeLen * Float32Array.BYTES_PER_ELEMENT),
  );
  const triangleIndices = new Int32Array(idxLen);
  new Uint8Array(triangleIndices.buffer).set(
    mod.HEAPU8.subarray(idxPtr, idxPtr + idxLen * Int32Array.BYTES_PER_ELEMENT),
  );

  return {
    nodeData,
    triangleIndices,
    stats: {
      nodeCount: mod._get_bvh_node_count(),
      triangleCount: mod._get_bvh_triangle_count(),
      buildTimeMs,
    },
  };
}
