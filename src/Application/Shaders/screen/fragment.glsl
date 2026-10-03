#ifdef GL_ES
precision highp float;
#endif

const float PHI = 1.61803398874989484820459; // Φ = Golden Ratio
uniform float u_time;

// float gold_noise(vec2 xy, float seed) {
//   return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
// }

// Hash without sine: the gold noise above draws visible rings over a dark scene
float noise(vec2 xy, float seed) {
  vec3 p3 = fract(vec3(xy.xyx) * 0.1031 + seed);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  gl_FragColor = vec4(noise(gl_FragCoord.xy, fract(u_time) + 1.0),
                      noise(gl_FragCoord.xy, fract(u_time) + 2.0),
                      noise(gl_FragCoord.xy, fract(u_time) + 3.0), 0.01);
}