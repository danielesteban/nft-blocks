// eslint-disable-next-line no-restricted-globals
const context = self;

const size = 16;
const subchunks = 5;
const maxHeight = size * subchunks;
const maxLight = 15;
const fields = {
  type: 0,
  light: 1,
  sunlight: 2,
  count: 3,
};

const chunks = new Map();
let sunlightIntensity = 1;
let types;

const generate = (cx, cz) => {
  const voxels = new Uint8ClampedArray(size * size * maxHeight * fields.count);
  const heightmap = new Uint8ClampedArray(size ** 2);
  const platform = Math.floor(maxHeight * 0.5);
  for (let x = 0, i = 0; x < size; x += 1) {
    for (let y = 0; y < maxHeight; y += 1) {
      for (let z = 0; z < size; z += 1, i += fields.count) {
        let type = 0;
        if (
          y === platform
          && cx >= -1 && cx < 1
          && cz >= -1 && cz < 1
        ) {
          const vx = cx * size + x;
          const vz = cz * size + z;
          if (
            vx >= -8 && vx < 8
            && vz >= -8 && vz < 8
          ) {
            type = 1;
            heightmap[(x * size) + z] = y;
          }
        }
        voxels[i] = type;
      }
    }
  }
  return {
    x: cx,
    z: cz,
    voxels,
    heightmap,
    hasPropagated: false,
  };
};

const getChunk = (cx, cz) => {
  const key = `${cx}:${cz}`;
  let chunk = chunks.get(key);
  if (!chunk) {
    chunk = {
      ...generate(cx, cz),
      key,
    };
    chunks.set(key, chunk);
  }
  return chunk;
};

const getIndex = (x, y, z) => (
  ((x * size * maxHeight) + (y * size) + z) * fields.count
);

const getVoxelChunk = (origin) => (x, z) => {
  let chunk = origin;
  const nx = (x < 0 || x >= size) ? Math.floor(x / size) : 0;
  const nz = (z < 0 || z >= size) ? Math.floor(z / size) : 0;
  if (nx || nz) {
    chunk = getChunk(origin.x + nx, origin.z + nz);
    x -= size * nx;
    z -= size * nz;
  }
  return { chunk, cx: x, cz: z };
};

const voxelNeighbors = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
];
const floodLight = (origin, queue, key = 'light') => {
  const getChunk = getVoxelChunk(origin);
  const isSunLight = key === 'sunlight';
  const isTransparent = (type) => types[type].isTransparent;
  while (queue.length) {
    const { x, y, z } = queue.shift();
    const { chunk, cx, cz } = getChunk(x, z);
    const light = chunk.voxels[
      getIndex(cx, y, cz) + fields[key]
    ];
    voxelNeighbors.forEach((offset) => {
      const ny = y + offset.y;
      if (ny < 0 || ny >= maxHeight) {
        return;
      }
      const nx = x + offset.x;
      const nz = z + offset.z;
      const nl = light - ((isSunLight && offset.y === -1 && light === maxLight) ? 0 : 1);
      const { chunk, cx, cz } = getChunk(nx, nz);
      const voxel = getIndex(cx, ny, cz);
      if (
        !isTransparent(chunk.voxels[voxel])
        || (
          isSunLight
          && offset.y !== -1
          && light === maxLight
          && ny > chunk.heightmap[(cx * size) + cz]
        )
        || chunk.voxels[voxel + fields[key]] >= nl
      ) {
        return;
      }
      chunk.voxels[voxel + fields[key]] = nl;
      queue.push({ x: nx, y: ny, z: nz });
    });
  }
};

