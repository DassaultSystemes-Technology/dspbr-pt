#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D tex;
uniform float exposure;
uniform bool gamma;
uniform int tonemappingMode;
const vec3 whitePoint = vec3(1.0);

in vec2 uv;
out vec4 out_FragColor;

#ifndef saturate
#define saturate(a) clamp(a, 0.0, 1.0)
#endif

// exposure only
vec3 LinearToneMapping(vec3 color) {
  return exposure * color;
}

vec3 ReinhardToneMapping(vec3 color) {
  color *= exposure;
  return saturate(color / (vec3(1.0) + color));
}

#define Uncharted2Helper(x)                                                                                            \
  max(((x * (0.15 * x + 0.10 * 0.50) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02 / 0.30, vec3(0.0))

vec3 Uncharted2ToneMapping(vec3 color) {
  // John Hable's filmic operator from Uncharted 2 video game
  color *= exposure;
  return saturate(Uncharted2Helper(color) / Uncharted2Helper(vec3(whitePoint)));
}

vec3 OptimizedCineonToneMapping(vec3 color) {
  // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
  color *= exposure;
  color = max(vec3(0.0), color - 0.004);
  return pow((color * (6.2 * color + 0.5)) / (color * (6.2 * color + 1.7) + 0.06), vec3(2.2));
}

vec3 ACESFilmicToneMapping(vec3 color) {
  color *= exposure;
  return saturate((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14));
}

void main() {
  vec3 color = texture(tex, uv).xyz;

  if (tonemappingMode == 0)
    color = LinearToneMapping(color);
  if (tonemappingMode == 1)
    color = ReinhardToneMapping(color);
  if (tonemappingMode == 2)
    color = OptimizedCineonToneMapping(color);
  if (tonemappingMode == 3)
    color = ACESFilmicToneMapping(color);
  if (tonemappingMode == 4)
    color = Uncharted2ToneMapping(color);

  if (gamma)
    color = pow(color, vec3(1.0 / 2.2));

  out_FragColor = vec4(color, 1.0);
}