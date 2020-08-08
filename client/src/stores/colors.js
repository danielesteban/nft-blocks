import { writable } from 'svelte/store';

export default () => {
  const { subscribe, update } = writable({
    area: [0xFF, 0, 0],
    current: [0xFF, 0, 0, 0xFF],
    palette: [...Array(8)].map(() => [0, 0, 0]),
  });
  return {
    subscribe,
    addToPalette(color) {
      update((colors) => ({
        ...colors,
        palette: [
          [color[0], color[1], color[2]],
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
    setArea(rgb) {
      update((colors) => ({
        ...colors,
        area: rgb,
      }));
    },
    setColor(rgba, updateArea = false) {
      update((colors) => ({
        ...colors,
        current: rgba,
        area: updateArea ? rgba.slice(0, 3) : colors.area,
      }));
    },
  };
};
