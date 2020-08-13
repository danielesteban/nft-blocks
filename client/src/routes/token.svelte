<script>
  import { Box3 } from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import ARControls from '../components/controls/ar.svelte';
  import DesktopControls from '../components/controls/desktop.svelte';
  import VRControls from '../components/controls/vr.svelte';
  import Renderer from '../components/renderer.svelte';
  import { hashes, list, status } from '../stores/tokens';

  export let params;

  let controls;
  let isLocked;
  let model;
  let scene;
  let support;
  let enterAR;
  let enterVR;

  const bounds = new Box3();
  const loader = new GLTFLoader();

  let isLoading = false;
  let isAR = false;
  let isVR = false;

  const onDragOver = (e) => e.preventDefault();

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

  $: tokenId = $status !== 'loading' && params && params[0];
  $: hash = tokenId && $hashes[tokenId];
  $: tokenId && !hash && hashes.fetch(tokenId);
  $: hash && load(hash);

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

  const onEnterVR = () => {
    isVR = true;
  };
  
  const onExitVR = () => {
    isVR = false;
  };
</script>

<svelte:window on:dragover={onDragOver} on:drop={onDrop} />

<token>
  {#if isAR}
    <ARControls
      bind:this={controls}
    />
  {:else if isVR}
    <VRControls
      bind:this={controls}
    />
  {:else}
    <DesktopControls
      bind:this={controls}
      bind:isLocked={isLocked}
    />
  {/if}
  <Renderer
    bind:scene={scene}
    bind:support={support}
    bind:enterAR={enterAR}
    bind:enterVR={enterVR}
    on:enterAR={onEnterAR}
    on:exitAR={onExitAR}
    on:enterVR={onEnterVR}
    on:exitVR={onExitVR}
    controls={controls}
  />
  {#if support && (support.ar || support.vr) && !isLocked}
    <actions>
      {#if support.ar}
        <button on:click={enterAR}>Enter AR</button>
      {/if}
      {#if support.vr}
        <button on:click={enterVR}>Enter VR</button>
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
    display: flex;
    bottom: 1rem;
    left: 50%;
    transform: translate(-50%, 0);
  }

  actions > button {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    margin: 0 0.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>