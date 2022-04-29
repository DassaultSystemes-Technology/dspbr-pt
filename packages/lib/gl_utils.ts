
export function getMaxTextureSize(gl: WebGL2RenderingContext): number {
  return gl.getParameter(gl.MAX_TEXTURE_SIZE);
}

export function printGLInfo(gl: WebGL2RenderingContext) {
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
  console.log("Maximum number of triangles: " + ((maxTexSize * maxTexSize) / (4 * 12) | 0));
}

export function createRenderBufferTexture(gl: WebGL2RenderingContext, data: Float32Array | null, width: number, height: number) {
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

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  let shader = gl.createShader(type);

  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;

  }
  else {
    throw Error("Could not create shader");
  }
}

function getShaderErrorLog(gl: WebGL2RenderingContext, shader: WebGLShader, source: string) {
  var log = gl.getShaderInfoLog(shader);
  if(log) {
    const errorPos = log?.indexOf("ERROR: ") ?? 0;
    let errorSnippet = log?.substring(errorPos, errorPos+20);
    const errorLineNumber = parseInt(errorSnippet?.match(/(:\d+)/)![0].substring(1) ?? "0");
    const sourceLines = source.split(/\r?\n/);
    return log + "\n" + sourceLines.slice(errorLineNumber-5, errorLineNumber+5).join('\n');
  }

  return "";
}

export async function createProgramFromSource(gl: WebGL2RenderingContext,
  vertexShaderSource: string, fragmentShaderSource: string, shaderChunks?: Map<string, string> ) {

  if (shaderChunks) {
    console.time("Resolving shader chunks");
    for (let [id, chunk] of shaderChunks) {
      let identifier = `#include <${id}>`;
      vertexShaderSource = vertexShaderSource.replace(identifier, chunk);
      fragmentShaderSource = fragmentShaderSource.replace(identifier, chunk);
      // console.log(fragmentShaderSource);
    }
    console.timeEnd("Resolving shader chunks");
  }

  var ext = gl.getExtension('KHR_parallel_shader_compile');

  let vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (vs && fs) {
    let program = gl.createProgram();
    if (!program) {
      throw Error("Could not create shader program");
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    function checkToUseProgram() {
      if (gl.getProgramParameter(program!, gl.LINK_STATUS)) {
        return true;
      } else {
        const vsLog = getShaderErrorLog(gl, vs, vertexShaderSource);
        const fsLog = getShaderErrorLog(gl, fs, fragmentShaderSource);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        console.log(vsLog);
        console.log(fsLog);
        gl.deleteProgram(program);
        throw new Error("Program link error: " + gl.getProgramInfoLog(program!));
      }
    }

    if (ext) {
      function checkCompletion() {
        if (gl.getProgramParameter(program!, ext!.COMPLETION_STATUS_KHR) == true) {
          checkToUseProgram();
        } else {
          requestAnimationFrame(checkCompletion);
        }
      }
      requestAnimationFrame(checkCompletion);
      return program;
    } else {
      checkToUseProgram();
      return program;
    }
  } else {
    throw new Error("Shader compile error");
  }
}

export function createDataTexture(gl: WebGL2RenderingContext, data?: Float32Array) :  WebGLTexture {
  if(!data) throw Error("No data provided for data texture creation!");

  let maxTextureSize = getMaxTextureSize(gl);

  let numRGBAblocks = (data.length / 4) | 0;
  let sX = Math.min(numRGBAblocks, maxTextureSize);
  let sY = Math.max(1, ((numRGBAblocks + maxTextureSize - 1) / maxTextureSize) | 0);
  // console.log(`Create data texture: ${sX} x ${sY}`);

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

  return tex as WebGLTexture;
}

export function createTexture(gl: WebGL2RenderingContext, target: any, internalformat: any, width: number, height: number, format: any, type: any, srcData: ArrayBufferView, srcOffset: number, minFilter: any = WebGL2RenderingContext.LINEAR, magFilter: any = WebGL2RenderingContext.LINEAR, wrapS: any = WebGL2RenderingContext.REPEAT, wrapT: any = WebGL2RenderingContext.REPEAT) {

  let tex = gl.createTexture();
  gl.bindTexture(target, tex);
  gl.texImage2D(target, 0, internalformat, width, height,
    0, format, type, srcData, srcOffset);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT);
  gl.bindTexture(target, null);

  return tex;
}

