
const vertex = `#version 300 es
in vec2 a_position;
in vec2 a_texture;
out vec2 v_texcoord;
uniform mat3 u_position_matrix;
uniform mat3 u_texture_matrix;

void main() {
    gl_Position = vec4( (u_position_matrix * vec3(a_position, 1.0) ).xy, 0, 1);
    v_texcoord = ( u_texture_matrix * vec3(a_texture, 1.0) ).xy;
}`;

const fragment = `#version 300 es
precision mediump float;
in vec2 v_texcoord;
out vec4 output_color;
uniform sampler2D u_atlas;
uniform vec4 u_blend;
uniform int u_use_texture;

uniform sampler2D u_palette;
uniform int u_palette_index;

uniform int u_monochrome;
uniform vec3 u_monochrome_multiplier;

void main() {
    if (u_use_texture == 0) {
        output_color = u_blend;
    } else {
        vec4 color = texture(u_atlas, v_texcoord);

        // If a palette is set, cycle colors of the top row and see if this pixel matches
        if (u_palette_index > 0) {
            for (int a = 0; a < textureSize(u_palette, 0).x; a++) {
                if (color == texelFetch(u_palette, ivec2(a, 0), 0)) {
                    // Found a match, replace this color
                    color = texelFetch(u_palette, ivec2(a, u_palette_index), 0);
                    break;
                }
            }
        }

        if (u_monochrome == 1) {
            float average = (color.r + color.g + color.b) / 3.0;
            color = vec4(vec3(average * u_monochrome_multiplier), color.a);
        }

        output_color = color * u_blend;
    }
}`;

export default { vertex, fragment };