#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D tex;

in vec2 v_uv;
out vec4 out_color;

void main() {
  vec2 uv = (v_uv + vec2(1.0)) * 0.5;
  out_color = texture(tex, uv);
}