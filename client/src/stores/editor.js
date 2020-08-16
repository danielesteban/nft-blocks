import { writable } from 'svelte/store';

export default () => {
  const { subscribe, set } = writable(0);
  const update = (type) => {
    set(type);
    requestAnimationFrame(() => (
      window.dispatchEvent(new Event('resize'))
    ));
  };
  return {
    subscribe,
    close() {
      update(undefined);
    },
    open(type) {
      update(type);
    },
  };
};
