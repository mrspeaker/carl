/*
  @mrspeaker
*/
import webgl from "./webgl.js";
import wobbles from "./shaders/wobbles.js";
import effect from "./shaders/effect.js";
import points from "./shaders/points.js";
import tile from "./shaders/tile.js";
import makePlane from "./geom/plane.js";
const { makeProgram } = webgl;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2", { alpha: true });
if (!gl) {
  throw new Error("no webgl2");
}

Promise.all(
  ["./res/mun.png", "./res/carl1.png", "./res/mun2.png"].map(i =>
    new Promise(res => {
      const img = new Image();
      img.src = i;
      img.addEventListener("load", () => res(img), false);
    })
  ))
  .then(init);

const wobble = {
  program: makeProgram(gl, wobbles.vs, wobbles.fs),
  geom: makePlane(10, 0, 0, true),
  vao: null,
  attrs: {},
  uniforms: {},
  buffers: {},
};

const particles = {
  program: makeProgram(gl, points.vs, points.fs),
  vao: null,
  attrs: {},
  uniforms: {},
  buffers: {},
};

const tiles = {
  program: makeProgram(gl, tile.vs, tile.fs),
  vao: null,
  attrs: {},
  uniforms: {},
  buffers: {},
};

const bloom = {
  program: makeProgram(gl, effect.vs, effect.fs),
  vao: null,
  attrs: {},
  uniforms: {},
  buffers: {},
};

function init(images) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(wobble.program);

  wobble.vao = gl.createVertexArray(); // collection of attribute state
  gl.bindVertexArray(wobble.vao); // attribute settings will apply to that set of attribute state

  // buffer supplies data to attribs via vertex array
  wobble.buffers.pos = gl.createBuffer();
  wobble.buffers.uv = gl.createBuffer();

  // send data to buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, wobble.buffers.pos);
  gl.bufferData(gl.ARRAY_BUFFER, wobble.geom.verts, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, wobble.buffers.uv);
  gl.bufferData(gl.ARRAY_BUFFER, wobble.geom.uvs, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wobble.geom.indicies, gl.STATIC_DRAW);

  // attributes
  wobble.attrs.pos = gl.getAttribLocation(wobble.program, "a_pos");
  wobble.attrs.uv = gl.getAttribLocation(wobble.program, "a_uv");
  wobble.attrs.off = gl.getAttribLocation(wobble.program, "a_off");
  wobble.uniforms.res = gl.getUniformLocation(wobble.program, "u_res");
  gl.uniform2f(wobble.uniforms.res, gl.canvas.width, gl.canvas.height);

  // tells WebGL we want to supply data from a buffer.
  gl.enableVertexAttribArray(wobble.attrs.pos);
  gl.enableVertexAttribArray(wobble.attrs.uv);

  gl.bindBuffer(gl.ARRAY_BUFFER, wobble.buffers.pos);
  gl.vertexAttribPointer(wobble.attrs.pos, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, wobble.buffers.uv);
  gl.vertexAttribPointer(wobble.attrs.uv, 2, gl.FLOAT, false, 0, 0);

  // set up textures
  const textures = images.map((src, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    const texture = webgl.makeTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

    if (i <= 1) {
      const u_image = gl.getUniformLocation(wobble.program, "u_image" + i);
      wobble.uniforms["u_image" + i] = u_image;
      gl.uniform1i(u_image, i);
    }

    return texture;
  });

  // ***** PROGRAM TWO *****
  gl.useProgram(particles.program);

  particles.vao = gl.createVertexArray();
  gl.bindVertexArray(particles.vao);

  // attributes
  particles.attrs.pos = gl.getAttribLocation(particles.program, "a_pos");
  particles.attrs.size = gl.getAttribLocation(particles.program, "a_size");
  particles.attrs.trans = gl.getAttribLocation(particles.program, "translate");

  particles.buffers.posAndSize = gl.createBuffer();

  particles.points = 300;
  const verts = Array.from(new Array(particles.points * 3), (_, i) => {
    if ((i + 1) % 3 === 0) {
      const size = Math.random() * Math.random() * Math.random() * 60 + 2;
      return size;
    }
    const isX = i % 3 === 1;
    return (Math.random() - 0.5) * 2 * (isX ? 0.1 : 1.0);
  });
  particles.trans = new Float32Array(new Array(particles.points * 2).fill(0));
  gl.bindBuffer(gl.ARRAY_BUFFER, particles.buffers.posAndSize);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(particles.attrs.pos);
  gl.vertexAttribPointer(particles.attrs.pos, 2, gl.FLOAT, false, 3 * 4, 0);

  gl.enableVertexAttribArray(particles.attrs.size);
  gl.vertexAttribPointer(
    particles.attrs.size,
    1,
    gl.FLOAT,
    false,
    3 * 4,
    2 * 4,
  );

  particles.buffers.trans = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particles.buffers.trans);
  gl.bufferData(gl.ARRAY_BUFFER, particles.trans, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(particles.attrs.trans);
  gl.vertexAttribPointer(particles.attrs.trans, 2, gl.FLOAT, false, 0, 0);

  // Program 3... TILES
  gl.useProgram(tiles.program);
  tiles.vao = gl.createVertexArray();
  gl.bindVertexArray(tiles.vao);

  tiles.buffers.vertsAndUvs = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tiles.buffers.vertsAndUvs);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  tiles.attrs.pos = gl.getAttribLocation(tiles.program, "a_pos");
  tiles.attrs.world = gl.getAttribLocation(tiles.program, "world");
  tiles.attrs.uv = gl.getAttribLocation(tiles.program, "a_uv");

  gl.enableVertexAttribArray(tiles.attrs.pos);
  gl.vertexAttribPointer(tiles.attrs.pos, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.enableVertexAttribArray(tiles.attrs.uv);
  gl.vertexAttribPointer(tiles.attrs.uv, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  tiles.uniforms.image = gl.getUniformLocation(tiles.program, "image");
  gl.uniform1i(tiles.uniforms.image, 0);

  gl.useProgram(bloom.program);
  bloom.vao = gl.createVertexArray();
  gl.bindVertexArray(bloom.vao);

  // Make verticies
  bloom.buffers.vertsAndUvs = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bloom.buffers.vertsAndUvs);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1, 0, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1,
      -1, -1, 0, 0,
      1, 1, 1, 1,
      1, -1, 1, 0,
    ]),
    gl.STATIC_DRAW,
  );

  // get locations
  bloom.uniforms.res = gl.getUniformLocation(bloom.program, "u_res");
  bloom.uniforms.image = gl.getUniformLocation(bloom.program, "u_image");
  bloom.attrs.uv = gl.getAttribLocation(bloom.program, "a_uv");
  bloom.attrs.pos = gl.getAttribLocation(bloom.program, "a_pos");

  gl.uniform2f(bloom.uniforms.res, gl.canvas.width, gl.canvas.height);

  // enable, vpointer
  gl.enableVertexAttribArray(bloom.attrs.pos);
  gl.vertexAttribPointer(bloom.attrs.pos, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.enableVertexAttribArray(bloom.attrs.uv);
  gl.vertexAttribPointer(bloom.attrs.uv, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  // add the fbo

  const t = webgl.makeTexture(gl);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 600, 400, 0, gl.RGBA, gl.UNSIGNED_BYTE, null
  );
  effect.fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, effect.fbo);
  const attachPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachPoint, gl.TEXTURE_2D, t, 0);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.uniform1i(bloom.uniforms.image, 2);

  effect.fboTexture = t;
  effect.textures = textures;

  gl.enable(gl.BLEND);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  run();
}

