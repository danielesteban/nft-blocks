
<script>
  import { onDestroy, onMount } from 'svelte';
  import {
    ACESFilmicToneMapping,
    Clock,
    Group,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    WebGLRenderer,
  } from 'three';

  export let initialPosition = { x: 0, y: 0, z: 0 };
  export let controls = undefined;
  export let scene = new Scene();
  let canvas;
  let renderer;
  let viewport;

  const camera = new PerspectiveCamera(70, 1, 0.1, 1000);
  const clock = new Clock();
  const player = new Group();
  player.position.copy(initialPosition);
  player.add(camera);
  scene.add(player);
  $: controls && controls.setup({ camera, player });

  scene.onBeforeRender = (renderer, scene, camera) => {
    if (controls) {
      controls.onAnimationTick({
        delta: renderer.animation.delta,
        camera,
        player,
        viewport,
      });
    }
  };

  onDestroy(() => {
    renderer.dispose();
    renderer.forceContextLoss();
  });

  onMount(() => {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      stencil: false,
      powerPreference: 'high-performance',
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setAnimationLoop(onAnimationTick);
    requestAnimationFrame(onResize);
  });

  const onAnimationTick = () => {
    renderer.animation = {
      delta: Math.min(clock.getDelta(), 1 / 30),
      time: clock.oldTime / 1000,
    };
    renderer.render(scene, camera);
  };

  const onResize = () => {
    viewport = canvas.parentNode.getBoundingClientRect();
    const width = Math.floor(viewport.width);
    const height = Math.floor(viewport.height);
    if (renderer.xr.isPresenting) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    } else {
      renderer.setSize(width, height);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    onAnimationTick();
  };
</script>

<svelte:window on:resize={onResize} />
<canvas
  bind:this={canvas}
  on:mousedown={() => (
    controls && !renderer.xr.isPresenting && controls.request()
  )}
/>
