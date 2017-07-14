const vs = `#version 300 es
  in vec4 a_pos;
  in float a_size;
  in vec2 translate;

  out vec2 uv;

  void main() {
    uv = a_pos.xy;
    gl_Position = vec4(a_pos.xy + translate, 1.0, 1.0);
    gl_PointSize = a_size;
  }
`;

const fs = `#version 300 es
  precision mediump float;
  uniform vec4 a_col;

  out vec4 outColor;
  in vec2 uv;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5, 0.5);
    float dist = sqrt(dot(c, c));
    if (dist < 0.5) {
      outColor = vec4(0.8 - (1.0 - gl_PointCoord.y), 0.5 - (1.0 - gl_PointCoord.y), 0.0, 1.0) * 0.8;
    }
    else {
      discard;
    }
  }
`;

export default {
  vs,
  fs
};
