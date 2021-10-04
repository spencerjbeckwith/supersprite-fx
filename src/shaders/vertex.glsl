#version 300 es
#define shockwave_count 3

in vec2 a_position;
in vec2 a_texture;
out vec2 v_texcoord;
uniform mat3 u_position_matrix;
uniform mat3 u_texture_matrix;

uniform int u_use_shockwave;
uniform vec3 u_shockwave[2*shockwave_count];
uniform vec2 u_surfaceSize;

void main() {
  vec2 vertex = a_position;

  if (u_use_shockwave == 1) {
    for (int s = 0; s < 2*shockwave_count; s += 2) {
      float current_time = u_shockwave[s + 1].y;
      if (current_time > 0.0) {
        vec2 epicenter = vec2( u_shockwave[s].x / u_surfaceSize.x, u_shockwave[s].y / u_surfaceSize.y);
        float dist = distance(vertex, epicenter);
        float max_radius = u_shockwave[s + 1].x / min(u_surfaceSize.x, u_surfaceSize.y);

        if (dist < max_radius) {
          float max_time = u_shockwave[s + 1].z;
          float progress = current_time / max_time;
          float intensity = u_shockwave[s].z;
          float wave = progress * max_radius;
          float shock = intensity * (1.0 - progress) * (max_radius - abs(wave - dist)) / max_radius;

          float theta = atan(epicenter.y - vertex.y, epicenter.x - vertex.x);
          vertex -= vec2(shock * cos(theta), shock*sin(theta));
        }
      }
    }
  }

  gl_Position = vec4( (u_position_matrix * vec3(vertex, 1.0) ).xy, 0, 1);
  v_texcoord = ( u_texture_matrix * vec3(a_texture, 1.0) ).xy;
}