<script>
  import { Box3 } from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import Renderer from '../components/renderer.svelte';
  import DesktopControls from '../components/desktopControls.svelte';
  import { hashes, list, status } from '../stores/tokens';

  export let params;

  let controls;
  let model;
  let scene;
  let support;
  let enterAR;
  let enterVR;

  const onDragOver = (e) => e.preventDefault();

  const bounds = new Box3();
  const loader = new GLTFLoader();

  let isLoading = false;
  const onDrop = (e) => {
    e.preventDefault();
    const [file] = e.dataTransfer.files;
    if (file && file.name.lastIndexOf('.glb') === file.name.length - 4) {
      isLoading = true;
      const reader = new FileReader();
      reader.onload = () => {
        loader.parse(reader.result, '', onLoad);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const load = (hash) => {
    isLoading = true;
    loader.load(`${__IPFS__}${hash}`, onLoad);
  };

  let isAR = false;
  const resetView = () => {
    const { player } = scene;
    if (!model) {
      return;
    }
    const scale = isAR ? 0.1 : 1;
    const offset = isAR ? 0.5 : 4;
    model.scale.setScalar(scale);
    bounds
      .setFromObject(model)
      .getCenter(player.position);
    player.position.z = bounds.max.z + offset;
    player.camera.rotation.set(0, 0, 0);
  };

  const onLoad = (gltf) => {
    const { player } = scene;
    if (model) {
      scene.remove(model);
    }
    model = gltf.scene;
    scene.add(model);
    isLoading = false;
    resetView();
  };

  const onEnterAR = () => {
    isAR = true;
    resetView();
  };
  
  const onExitAR = () => {
    isAR = false;
    resetView();
  };

  $: tokenId = $status !== 'loading' && params && params[0];
  $: hash = tokenId && $hashes[tokenId];
  $: tokenId && !hash && hashes.fetch(tokenId);
  $: hash && load(hash);
</script>

<svelte:window on:dragover={onDragOver} on:drop={onDrop} />

<token>
  <DesktopControls
    bind:this={controls}
  />
  <Renderer
    bind:scene={scene}
    bind:support={support}
    bind:enterAR={enterAR}
    bind:enterVR={enterVR}
    on:enterAR={onEnterAR}
    on:exitAR={onExitAR}
    controls={controls}
  />
  {#if support && (support.ar || support.vr)}
    <actions>
      {#if support.ar}
        <button on:click={enterAR}>EnterAR</button>
      {/if}
      {#if support.vr}
        <button on:click={enterVR}>EnterVR</button>
      {/if}
    </actions>
  {/if}
  {#if isLoading || $status === 'loading' || (tokenId && !hash)}
    <feedback>
      Loading blocks...
    </feedback>
  {/if}
</token>

<style>
  token {
    display: block;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  actions {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translate(-50%, 0);
  }

  feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>