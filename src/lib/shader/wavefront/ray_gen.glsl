#version 300 es
#include <rng>

uniform float u_film_height;
uniform int u_frame_count;
uniform int u_max_bounces;
uniform vec2 u_inv_res;
uniform vec3 u_cam_pos;
uniform float u_focal_length;
uniform mat4 u_view_mat;

in vec2 v_uv;
layout(location = 0) out vec4 o_org;
layout(location = 1) out vec4 o_dir;
layout(location = 2) out uvec2 o_rng_state;
layout(location = 3) out vec4 o_radiance;
layout(location = 4) out vec4 o_weight_pdf;

void main() {
  rng_init(u_frame_count * u_max_bounces);

  vec2 pixel_offset = vec2(rng_float(), rng_float())  * u_inv_res;
  float aspect = u_inv_res.y / u_inv_res.x;

  vec2 uv = (v_uv * vec2(aspect, 1.0) + pixel_offset * 2.0) * u_film_height;
  vec3 fragpos_view = normalize(vec3(uv.x, uv.y, -u_focal_length));

  //* Camera ray
  o_org = vec4(u_cam_pos, 1.0);
  o_dir = vec4(mat3(u_view_mat) * fragpos_view, 1.0);
  o_rng_state = rng_get_state();

  //* Initialize path state variables
  o_radiance = vec4(0.0);
  o_weight_pdf = vec4(1.0);
}