function run() {
  function render(time) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    requestAnimationFrame(render);

    drawTile(0, 1.7, 0.5);
    renderCarl(time);

    gl.blendFunc(gl.ONE, gl.ONE);
    renderPointSprites(time);

    gl.bindFramebuffer(gl.FRAMEBUFFER, effect.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderPointSprites(time);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    drawEffectFromFBO();
  }
  render(0);
}

function drawTile(x = 0, y = 0, b = 0.5) {
  gl.useProgram(tiles.program);
  gl.bindVertexArray(tiles.vao);

  gl.vertexAttrib2f(tiles.attrs.world, x - 0.5, y - 0.5);
  gl.uniform1f(tiles.uniforms.b, b);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawEffectFromFBO() {
  gl.useProgram(bloom.program);
  gl.bindVertexArray(bloom.vao);
  gl.bindTexture(gl.TEXTURE_2D, effect.fboTexture);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindTexture(gl.TEXTURE_2D, effect.textures[1]);
}

function renderCarl(t) {
  gl.useProgram(wobble.program);
  gl.bindVertexArray(wobble.vao);
  gl.vertexAttrib1f(wobble.attrs.off, Math.sin(t / 5000));

  const inds = wobble.geom.indicies.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, wobble.buffers.pos);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    makePlane(10, -0.5, 0, true).verts,
    gl.STATIC_DRAW,
  );
  gl.drawElements(gl.TRIANGLES, inds, gl.UNSIGNED_BYTE, 0);
}

function renderPointSprites(time) {
  gl.useProgram(particles.program);
  gl.bindVertexArray(particles.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, particles.buffers.trans);
  particles.trans.forEach((t, i) => {
    const isX = i % 2 === 0;
    const offset = isX
        ? Math.sin((time + i * 10) / 2000) * 0.0005
        : Math.cos((time + i * 4) / 2000) * 0.0005 *
          (Math.cos(time / i / 1000) * 0.5);
    particles.trans[i] = t + offset;
  });
  gl.bufferData(gl.ARRAY_BUFFER, particles.trans, gl.STATIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, particles.points);
}
