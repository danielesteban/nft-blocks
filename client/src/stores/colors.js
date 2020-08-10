import { writable } from 'svelte/store';

export default () => {
  const { subscribe, update } = writable({
    area: [0xFF, 0, 0],
    current: [0xFF, 0, 0, 0xFF],
    noise: 0,
    palette: [...Array(8)].map(() => [0, 0, 0, 127]),
  });
  return {
    subscribe,
    addToPalette(color) {
      update((colors) => ({
        ...colors,
        palette: [
          [...color],
          ...colors.palette.slice(0, colors.palette.length - 1),
        ],
      }));
    },
    setAlpha(alpha) {
      update((colors) => ({
        ...colors,
        current: [
          ...colors.current.slice(0, 3),
          alpha,
        ],
      }));
    },
    setColor(rgba, updateArea = false) {
      update((colors) => ({
        ...colors,
        current: rgba,
        area: updateArea ? rgba.slice(0, 3) : colors.area,
      }));
    },
    setNoise(noise) {
      update((colors) => ({
        ...colors,
        noise,
      }));
    },
  };
};