const propagate = (chunk) => {
  const lightQueue = [];
  const sunlightQueue = [];
  const top = maxHeight - 1;
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < maxHeight; y += 1) {
      for (let z = 0; z < size; z += 1) {
        const i = getIndex(x, y, z);
        const type = chunk.voxels[i];
        if (y === top && types[type].isTransparent) {
          chunk.voxels[i + fields.sunlight] = maxLight;
          sunlightQueue.push({ x, y: top, z });
        } else if (types[type].isLight) {
          chunk.voxels[i + fields.light] = maxLight;
          lightQueue.push({ x, y, z });
        }
      }
    }
  }
  floodLight(chunk, lightQueue, 'light');
  floodLight(chunk, sunlightQueue, 'sunlight');
  chunk.hasPropagated = true;
};

const removeLight = (origin, x, y, z, key = 'light') => {
  const getChunk = getVoxelChunk(origin);
  const { chunk, cx, cz } = getChunk(x, z);
  const voxel = getIndex(cx, y, cz);
  const fill = [];
  const queue = [];
  queue.push({
    x,
    y,
    z,
    light: chunk.voxels[voxel + fields[key]],
  });
  chunk.voxels[voxel + fields[key]] = 0;
  const isSunLight = key === 'sunlight';
  while (queue.length) {
    const {
      x,
      y,
      z,
      light,
    } = queue.shift();
    voxelNeighbors.forEach((offset) => {
      const ny = y + offset.y;
      if (ny < 0 || ny >= maxHeight) {
        return;
      }
      const nx = x + offset.x;
      const nz = z + offset.z;
      const { chunk, cx, cz } = getChunk(nx, nz);
      const voxel = getIndex(cx, ny, cz);
      const nl = chunk.voxels[voxel + fields[key]];
      if (nl === 0) {
        return;
      }
      if (
        nl < light
        || (
          isSunLight
          && offset.y === -1
          && light === maxLight
          && nl === maxLight
        )
      ) {
        queue.push({
          x: nx,
          y: ny,
          z: nz,
          light: nl,
        });
        chunk.voxels[voxel + fields[key]] = 0;
      } else if (nl >= light) {
        fill.push({
          x: nx,
          y: ny,
          z: nz,
        });
      }
    });
  }
  floodLight(origin, fill, key);
};

const update = ({
  x,
  y,
  z,
  type,
}) => {
  const chunk = getChunk(
    Math.floor(x / size),
    Math.floor(z / size)
  );
  x -= size * chunk.x;
  z -= size * chunk.z;
  const {
    heightmap,
    voxels,
    hasPropagated,
  } = chunk;
  const voxel = getIndex(x, y, z);
  const current = voxels[voxel];
  voxels[voxel] = type;
  const heightIndex = (x * size) + z;
  const height = heightmap[heightIndex];
  if (type === types.air) {
    if (y === height) {
      for (let i = y - 1; i >= 0; i -= 1) {
        if (i === 0 || voxels[getIndex(x, i, z)] !== 0) {
          heightmap[heightIndex] = i;
          break;
        }
      }
    }
  } else if (height < y) {
    heightmap[heightIndex] = y;
  }
  if (hasPropagated) {
    if (types[current].isLight) {
      removeLight(chunk, x, y, z);
    } else if (types[current].isTransparent && !types[type].isTransparent) {
      ['light', 'sunlight'].forEach((key) => {
        if (voxels[voxel + fields[key]] !== 0) {
          removeLight(chunk, x, y, z, key);
        }
      });
    }
    if (types[type].isLight) {
      voxels[voxel + fields.light] = maxLight;
      floodLight(chunk, [{ x, y, z }]);
    } else if (types[type].isTransparent && !types[current].isTransparent) {
      const getChunk = getVoxelChunk(chunk);
      ['light', 'sunlight'].forEach((key) => {
        const queue = [];
        if (key === 'sunlight' && y === maxHeight - 1) {
          voxels[voxel + fields[key]] = maxLight;
          queue.push({ x, y, z });
        } else {
          voxelNeighbors.forEach((offset) => {
            const ny = y + offset.y;
            if (ny < 0 || ny >= maxHeight) {
              return;
            }
            const nx = x + offset.x;
            const nz = z + offset.z;
            const { chunk, cx, cz } = getChunk(nx, nz);
            const voxel = getIndex(cx, ny, cz);
            const { isLight, isTransparent } = types[chunk.voxels[voxel]];
            if (
              chunk.voxels[voxel + fields[key]] !== 0
              && (isTransparent || (isLight && key === 'light'))
            ) {
              queue.push({ x: nx, y: ny, z: nz });
            }
          });
        }
        floodLight(chunk, queue, key);
      });
    }
  }
  return chunk;
};

