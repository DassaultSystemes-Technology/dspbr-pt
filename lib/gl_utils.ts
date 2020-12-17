
export function getMaxTextureSize(gl) : number {
  return gl.getParameter(gl.MAX_TEXTURE_SIZE);
}

export function printGLInfo(gl) {
  let maxTexSize = getMaxTextureSize(gl);

  console.log("gl.VENDOR = " + gl.getParameter(gl.VENDOR));
  console.log("gl.RENDERER = " + gl.getParameter(gl.RENDERER));
  console.log("gl.VERSION = " + gl.getParameter(gl.VERSION));
  console.log("gl.MAX_TEXTURE_SIZE = " + maxTexSize);
  console.log("gl.MAX_3D_TEXTURE_SIZE = " + gl.getParameter(gl.MAX_3D_TEXTURE_SIZE));
  console.log("gl.MAX_TEXTURE_IMAGE_UNITS = " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
  console.log("gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
  gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  
  // max number of triangle data which can be packed in a single texture
  console.log("Maximum number of triangles: " + ((maxTexSize * maxTexSize) / (4*12) | 0));
}

export function createRenderBufferTexture(gl, data, width: number, height: number) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, Math.floor(width), Math.floor(height), 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}

function logE(e, txt) {
  console.log("ERROR: (" + e + "): " + txt);
}

function createShader(gl, type, source: string) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    logE("shader compile error", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
  }
}

export function createProgramFromSource(gl,
  vertexShaderSource: string, fragmentShaderSource: string,
  shaderChunks?: { [name: string]: string }) {

  if(shaderChunks !== undefined) {
    for (let chunk in shaderChunks) {
      let identifier = "#include <" + chunk + ">";
      vertexShaderSource = vertexShaderSource.replace(identifier, shaderChunks[chunk]);
      fragmentShaderSource = fragmentShaderSource.replace(identifier, shaderChunks[chunk]);
    }
  }

  let vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (vs !== undefined && fs !== undefined) {
    let program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    } else {
      logE("program link error", gl.getProgramInfoLog(program));
      console.log(gl.getShaderInfoLog(program));
      gl.deleteProgram(program);
      return undefined;
    }
  } else {
    return undefined;
  }
}

export function createDataTexture(gl, data: Float32Array) {
  let maxTextureSize = getMaxTextureSize(gl);

  let numRGBAblocks = (data.length / 4) | 0;
  let sX = Math.min(numRGBAblocks, maxTextureSize);
  let sY = Math.max(1, ((numRGBAblocks + maxTextureSize - 1) / maxTextureSize) | 0);
  console.log(`Create data texture: ${sX} x ${sY}`);

  let tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, sX, sY, 0, gl.RGBA, gl.FLOAT, null);

  if (sY > 1) {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, sX, sY - 1, gl.RGBA, gl.FLOAT, data, 0);
  }

  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, sY - 1, numRGBAblocks - sX * (sY - 1), 1, gl.RGBA, gl.FLOAT, data, sX * (sY - 1) * 4);
  
  gl.bindTexture(gl.TEXTURE_2D, null);

  return tex;
}
