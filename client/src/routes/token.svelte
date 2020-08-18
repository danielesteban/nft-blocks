<script>
  import { Box3 } from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import ARControls from '../components/controls/ar.svelte';
  import DesktopControls from '../components/controls/desktop.svelte';
  import VRControls from '../components/controls/vr.svelte';
  import Renderer from '../components/renderer.svelte';
  import router from '../stores/router';
  import {
    creators,
    hashes,
    list,
    owners,
    status,
  } from '../stores/tokens';

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

  const load = (hash) => {
    isLoading = true;
    loader.load(`${__IPFS__}${hash}`, (gltf) => {
      const { player } = scene;
      if (model) {
        scene.remove(model);
      }
      model = gltf.scene;
      scene.add(model);
      isLoading = false;
      resetView();
    });
  };

  const resetView = () => {
    const { player } = scene;
    if (!model) {
      return;
    }
    const scale = isAR ? 0.05 : 1;
    const offset = isAR ? 0.5 : 4;
    model.scale.setScalar(scale);
    bounds
      .setFromObject(model)
      .getCenter(player.position);
    if (!isAR) {
      player.position.y -= 1.6;
    }
    player.position.z = bounds.max.z + offset;
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

  $: (!params || !params[0]) && router.replace('/');
  $: tokenId = $status !== 'loading' && params[0];
  $: hash = tokenId && $hashes[tokenId];
  $: tokenId && !hash && hashes.fetch(tokenId).catch(() => router.replace('/'));
  $: hash && load(hash);

  $: creator = tokenId && $creators[tokenId];
  $: tokenId && !creator && creators.fetch(tokenId).catch(() => {});
  $: owner = tokenId && $owners[tokenId];
  $: tokenId && !owner && owners.fetch(tokenId).catch(() => {});
  $: formattedId = tokenId && `#${(`000000${tokenId}`).slice(-Math.max(`${tokenId}`.length, 6))}`;
  $: formattedCreator = creator && `${creator.slice(0, 6).toUpperCase()}`;
  $: formattedOwner = owner && `${owner.slice(0, 6).toUpperCase()}`;

  const openseaLink = (__NetworkId__ === '1' || __NetworkId__ === '4') && (
    `https://${__NetworkId__ === '4' ? 'rinkeby.' : ''}opensea.io/assets/${__TokensAddress__}/{id}`
  );
  $: opensea = openseaLink && tokenId && openseaLink.replace(/{id}/, tokenId);
</script>

<token>
  <viewport>
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
      alpha
    />
  </viewport>
  {#if tokenId}
    <info>
      <id>
        Blocks {formattedId}
      </id>
      <creator>
        Created by {creator ? formattedCreator : '...'}
      </creator>
      <owner>
        Owned by {owner ? formattedOwner : '...'}
      </owner>
      {#if opensea}
        <a
          href="{opensea}"
          rel="noopener noreferrer"
          target="_blank"
        >
          View on OpenSea
        </a>
      {/if}
    </info>
  {/if}
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
    position: relative;
    display: block;
    height: 100%;
  }

  viewport {
    display: block;
    background: #000;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
  }

  info {
    display: block;
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  info > id , info > creator, info > owner {
    display: block;
  }

  info > a {
    color: #393;
    text-decoration: underline;
    font-weight: 700;
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
    padding: 0.75rem 2rem;
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
