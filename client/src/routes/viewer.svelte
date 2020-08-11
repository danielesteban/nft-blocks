<script>
  import { Box3 } from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import Renderer from '../components/renderer.svelte';
  import DesktopControls from '../components/desktopControls.svelte';

  let controls;
  let model;
  let scene;

  const onDragOver = (e) => e.preventDefault();

  const bounds = new Box3();
  const loader = new GLTFLoader();
  const onDrop = (e) => {
    e.preventDefault();
    const [file] = e.dataTransfer.files;
    if (file && file.name.lastIndexOf('.glb') === file.name.length - 4) {
      const reader = new FileReader();
      reader.onload = () => {
        loader.parse(reader.result, '', onLoad);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onLoad = (gltf) => {
    const { player } = scene;
    if (model) {
      scene.remove(model);
    }
    model = gltf.scene;
    bounds
      .setFromObject(model)
      .getCenter(player.position);
    player.position.z = bounds.max.z + 4;
    player.camera.rotation.set(0, 0, 0);
    scene.add(model);
  };

  loader.load(
    'https://cloudflare-ipfs.com/ipfs/Qmd5iiYoUnm9sFLF4Ec3Vgn3kjoBMkGUpZBuxtBi92t1Qa',
    onLoad
  );
</script>

<svelte:window on:dragover={onDragOver} on:drop={onDrop} />

<viewer>
  <DesktopControls
    bind:this={controls}
  />
  <Renderer
    bind:scene={scene}
    controls={controls}
  />
</viewer>

<style>
  viewer {
    display: block;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>