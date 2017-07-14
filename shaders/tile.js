const vs = `#version 300 es
  in vec2 a_pos;
  in vec2 world;
  out vec2 col;

  in vec2 a_uv;
  out vec2 uv;
  void main() {
    col = a_pos;
    uv = a_uv;
    gl_Position = vec4(a_pos.x + world.x, a_pos.y + world.y, 0, 2.3);
  }
`;

const fs = `#version 300 es
  precision mediump float;
  uniform sampler2D image;

  in vec2 col;
  in vec2 uv;
  out vec4 outColor;
  void main() {
    float o = abs(col.y - col.x) * 0.09;
    outColor = texture(image, uv);//vec4(o, o, 0.0, 1.0);
  }
`;

export default {
  vs,
  fs
};
