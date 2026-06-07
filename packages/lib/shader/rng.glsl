precision highp float;

uvec2 rng_state;

uint george_marsaglia_rng() {
    rng_state.x = 36969u * (rng_state.x & 65535u) + (rng_state.x >> 16u);
    rng_state.y = 18000u * (rng_state.y & 65535u) + (rng_state.y >> 16u);
    return (rng_state.x << 16u) + rng_state.y;
}

void rng_set_state(uvec2 state) {
  rng_state = state;
}

uvec2 rng_get_state() {
  return rng_state;
}

float rng_float() {
    return float(george_marsaglia_rng()) / float(0xFFFFFFFFu);
}

void rng_init(int seed) {
    vec2 offset = vec2(seed*17,0.0);

    //Initialize RNG
    rng_state = uvec2(397.6432*(gl_FragCoord.xy+offset));
    rng_state ^= uvec2(32.9875*(gl_FragCoord.yx+offset));
}
///////////////////////////////////////////////////////////////////////////////