const getLighting = ({ light, sunlight }, neighbors) => neighbors.map((neighbors) => {
  let n1 = neighbors[0].type !== 0;
  let n2 = neighbors[1].type !== 0;
  let n3 = (n1 && n2) || (neighbors[2].type !== 0);
  const ao = [n1, n2, n3].reduce((ao, n) => (
    ao - (n ? 0.2 : 0)
  ), 1);
  let c = 1;
  let l = light;
  let s = sunlight;
  n1 = types[neighbors[0].type].isTransparent;
  n2 = types[neighbors[1].type].isTransparent;
  n3 = types[neighbors[2].type].isTransparent;
  [n1, n2, n3].forEach((n, i) => {
    if (n) {
      l += neighbors[i].light;
      s += neighbors[i].sunlight;
      c += 1;
    }
  });
  return (
    Math.max(
      Math.max(l, s * sunlightIntensity) / c / maxLight,
      0.05
    ) * ao
  );
});

const edge = { type: 0, light: 0, sunlight: maxLight };
const getVoxelData = (origin) => {
  const getChunk = getVoxelChunk(origin);
  return (x, y, z) => {
    if (y < 0 || y >= maxHeight) {
      return edge;
    }
    const { chunk, cx, cz } = getChunk(x, z);
    const i = getIndex(cx, y, cz);
    return {
      type: chunk.voxels[i],
      light: chunk.voxels[i + fields.light],
      sunlight: chunk.voxels[i + fields.sunlight],
    };
  };
};

const isVisible = (type, neighbor) => (
  types[neighbor].isTransparent
  && (
    !types[type].isTransparent
    || type !== neighbor
  )
);

