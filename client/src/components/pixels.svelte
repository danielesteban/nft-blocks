<script>
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let color;
  export let pixels;
  export let showGrid = true;

  const size = { x: 16, y: 16 };
  const scale = { x: 24, y: 24 };

  let canvas;
  let ctx;
  let grid;

  onMount(() => {
    ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;
    {
      const ctx = grid.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.strokeStyle = 'rgba(25, 25, 25, 0.5)';
      for (let i = 0, y = 0; y < size.y; y += 1) {
        for (let x = 0; x < size.x; x += 1, i += 1) {
          ctx.strokeRect(
            x * scale.x, y * scale.y,
            scale.x, scale.y
          );
        }
      }
    }
  });

  let lastPixel;
  let lastColor;
  $: if (color !== lastColor) {
    lastColor = color;
    lastPixel = undefined;
  }

  let lastPixels;
  $: if (ctx && pixels !== lastPixels) {
    lastPixels = pixels;
    lastPixel = undefined;
    for (let i = 0, y = 0; y < size.y; y += 1) {
      for (let x = 0; x < size.x; x += 1, i += 4) {
        ctx.fillStyle = `rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`;
        ctx.fillRect(
          x * scale.x, y * scale.y,
          scale.x, scale.y
        );
      }
    }
  }

  let isDrawing = false;
  const onMouseMove = ({ clientX, clientY }) => {
    if (!isDrawing) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / (rect.right - rect.left) * canvas.width) / scale.x);
    const y = Math.floor(((clientY - rect.top) / (rect.bottom - rect.top) * canvas.height) / scale.y);
    const pixel = ((size.x * y) + x) * 4;
    if (pixel !== lastPixel) {
      lastPixel = pixel;
      pixels[pixel] = color[0];
      pixels[pixel + 1] = color[1];
      pixels[pixel + 2] = color[2];
      pixels[pixel + 3] = color[3];
      ctx.fillStyle = `rgb(${color.slice(0, 3).join(',')})`;
      ctx.fillRect(
        x * scale.x, y * scale.y,
        scale.x, scale.y
      );
      dispatch('update', pixels);
    }
  };
  const onMouseDown = (e) => {
    isDrawing = true;
    onMouseMove(e);
  };
  const onMouseUp = () => {
    isDrawing = false;
  };
</script>

<svelte:window on:blur={onMouseUp} on:mouseup={onMouseUp} />

<pixels>
  <canvas
    bind:this={canvas}
    width={size.x * scale.x}
    height={size.y * scale.y}
    on:mousedown={onMouseDown}
    on:mousemove={onMouseMove}
  />
  <canvas
    class="grid"
    class:visible={showGrid}
    bind:this={grid}
    width={size.x * scale.x}
    height={size.y * scale.y}
  />
</pixels>

<style>
  pixels {
    display: block;
    position: relative;
  }

  canvas {
    display: block;
  }

  canvas.grid {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  canvas.grid.visible {
    display: block;
  }
</style>
