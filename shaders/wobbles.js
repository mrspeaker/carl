const vs = `#version 300 es
  in vec2 a_pos;
  in vec2 a_uv;
  in float a_off;

  out vec2 uv;
  out float off;

  uniform vec2 u_res;

  void main() {
    uv = a_uv;
    off = a_off;
    vec2 pos = (a_pos / u_res) * u_res.x;
    float xo = sin(float(gl_VertexID)/20.0  +a_off*10.0) * 0.2;
    float yo = cos(mod(float(gl_VertexID), 10.0) + a_off*10.0) * 0.05;
    gl_Position = vec4(pos.x + (a_off * 2.8) + xo , 1.0 - abs(cos(pos.y + off / 2.0)) + yo + 0.4, 0, 2.5 + abs(off));
  }
`;

const fs = `#version 300 es
  precision mediump float;
  uniform sampler2D u_image0;
  uniform sampler2D u_image1;
  in vec2 uv;
  in float off;
  out vec4 outColor;
  void main() {
    vec2 onePx = vec2(1) / vec2(textureSize(u_image1, 0));
    // vec4 tex = texture(u_image0, uv);
    // vec4 tex2 = texture(u_image1, uv);
    // vec4 col = mix(tex, tex2, abs(off));
    vec4 col = texture(u_image1, uv);

    outColor = vec4(col.r, col.g, col.b, col.a);// * cos(uv.x - 1.0 * uv.y);
  }
`;

export default {
  vs,
  fs
};
