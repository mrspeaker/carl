const vs = `#version 300 es
  in vec2 a_pos;
  in vec2 a_uv;
  out vec2 uv;

  void main() {
    uv = a_uv;
    gl_Position = vec4(a_pos.x, a_pos.y * -1.0 + 0.1, 0, 1);
  }
`;

const fs = `#version 300 es
  precision mediump float;
  uniform sampler2D u_image;
  in vec2 uv;
  out vec4 outColor;
  void main() {
    vec4 tx = texture(u_image, uv);
    //if (mod(floor(uv.y*400.0), 2.0) == 0.0)
    outColor = vec4(tx.br * 0.5, tx.g * 1.0, tx.a) * 1.0;
  }
`;

export default {
  vs,
  fs
};
