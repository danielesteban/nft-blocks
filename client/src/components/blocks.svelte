<script>
  import { onDestroy } from 'svelte';
  import { Vector3 } from 'three';
  import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
  import DesktopControls from './controls/desktop.svelte';
  import Help from './help.svelte';
  import Renderer from './renderer.svelte';
  import Voxels from '../renderables/voxels';

  export let atlas;
  export let selected;
  export let types;

  let controls;
  let isLocked;
  let scene;
  let sunlight = 0.5;

  const initialPosition = { x: 0, y: 21, z: 8 };
  const worker = new Worker('dist/blocks.worker.js');
  const subchunks = new Map();
  const children = [];
  worker.addEventListener('message', ({ data: message }) => {
    switch (message.type) {
      case 'chunk':
        message.subchunks.forEach((geometries, subchunk) => {
          subchunk = {
            ...message.position,
            y: subchunk,
          };
          const key = `${subchunk.x}:${subchunk.y}:${subchunk.z}`;
          let voxels = subchunks.get(key);
          if (!voxels) {
            voxels = new Voxels(subchunk);
            scene.add(voxels);
            subchunks.set(key, voxels);
          }
          voxels.update(geometries);
        });
        children.length = 0;
        [...subchunks.values()].forEach(({ meshes }) => {
          if (meshes.opaque.visible) {
            children.push(meshes.opaque);
          }
          if (meshes.transparent.visible) {
            children.push(meshes.transparent);
          }
        });
        break;
      case 'pick':
        onPick(message.block);
        break;
      case 'save':
        onSave(message.chunks);
        break;
      default:
        break;
    }
  });

  $: Voxels.updateAtlas($atlas);

  $: worker.postMessage({
    type: 'types',
    types: $types,
  });

  $: worker.postMessage({
    type: 'sunlight',
    intensity: sunlight,
  });

  const loader = document.createElement('input');
  loader.accept = 'application/json';
  loader.type = 'file';
  loader.style.display = 'none';
  document.body.appendChild(loader);
  export const load = () => {
    loader.onchange = ({ target: { files: [file] } }) => {
      const reader = new FileReader();
      reader.onload = () => {
        let serialized;
        try {
          serialized = JSON.parse(reader.result);
        } catch (e) {
          return;
        }
        types.deserialize(serialized.types);
        sunlight = serialized.sunlight;
        worker.postMessage({
          type: 'load',
          types: $types,
          chunks: serialized.chunks,
        });
      };
      reader.readAsText(file);
    };
    loader.click();
  };

  const downloader = document.createElement('a');
  downloader.style.display = 'none';
  document.body.appendChild(downloader);
  const onSave = (chunks) => {
    downloader.href = URL.createObjectURL(new Blob([JSON.stringify({
      types: types.serialize(),
      chunks,
      sunlight,
    })], { type: 'application/json' }));
    downloader.download = 'blocks.json';
    downloader.click();
  };
  export const save = () => (
    worker.postMessage({
      type: 'save',
    })
  );

  const exporter = new GLTFExporter();
  export const gltf = (download) => {
    const materials = Voxels.getExportableMaterials();
    return new Promise((resolve) => exporter.parse((
      [...subchunks.values()]
        .filter(({ meshes: { opaque, transparent } }) => (
          opaque.visible || transparent.visible
        ))
        .map((mesh) => mesh.clone(materials))
    ), (buffer) => {
      const blob = new Blob([buffer], { type: 'model/gltf-binary' });
      if (download) {
        downloader.href = URL.createObjectURL(blob);
        downloader.download = 'blocks.glb';
        downloader.click();
      }
      resolve(blob);
    }, {
      binary: true,
    }));
  };

  onDestroy(() => {
    document.body.removeChild(loader);
    document.body.removeChild(downloader);
    worker.terminate();
  });

  const blockFacings = [
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
    new Vector3(-1, 0, 0),
    new Vector3(1, 0, 0),
  ];
  const getBlock = (raycaster, neighbor) => {
    const hit = raycaster.intersectObjects(children)[0] || false;
    if (!hit) {
      return false;
    }
    const { point, uv } = hit;
    return point
      .addScaledVector(
        blockFacings[Math.floor(uv.y)],
        (neighbor ? 1 : -1) * 0.25
      )
      .divideScalar(0.5)
      .floor();
  };

  const onButtons = ({ detail: { buttons, raycaster } }) => {
    const {
      primaryDown: isPlacing,
      secondaryDown: isRemoving,
      tertiaryDown: isPicking,
    } = buttons;
    if (!isPlacing && !isRemoving && !isPicking) {
      return;
    }
    const block = getBlock(raycaster, !(isPicking || isRemoving));
    if (!block) {
      return;
    }
    if (isPicking) {
      worker.postMessage({
        type: 'pick',
        block: {
          x: block.x,
          y: block.y,
          z: block.z,
        },
      });
      return;
    }
    worker.postMessage({
      type: 'update',
      update: {
        x: block.x,
        y: block.y,
        z: block.z,
        type: isRemoving ? 0 : selected + 1,
      },
    });
  };

  const onPick = (type) => {
    selected = type - 1;
  };
</script>

<DesktopControls
  bind:this={controls}
  bind:isLocked={isLocked}
  on:buttons={onButtons}
/>
<Renderer
  bind:scene={scene}
  controls={controls}
  initialPosition={initialPosition}
/>

{#if !isLocked}
  <actions on:click={(e) => e.preventDefault()}>
    <label>
      Sunlight:
      <input
        type="range"
        bind:value={sunlight}
        min={0}
        max={1}
        step={0.01}
      />
    </label>
  </actions>
  <Help />
{:else}
  <crosshair>
    <div></div>
    <div></div>
  </crosshair>
{/if}

<style>
  crosshair {
    opacity: 0.3;
  }

  crosshair > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
  }

  crosshair > div:nth-child(1) {
    width: 8px;
    height: 2px;
  }

  crosshair > div:nth-child(2) {
    width: 2px;
    height: 8px;
  }

  actions {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 4px 0 0 0;
  }

  actions > label {
    display: flex;
    align-items: center;
  }
</style>
