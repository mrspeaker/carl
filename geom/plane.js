function plane(segments = 3, xpos = 0, ypos = 0, noOff = false) {
  const verts = [];
  const uvs = [];
  const indicies = [];
  const step = 1 / (segments - 1);
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const x = i * step;
      const y = j * step;
      const isEdge =
        i === 0 || j === 0 || i === segments - 1 || j === segments - 1;
      const xo = noOff || isEdge ? 0 : Math.random() * (step / 2) - step / 4;
      const yo = noOff || isEdge ? 0 : Math.random() * (step / 2) - step / 4;
      verts.push((x - 0.5) * 2 + xo + xpos, (y - 0.5) * 2 + yo + ypos);
      uvs.push(x, 1 - y);

      // Calc indicies
      if (i < segments - 1 && j < segments - 1) {
        const yoff = j * segments;
        indicies.push(yoff + i, yoff + i + segments, yoff + i + segments + 1); // tl bl br
        indicies.push(yoff + i, yoff + i + segments + 1, yoff + i + 1); // tl br tr
      }
    }
  }

  const rectangles = (segments - 1) * (segments - 1);
  return {
    verts: new Float32Array(verts),
    uvs: new Float32Array(uvs),
    indicies: new Uint8Array(indicies),
    rectangles,
  };
}

export default plane;