const chunkNeighbors = [
  { x: -1, z: -1 },
  { x: 0, z: -1 },
  { x: 1, z: -1 },
  { x: -1, z: 0 },
  { x: 1, z: 0 },
  { x: -1, z: 1 },
  { x: 0, z: 1 },
  { x: 1, z: 1 },
];
const meshedChunks = new Map();
const mesh = (cx, cz) => {
  const chunk = getChunk(cx, cz);
  if (!meshedChunks.has(chunk.key)) {
    meshedChunks.set(chunk.key, chunk);
  }
  if (!chunk.hasPropagated) {
    propagate(chunk);
  }
  chunkNeighbors.forEach(({ x, z }) => {
    const neighbor = getChunk(chunk.x + x, chunk.z + z);
    if (!neighbor.hasPropagated) {
      propagate(neighbor);
    }
  });
  const get = getVoxelData(chunk);
  return [...Array(subchunks)].map((v, subchunk) => {
    const geometry = {
      opaque: {
        color: [],
        position: [],
        uv: [],
        index: [],
        offset: 0,
      },
      transparent: {
        color: [],
        position: [],
        uv: [],
        index: [],
        offset: 0,
      },
    };
    const pushFace = (
      p1,
      p2,
      p3,
      p4,
      type,
      lighting,
      facing
    ) => {
      const texture = types[type].textures[facing];
      const uvs = [
        [texture[0], facing + 1],
        [texture[1], facing + 1],
        [texture[1], facing],
        [texture[0], facing],
      ];
      const vertices = [p1, p2, p3, p4];
      if (lighting[0] + lighting[2] < lighting[1] + lighting[3]) {
        lighting.unshift(lighting.pop());
        uvs.unshift(uvs.pop());
        vertices.unshift(vertices.pop());
      }
      const mesh = types[type].isTransparent ? geometry.transparent : geometry.opaque;
      lighting.forEach((light) => mesh.color.push(light, light, light));
      uvs.forEach((uv) => mesh.uv.push(...uv));
      vertices.forEach((vertex) => mesh.position.push(...vertex));
      [0, 1, 2, 2, 3, 0].forEach((i) => mesh.index.push(mesh.offset + i));
      mesh.offset += 4;
    };
    const fromY = subchunk * size;
    const toY = (subchunk + 1) * size;
    for (let x = 0; x < size; x += 1) {
      for (let y = fromY; y < toY; y += 1) {
        for (let z = 0; z < size; z += 1) {
          const voxel = get(x, y, z);
          if (voxel.type !== 0) {
            const top = get(x, y + 1, z);
            const bottom = get(x, y - 1, z);
            const south = get(x, y, z + 1);
            const north = get(x, y, z - 1);
            const west = get(x - 1, y, z);
            const east = get(x + 1, y, z);
            if (isVisible(voxel.type, top.type)) {
              const n = get(x, y + 1, z - 1);
              const e = get(x + 1, y + 1, z);
              const w = get(x - 1, y + 1, z);
              const s = get(x, y + 1, z + 1);
              pushFace(
                [x, y + 1, z + 1],
                [x + 1, y + 1, z + 1],
                [x + 1, y + 1, z],
                [x, y + 1, z],
                voxel.type,
                getLighting(
                  top,
                  [
                    [w, s, get(x - 1, y + 1, z + 1)],
                    [e, s, get(x + 1, y + 1, z + 1)],
                    [e, n, get(x + 1, y + 1, z - 1)],
                    [w, n, get(x - 1, y + 1, z - 1)],
                  ]
                ),
                0
              );
            }
            if (isVisible(voxel.type, bottom.type)) {
              const n = get(x, y - 1, z - 1);
              const e = get(x + 1, y - 1, z);
              const w = get(x - 1, y - 1, z);
              const s = get(x, y - 1, z + 1);
              pushFace(
                [x, y, z],
                [x + 1, y, z],
                [x + 1, y, z + 1],
                [x, y, z + 1],
                voxel.type,
                getLighting(
                  bottom,
                  [
                    [w, n, get(x - 1, y - 1, z - 1)],
                    [e, n, get(x + 1, y - 1, z - 1)],
                    [e, s, get(x + 1, y - 1, z + 1)],
                    [w, s, get(x - 1, y - 1, z + 1)],
                  ]
                ),
                1
              );
            }
            if (isVisible(voxel.type, south.type)) {
              const e = get(x + 1, y, z + 1);
              const w = get(x - 1, y, z + 1);
              const t = get(x, y + 1, z + 1);
              const b = get(x, y - 1, z + 1);
              pushFace(
                [x, y, z + 1],
                [x + 1, y, z + 1],
                [x + 1, y + 1, z + 1],
                [x, y + 1, z + 1],
                voxel.type,
                getLighting(
                  south,
                  [
                    [w, b, get(x - 1, y - 1, z + 1)],
                    [e, b, get(x + 1, y - 1, z + 1)],
                    [e, t, get(x + 1, y + 1, z + 1)],
                    [w, t, get(x - 1, y + 1, z + 1)],
                  ]
                ),
                2
              );
            }
            if (isVisible(voxel.type, north.type)) {
              const e = get(x + 1, y, z - 1);
              const w = get(x - 1, y, z - 1);
              const t = get(x, y + 1, z - 1);
              const b = get(x, y - 1, z - 1);
              pushFace(
                [x + 1, y, z],
                [x, y, z],
                [x, y + 1, z],
                [x + 1, y + 1, z],
                voxel.type,
                getLighting(
                  north,
                  [
                    [e, b, get(x + 1, y - 1, z - 1)],
                    [w, b, get(x - 1, y - 1, z - 1)],
                    [w, t, get(x - 1, y + 1, z - 1)],
                    [e, t, get(x + 1, y + 1, z - 1)],
                  ]
                ),
                3
              );
            }
            if (isVisible(voxel.type, west.type)) {
              const n = get(x - 1, y, z - 1);
              const s = get(x - 1, y, z + 1);
              const t = get(x - 1, y + 1, z);
              const b = get(x - 1, y - 1, z);
              pushFace(
                [x, y, z],
                [x, y, z + 1],
                [x, y + 1, z + 1],
                [x, y + 1, z],
                voxel.type,
                getLighting(
                  west,
                  [
                    [n, b, get(x - 1, y - 1, z - 1)],
                    [s, b, get(x - 1, y - 1, z + 1)],
                    [s, t, get(x - 1, y + 1, z + 1)],
                    [n, t, get(x - 1, y + 1, z - 1)],
                  ]
                ),
                4
              );
            }
            if (isVisible(voxel.type, east.type)) {
              const n = get(x + 1, y, z - 1);
              const s = get(x + 1, y, z + 1);
              const t = get(x + 1, y + 1, z);
              const b = get(x + 1, y - 1, z);
              pushFace(
                [x + 1, y, z + 1],
                [x + 1, y, z],
                [x + 1, y + 1, z],
                [x + 1, y + 1, z + 1],
                voxel.type,
                getLighting(
                  east,
                  [
                    [s, b, get(x + 1, y - 1, z + 1)],
                    [n, b, get(x + 1, y - 1, z - 1)],
                    [n, t, get(x + 1, y + 1, z - 1)],
                    [s, t, get(x + 1, y + 1, z + 1)],
                  ]
                ),
                5
              );
            }
          }
        }
      }
    }
    return ['opaque', 'transparent'].reduce((meshes, key) => {
      const {
        color,
        position,
        uv,
        index,
      } = geometry[key];
      meshes[key] = {
        color: new Float32Array(color),
        position: new Uint8Array(position),
        uv: new Float32Array(uv),
        index: new Uint16Array(index),
      };
      return meshes;
    }, {});
  });
};

