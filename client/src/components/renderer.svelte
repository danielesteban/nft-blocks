
<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import {
    ACESFilmicToneMapping,
    Clock,
    Group,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    WebGLRenderer,
  } from 'three';

  const dispatch = createEventDispatcher();

  export let initialPosition = { x: 0, y: 0, z: 0 };
  export let controls = undefined;
  export let scene = new Scene();
  export let support = { ar: false, vr: false };
  let canvas;
  let renderer;
  let viewport;

  const camera = new PerspectiveCamera(70, 1, 0.1, 1000);
  const clock = new Clock();
  const player = new Group();
  player.position.copy(initialPosition);
  player.add(camera);
  scene.add(player);
  player.camera = camera;
  scene.player = player;
  $: controls && controls.setup(player);

  scene.onBeforeRender = (renderer, scene, camera) => {
    if (controls) {
      controls.onAnimationTick({
        animation: renderer.animation,
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
      alpha: true,
      antialias: true,
      stencil: false,
      powerPreference: 'high-performance',
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setAnimationLoop(onAnimationTick);
    requestAnimationFrame(onResize);

    if (navigator.xr) {
      renderer.xr.enabled = true;
      navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
          support = { ...support, ar: !!supported };
        });
      navigator.xr.isSessionSupported('immersive-vr')
        .then((supported) => {
          support =  { ...support, vr: !!supported };
        });
    }
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

  const requestSession = (mode, init = {}) => {
    if (renderer.xr.isPresenting) {
      return;
    }
    navigator.xr.requestSession(`immersive-${mode}`, init)
      .then((session) => {
        if (mode === 'ar') {
          renderer.xr.setReferenceSpaceType('local');
        }
        renderer.xr.setSession(session);
        dispatch(`enter${mode.toUpperCase()}`);
        session.addEventListener('end', () => {
          renderer.xr.setSession(null);
          dispatch(`exit${mode.toUpperCase()}`);
        });
      })
      .catch(() => {});
  };

  export const enterAR = () => {
    if (support.ar) {
      requestSession('ar')
    }
  };

  export const enterVR = (init = {}) => {
    if (support.vr) {
      requestSession('vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      })
    }
  };
</script>

<svelte:window on:resize={onResize} />
<canvas
  bind:this={canvas}
  on:mousedown={() => (
    controls && controls.request && controls.request()
  )}
/>
