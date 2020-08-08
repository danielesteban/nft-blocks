<script>
  import { onMount } from 'svelte';
  import Color from './color.svelte';
  
  export let colors;
  export let enableOpacity;

  const width = 384;
  const height = 286;

  const area = {
    x: 16,
    y: 16,
    width: width - 80,
    height: height - 32,
  };
  const strip = {
    x: width - 48,
    y: 16,
    width: 32,
    height: height - 32,
  };

  let canvas;
  let ctx;

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    {
      ctx.save();
      const {
        x,
        y,
        width,
        height,
      } = area;
      ctx.translate(x, y);
      ctx.fillStyle = `rgb(${$colors.area.join(',')})`;
      ctx.fillRect(0, 0, width, height);

      const grdWhite = ctx.createLinearGradient(0, 0, width, 0);
      grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
      grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grdWhite;
      ctx.fillRect(0, 0, width, height);

      const grdBlack = ctx.createLinearGradient(0, 0, 0, height);
      grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
      grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = grdBlack;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    {
      ctx.save();
      const {
        x,
        y,
        width,
        height,
      } = strip;
      ctx.translate(x, y);
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      [
        '255,0,0',
        '255,0,255',
        '0,0,255',
        '0,255,255',
        '0,255,0',
        '255,255,0',
        '255,0,0',
      ].forEach((color, i) => {
        grd.addColorStop(Math.min(0.17 * i, 1), `rgb(${color})`);
      });
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  };

  onMount(() => {
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  });

  let lastArea;
  $: if (ctx && $colors.area !== lastArea) {
    lastArea = $colors.area;
    draw();
  }

  let isPicking = false;
  const onMouseMove = ({ clientX, clientY }) => {
    if (!isPicking) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const pointer = {
      x: ((clientX - rect.left) / (rect.right - rect.left)) * width,
      y: ((clientY - rect.top) / (rect.bottom - rect.top)) * height,
    };
    for (let i = 0; i < 2; i += 1) {
      const {
        x,
        y,
        width,
        height,
      } = i === 0 ? area : strip;
      if (
        pointer.x >= x
        && pointer.x <= x + width
        && pointer.y >= y
        && pointer.y <= y + height
      ) {
        const imageData = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
        colors.setColor([
          imageData[0],
          imageData[1],
          imageData[2],
          $colors.current[3]
        ], i === 1);
        break;
      }
    }
  };
  const onMouseDown = (e) => {
    isPicking = true;
    onMouseMove(e);
  };
  const onMouseUp = () => {
    isPicking = false;
  };

  $: current = enableOpacity ? $colors.current : [...$colors.current.slice(0, 3), 0xFF];
  $: opacity = $colors.current[3];
</script>

<svelte:window on:blur={onMouseUp} on:mouseup={onMouseUp} />

<colorpicker>
  <tools>
    <Color color={current} />
    <label>
      Opacity:
      <input
        disabled={!enableOpacity}
        type="range"
        min={0}
        max={0xFF}
        step={1}
        value={opacity}
        on:change={({ target: { value }}) => { colors.setAlpha(value); }}
      />
    </label>
  </tools>
  <canvas
    bind:this={canvas}
    width={width}
    height={height}
    on:mousedown={onMouseDown}
    on:mousemove={onMouseMove}
  />
  <palette>
    {#each $colors.palette as rgba}
      <div on:click={() => colors.setColor(rgba, true)}>
        <Color
          color={rgba}
        />
      </div>
    {/each}
  </palette>
</colorpicker>

<style>
  colorpicker {
    display: flex;
    height: 100%;
    background: #222;
    flex-direction: column;
  }

  tools {
    box-sizing: border-box;
    padding: 1rem;
    display: flex;
    align-items: center;
    border-bottom: 2px solid #111;
  }

  tools > label {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  canvas {
    display: block;
    background: #000;
    border: 8px solid #222;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  palette {
    box-sizing: border-box;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 2px solid #111;
  }

  palette > div {
    margin: 0 0.25rem;
  }
</style>
