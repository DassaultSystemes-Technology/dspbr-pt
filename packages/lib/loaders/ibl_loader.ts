import { normalizeExternalAssetUrl } from './url_normalization';

export interface IblTextureLike {
  image: {
    data: Float32Array;
    width: number;
    height: number;
  };
  header?: string;
  gamma?: number;
  exposure?: number;
  __proceduralValidationIbl?: boolean;
}

function rgbeError(message: string): never {
  throw new Error(`HDR parse error: ${message}`);
}

function readLine(buffer: Uint8Array & { pos?: number }): string {
  let line = '';
  while ((buffer.pos ?? 0) < buffer.length) {
    const current = buffer[buffer.pos ?? 0]!;
    buffer.pos = (buffer.pos ?? 0) + 1;
    line += String.fromCharCode(current);
    if (current === 0x0a) {
      break;
    }
  }
  return line;
}

function parseHeader(buffer: Uint8Array & { pos?: number }) {
  const magic = readLine(buffer);
  if (!magic.startsWith('#?')) {
    return rgbeError('bad initial token');
  }

  let header = magic;
  let gamma = 1.0;
  let exposure = 1.0;
  let format = '';
  let width = 0;
  let height = 0;

  for (;;) {
    const line = readLine(buffer);
    if (!line) {
      return rgbeError('no header found');
    }

    header += line;

    if (line.startsWith('GAMMA=')) {
      gamma = Number.parseFloat(line.slice(6));
      continue;
    }
    if (line.startsWith('EXPOSURE=')) {
      exposure = Number.parseFloat(line.slice(9));
      continue;
    }
    if (line.startsWith('FORMAT=')) {
      format = line.slice(7).trim();
      continue;
    }

    const dimensions = line.match(/^\s*-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/);
    if (dimensions) {
      height = Number.parseInt(dimensions[1]!, 10);
      width = Number.parseInt(dimensions[2]!, 10);
      break;
    }
  }

  if (format !== '32-bit_rle_rgbe') {
    return rgbeError(`unsupported format "${format}"`);
  }
  if (width <= 0 || height <= 0) {
    return rgbeError('invalid image dimensions');
  }

  return { header, gamma, exposure, width, height };
}

function readPixelsRle(buffer: Uint8Array & { pos?: number }, width: number, height: number): Uint8Array {
  if (width < 8 || width > 0x7fff) {
    return rgbeError('unsupported scanline width for RLE');
  }

  const data = new Uint8Array(width * height * 4);
  const scanline = new Uint8Array(width * 4);

  for (let y = 0; y < height; y += 1) {
    if ((buffer.pos ?? 0) + 4 > buffer.length) {
      return rgbeError('unexpected end of file');
    }

    const a = buffer[buffer.pos ?? 0]!;
    const b = buffer[(buffer.pos ?? 0) + 1]!;
    const c = buffer[(buffer.pos ?? 0) + 2]!;
    const d = buffer[(buffer.pos ?? 0) + 3]!;
    buffer.pos = (buffer.pos ?? 0) + 4;

    if (a !== 2 || b !== 2 || ((c << 8) | d) !== width) {
      return rgbeError('bad rgbe scanline format');
    }

    for (let channel = 0; channel < 4; channel += 1) {
      let x = 0;
      while (x < width) {
        if ((buffer.pos ?? 0) >= buffer.length) {
          return rgbeError('unexpected end of file in scanline');
        }
        const count: number = buffer[buffer.pos ?? 0]!;
        buffer.pos = (buffer.pos ?? 0) + 1;
        if (count > 128) {
          const runLength = count - 128;
          if (runLength <= 0 || x + runLength > width || (buffer.pos ?? 0) >= buffer.length) {
            return rgbeError('bad scanline data');
          }
          const value = buffer[buffer.pos ?? 0]!;
          buffer.pos = (buffer.pos ?? 0) + 1;
          scanline.fill(value, channel * width + x, channel * width + x + runLength);
          x += runLength;
        } else {
          const literalCount: number = count;
          if (literalCount <= 0 || x + literalCount > width || (buffer.pos ?? 0) + literalCount > buffer.length) {
            return rgbeError('bad scanline data');
          }
          scanline.set(
            buffer.subarray(buffer.pos ?? 0, (buffer.pos ?? 0) + literalCount),
            channel * width + x,
          );
          buffer.pos = (buffer.pos ?? 0) + literalCount;
          x += literalCount;
        }
      }
    }

    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x += 1) {
      data[rowOffset + x * 4 + 0] = scanline[x]!;
      data[rowOffset + x * 4 + 1] = scanline[x + width]!;
      data[rowOffset + x * 4 + 2] = scanline[x + 2 * width]!;
      data[rowOffset + x * 4 + 3] = scanline[x + 3 * width]!;
    }
  }

  return data;
}

function rgbeBytesToFloat(source: Uint8Array, sourceOffset: number, dest: Float32Array, destOffset: number) {
  const exponent = source[sourceOffset + 3]!;
  if (exponent > 0) {
    const scale = Math.pow(2.0, exponent - 128.0) / 255.0;
    dest[destOffset + 0] = source[sourceOffset + 0]! * scale;
    dest[destOffset + 1] = source[sourceOffset + 1]! * scale;
    dest[destOffset + 2] = source[sourceOffset + 2]! * scale;
  } else {
    dest[destOffset + 0] = 0;
    dest[destOffset + 1] = 0;
    dest[destOffset + 2] = 0;
  }
  dest[destOffset + 3] = 1.0;
}

export function parseIblFromHdrBuffer(bufferLike: ArrayBuffer | Uint8Array): IblTextureLike {
  const buffer = bufferLike instanceof Uint8Array ? bufferLike : new Uint8Array(bufferLike);
  const byteArray = buffer as Uint8Array & { pos?: number };
  byteArray.pos = 0;

  const header = parseHeader(byteArray);
  const pixels = readPixelsRle(byteArray, header.width, header.height);

  const data = new Float32Array(header.width * header.height * 4);
  for (let index = 0; index < header.width * header.height; index += 1) {
    rgbeBytesToFloat(pixels, index * 4, data, index * 4);
  }

  return {
    image: {
      data,
      width: header.width,
      height: header.height,
    },
    header: header.header,
    gamma: header.gamma,
    exposure: header.exposure,
  };
}

export async function loadIblFromBlob(blob: Blob): Promise<IblTextureLike> {
  return parseIblFromHdrBuffer(await blob.arrayBuffer());
}

export async function loadIblFromUrl(url: string): Promise<IblTextureLike> {
  const response = await fetch(normalizeExternalAssetUrl(url));
  if (!response.ok) {
    throw new Error(`Failed to load HDR: ${response.status} ${response.statusText}`);
  }
  return parseIblFromHdrBuffer(await response.arrayBuffer());
}
