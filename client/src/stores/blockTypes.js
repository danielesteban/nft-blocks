import { get, writable } from 'svelte/store';

const textureWidth = 16;
const textureHeight = 16;

const defaultTexture = () => {
  const pixels = new Uint8ClampedArray(textureWidth * textureHeight * 4);
  for (let y = 0; y < textureHeight; y += 1) {
    for (let x = 0; x < textureWidth; x += 1) {
      let light = 0.9 + Math.random() * 0.05;
      if (
        x === 0
        || x === textureWidth - 1
        || y === 0
        || y === textureWidth - 1
      ) {
        light *= 0.9;
      } else if (
        x === 1
        || x === textureWidth - 2
        || y === 1
        || y === textureWidth - 2
      ) {
        light *= 1.2;
      }
      light = Math.floor(Math.min(Math.max(light, 0), 1) * 0xFF);
      const i = (y * textureWidth + x) * 4;
      pixels[i] = light;
      pixels[i + 1] = light;
      pixels[i + 2] = light;
      pixels[i + 3] = 0xFF;
    }
  }
  return pixels;
};

const generateDefaultTextures = () => ({
  bottom: defaultTexture(),
  side: defaultTexture(),
  top: defaultTexture(),
});

export default () => {
  let createDefaultTextures;
  let deserializeTextures;
  let updateAtlas;
  const textures = (() => {
    const { subscribe, set, update } = writable([]);
    createDefaultTextures = () => {
      update((types) => [...types, generateDefaultTextures()]);
      updateAtlas();
    };
    deserializeTextures = (serialized) => {
      set(serialized.map((serialized) => ['bottom', 'side', 'top'].reduce((textures, key) => {
        textures[key] = new Uint8ClampedArray(atob(serialized[key]).split('').map((c) => c.charCodeAt(0)));
        return textures;
      }, {})));
      updateAtlas();
    };
    return {
      subscribe,
      update(type, texture, pixels) {
        update((types) => [
          ...types.slice(0, type),
          {
            ...types[type],
            [texture]: pixels,
          },
          ...types.slice(type + 1),
        ]);
        updateAtlas();
      },
    };
  })();
  const types = (() => {
    const { subscribe, set, update } = writable([]);
    return {
      subscribe,
      create(type = {}) {
        update((types) => [...types, {
          name: type.name || 'New Block',
          isLight: type.isLight || false,
          isTransparent: type.isTransparent || false,
        }]);
        createDefaultTextures();
      },
      update(type, key, value) {
        update((types) => [
          ...types.slice(0, type),
          {
            ...types[type],
            [key]: value,
          },
          ...types.slice(type + 1),
        ]);
        if (key === 'isTransparent') {
          updateAtlas();
        }
      },
      deserialize(types) {
        const serializedTextures = [];
        set(types.map(({ textures, ...type }, i) => {
          serializedTextures[i] = textures;
          return type;
        }));
        deserializeTextures(serializedTextures);
      },
      serialize() {
        const $textures = get(textures);
        const $types = get(types);
        return $types.map((type, i) => ({
          ...type,
          textures: ['bottom', 'side', 'top'].reduce((textures, key) => {
            textures[key] = btoa(String.fromCharCode.apply(null, $textures[i][key]));
            return textures;
          }, {}),
        }));
      },
    };
  })();
  const atlas = (() => {
    const { subscribe, set } = writable();
    updateAtlas = () => {
      const $textures = get(textures);
      const $types = get(types);
      const materials = $types.reduce((materials, { isTransparent }, i) => {
        const { bottom, side, top } = $textures[i];
        const type = materials[isTransparent ? 'transparent' : 'opaque'];
        type.push(
          bottom,
          side,
          top
        );
        return materials;
      }, { opaque: [], transparent: [] });
      set(['opaque', 'transparent'].reduce((atlas, key) => {
        const width = materials[key].length * textureWidth;
        const height = textureHeight;
        const hasAlpha = key === 'transparent';
        const strideX = hasAlpha ? 4 : 3;
        const strideY = width * strideX;
        const pixels = new Uint8ClampedArray(strideY * height);
        materials[key].forEach((texture, i) => {
          const offset = i * textureWidth;
          for (let y = 0, j = 0; y < textureHeight; y += 1) {
            for (let x = 0; x < textureWidth; x += 1, j += 4) {
              const p = (y * strideY) + ((offset + x) * strideX);
              pixels[p] = texture[j];
              pixels[p + 1] = texture[j + 1];
              pixels[p + 2] = texture[j + 2];
              if (hasAlpha) {
                pixels[p + 3] = texture[j + 3];
              }
            }
          }
        });
        atlas[key] = {
          pixels,
          width,
          height,
        };
        return atlas;
      }, {}));
    };
    return {
      subscribe,
    };
  })();
  [
    {
      name: 'Default block',
    },
    {
      name: 'Default light',
      isLight: true,
    },
  ].forEach((type) => (
    types.create(type)
  ));
  return { atlas, types, textures };
};
