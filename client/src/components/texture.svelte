<script>
  import { onMount } from 'svelte';

  export let pixels;

  const size = { x: 16, y: 16 };
  const scale = { x: 4, y: 4 };

  let canvas;
  let ctx;

  onMount(() => {
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  });

  $: if (ctx) {
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
</script>

<texture>
  <canvas
    bind:this={canvas}
    width={size.x * scale.x}
    height={size.y * scale.y}
  />
</texture>

<style>
  texture {
    display: block;
    position: relative;
  }

  canvas {
    display: block;
  }
</style>
