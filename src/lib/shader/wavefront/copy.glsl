#version 300 es
precision highp float;
precision highp usampler2D;
precision highp sampler2D;

uniform usampler2D u_sampler_rng_state;
uniform sampler2D u_sampler_weight_pdf;
uniform sampler2D u_sampler_radiance;

layout(location = 0) out uvec2 out_rng_state;
layout(location = 1) out vec4 out_weight_pdf;
layout(location = 2) out vec4 out_radiance;

void main() {
  out_rng_state = texelFetch(u_sampler_rng_state, ivec2(gl_FragCoord.xy), 0).xy;
  out_weight_pdf = texelFetch(u_sampler_weight_pdf, ivec2(gl_FragCoord.xy), 0);
  out_radiance = texelFetch(u_sampler_radiance, ivec2(gl_FragCoord.xy), 0);
}