const remesh = (x, z) => {
  const subchunks = mesh(x, z);
  context.postMessage({
    type: 'chunk',
    position: { x, z },
    subchunks,
  }, subchunks.reduce((buffers, meshes) => {
    ['opaque', 'transparent'].forEach((mesh) => {
      mesh = meshes[mesh];
      buffers.push(
        mesh.color.buffer,
        mesh.position.buffer,
        mesh.uv.buffer,
        mesh.index.buffer
      );
    });
    return buffers;
  }, []));
};

const remeshAll = (() => {
  let debounce;
  const remeshAll = () => {
    const list = [...meshedChunks.values()];
    if (list.length) {
      list.forEach((chunk) => (
        remesh(chunk.x, chunk.z)
      ));
      return;
    }
    for (let x = -1; x < 1; x += 1) {
      for (let z = -1; z < 1; z += 1) {
        remesh(x, z);
      }
    }
  };
  return () => {
    if (debounce) {
      clearTimeout(debounce);
    }
    debounce = setTimeout(remeshAll, 0);
  };
})();

context.addEventListener('message', ({ data: message }) => {
  switch (message.type) {
    case 'types': {
      const previousTypes = types;
      const textures = { opaque: 0, transparent: 0 };
      types = [
        {
          name: 'Air',
          isLight: false,
          isTransparent: true,
        },
        ...message.types
          .map((type) => {
            const material = type.isTransparent ? 'transparent' : 'opaque';
            const index = textures[material];
            textures[material] += 3;
            return {
              ...type,
              textures: [
                index + 2,
                index,
                index + 1,
                index + 1,
                index + 1,
                index + 1,
              ],
            };
          })
          .map((type) => ({
            ...type,
            textures: type.textures.map((index) => {
              const count = textures[type.isTransparent ? 'transparent' : 'opaque'];
              return [index / count, (index + 1) / count];
            }),
          })),
      ];
      if (previousTypes) {
        let repropagate = false;
        let remap = false;
        if (types.length < previousTypes.length) {
          repropagate = true;
          remap = previousTypes.map(({ key }) => {
            if (!key) {
              return 0;
            }
            const index = types.findIndex(({ key: id }) => (id === key));
            return ~index ? index : 0;
          });
        } else {
          const [current, update] = [previousTypes, types]
            .map((types) => types.reduce((types, { isLight, isTransparent }, i) => {
              if (isLight || isTransparent) {
                types.push(i);
              }
              return types;
            }, []));
          repropagate = (
            current.length !== update.length
            || current.find((i) => (i !== update[i]))
          );
        }
        if (repropagate) {
          [...chunks.values()].forEach(({ key }) => {
            if (!meshedChunks.has(key)) {
              chunks.delete(key);
            }
          });
          [...meshedChunks.values()].forEach((chunk) => {
            const { key, voxels } = chunk;
            const { length } = voxels;
            let count = 0;
            for (let i = 0; i < length; i += fields.count) {
              if (remap) {
                voxels[i] = remap[voxels[i]];
              }
              voxels[i + fields.light] = types[voxels[i]].isLight ? maxLight : 0;
              voxels[i + fields.sunlight] = 0;
              if (voxels[i] !== 0) {
                count += 1;
              }
            }
            if (count > 0) {
              chunk.hasPropagated = false;
            } else {
              chunks.delete(key);
            }
          });
        }
      }
      remeshAll();
      break;
    }
    case 'sunlight':
      sunlightIntensity = message.intensity;
      remeshAll();
      break;
    case 'update': {
      const chunk = update(message.update);
      [
        chunk,
        ...chunkNeighbors.map(({ x, z }) => ({
          x: chunk.x + x,
          z: chunk.z + z,
        })),
      ].forEach((chunk) => (
        remesh(chunk.x, chunk.z)
      ));
      break;
    }
    case 'pick': {
      let { block: { x, y, z } } = message;
      const chunk = getChunk(
        Math.floor(x / size),
        Math.floor(z / size)
      );
      x -= size * chunk.x;
      z -= size * chunk.z;
      context.postMessage({
        type: 'pick',
        block: chunk.voxels[getIndex(x, y, z)],
      });
      break;
    }
    case 'load':
      chunks.clear();
      meshedChunks.clear();
      types = undefined;
      message.chunks.forEach(({ x, z, voxels: serialized }) => {
        const key = `${x}:${z}`;
        const deserialized = new Uint8ClampedArray(atob(serialized).split('').map((c) => c.charCodeAt(0)));
        const voxels = new Uint8ClampedArray(size * size * maxHeight * fields.count);
        const heightmap = new Uint8ClampedArray(size ** 2);
        for (let x = 0, i = 0, j = 0; x < size; x += 1) {
          for (let y = 0; y < maxHeight; y += 1) {
            for (let z = 0; z < size; z += 1, i += fields.count, j += 1) {
              const type = deserialized[j];
              voxels[i] = type;
              if (type !== 0) {
                const heightmapIndex = (x * size) + z;
                if (heightmap[heightmapIndex] < y) {
                  heightmap[heightmapIndex] = y;
                }
                if (message.types[type - 1].isLight) {
                  voxels[i + fields.light] = maxLight;
                }
              }
            }
          }
        }
        chunks.set(key, {
          x,
          z,
          voxels,
          heightmap,
          hasPropagated: false,
          key,
        });
      });
      break;
    case 'save':
      context.postMessage({
        type: 'save',
        chunks: [...meshedChunks.values()].map(({ x, z, voxels }) => {
          const data = new Uint8ClampedArray(size * size * maxHeight);
          const { length } = voxels;
          for (let i = 0, j = 0; i < length; i += 1, j += fields.count) {
            data[i] = voxels[j];
          }
          return {
            x,
            z,
            voxels: btoa(String.fromCharCode.apply(null, data)),
          };
        }),
      });
      break;
    default:
      break;
  }
});
