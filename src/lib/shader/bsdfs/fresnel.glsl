vec3 fresnel_schlick(vec3 f0, vec3 f90, float theta) {
  return f0 + (f90 - f0) * pow(abs(1.0 - theta), 5.0);
}

float fresnel_schlick(float f0, float f90, float theta) {
  return f0 + (f90 - f0) * pow(abs(1.0 - theta), 5.0);
}

vec3 fresnel_schlick_dielectric(float cos_theta, vec3 f0, vec3 f90, float ni, float nt, bool thin_walled) {
  bool tir = false;
  if (ni > nt && !thin_walled) {
    float inv_eta = ni / nt;
    float sin_theta2 = sqr(inv_eta) * (1.0 - sqr(cos_theta));
    if (sin_theta2 >= 1.0) {
      // return vec3(1.0); // TIR
      tir = true;
    }
    //     // https://seblagarde.wordpress.com/2013/04/29/memo-on-fresnel-equations/,
    cos_theta = sqrt(1.0 - sin_theta2);
  }

  return tir ? vec3(1.0) : fresnel_schlick(f0, f90, cos_theta);
}
