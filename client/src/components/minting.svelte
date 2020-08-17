<script>
  import { onMount } from 'svelte';
  import { isMinting } from '../stores/tokens';
  
  let canvas;
  let ctx;
  let animation;

  onMount(() => {
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.font = '700 24px VT323';
  });
  
  const width = 480;
  const height = 256;
  const lines = [...Array(24)].map(() => {
    const c = 10 + Math.floor(Math.random() * 10);
    return {
      x: 4 + Math.floor(Math.random() * (width / 20)) * 20,
      y: -(c * 20) - (Math.random() * height),
      c: [...Array(c)].map(() => (Math.random() > 0.5 ? 0 : 1)),
      s: 2 + Math.random() * 8,
      l: Math.random() * 0.5 + 0.5,
    };
  });
  let lastTick = 0;
  const animate = (time) => {
    animation = requestAnimationFrame(animate);
    const delta = Math.min(time - lastTick, 1);
    if (delta < 1 / 30) {
      return;
    }
    lastTick = time;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);
    lines.forEach((line) => {
      const {
        x,
        y,
        c,
        s,
        l,
      } = line;
      ctx.fillStyle = `rgb(${l * 0x7F},${l * 0x7F},${l * 0x7F})`;
      c.forEach((c, i) => (
        ctx.fillText(c, x, y + i * 20)
      ));
      line.y += delta * s;
      if (line.y > height) {
        line.x = 4 + Math.floor(Math.random() * (width / 20)) * 20;
        line.y = -(c.length * 20) - (Math.random() * height);
        line.s = 2 + Math.random() * 8;
        line.l = Math.random() * 0.5 + 0.5;
      }
    });
  };

  let wasMinting;
  $: if (wasMinting != $isMinting) {
    wasMinting = $isMinting;
    cancelAnimationFrame(animation);
    if ($isMinting) {
      animation = requestAnimationFrame(animate);
    }
  };
</script>

<overlay class:visible={$isMinting}>
  <minting>
    <canvas
      bind:this={canvas}
      width={width}
      height={height}
    />
    <feedback>
      Waiting for blockchain confirmation...
    </feedback>
  </minting>
</overlay>

<style>
  overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: none;
  }

  overlay.visible {
    display: block;
  }

  minting {
    position: absolute;
    top: 50%;
    left: 50%;
    box-sizing: border-box;
    width: 512px;
    padding: 1rem 0;
    transform: translate(-50%, -60%);
    background: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #111;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  feedback {
    display: block;
    margin-top: 1rem;
  }
</style>
