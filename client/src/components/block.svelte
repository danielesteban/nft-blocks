<script>
  import { onMount } from 'svelte';

  import ColorPicker from '../components/colorPicker.svelte';
  import ModelControls from '../components/modelControls.svelte';
  import Pixels from '../components/pixels.svelte';
  import Renderer from '../components/renderer.svelte';
  import Block from '../renderables/block';

  export let editor;
  export let colors;
  export let textures;
  export let types;

  $: type = $types[$editor];
  $: typeTextures = $textures[$editor];

  let texture = 'top';
  $: pixels = typeTextures[texture];

  const mesh = new Block();
  $: mesh.updateTextures(typeTextures);
  $: mesh.updateType(type.isTransparent);

  let controls;
  let scene;

  onMount(() => {
    scene.add(mesh);
  });

  let lastColor;
  const onTextureUpdate = ({ detail: pixels }) => {
    textures.update($editor, texture, pixels);
    if (
      $colors.current !== lastColor
      && !(
        $colors.palette.find(([r, g, b, a]) => (
          $colors.current[0] === r
          && $colors.current[1] === g
          && $colors.current[2] === b
          && $colors.current[3] === a
        ))
      ) 
    ) {
      lastColor = $colors.current;
      colors.addToPalette($colors.current);
    }
  };
</script>

<close>
  <button
    on:click={() => editor.close()}
  >
    &times;
  </button>
</close>
<wrapper>
  <block>
    <renderer>
      <ModelControls bind:this={controls} />
      <Renderer bind:scene={scene} controls={controls} />
    </renderer>
    <name>
      <input
        type="text"
        value={type.name}
        on:change={({ target: { value }}) => { types.update($editor, 'name', value); }}
      />
    </name>
    <modifiers>
      <label>
        <input
          type="checkbox"
          checked={type.isLight}
          on:change={({ target: { checked }}) => { types.update($editor, 'isLight', checked); }}
        />
        isLight
      </label>
      <label>
        <input
          type="checkbox"
          checked={type.isTransparent}
          on:change={({ target: { checked }}) => { types.update($editor, 'isTransparent', checked); }}
        />
        isTransparent
      </label>
    </modifiers>
  </block>
  <textures>
    <tabs>
      <tab
        class:selected={texture === 'top'}
        on:click={() => { texture = 'top'; }}
      >
        Top Texture  
      </tab>
      <tab
        class:selected={texture === 'side'}
        on:click={() => { texture = 'side'; }}
      >
        Side Texture  
      </tab>
      <tab
        class:selected={texture === 'bottom'}
        on:click={() => { texture = 'bottom'; }}
      >
        Bottom Texture  
      </tab>
    </tabs>
    <texture>
      <Pixels
        color={$colors.current}
        hasOpacity={type.isTransparent}
        pixels={pixels}
        on:update={onTextureUpdate}
        showGrid
      />
    </texture>
  </textures>
  <ColorPicker
    colors={colors}
    enableOpacity={type.isTransparent}
  />
</wrapper>

<style>
  close {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem;
    font-size: 2em;
  }

  wrapper {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    height: 438px;
    flex-shrink: 0;
    border-top: 2px solid #000;
  }

  block, textures {
    display: flex;
    flex-direction: column;
    width: 400px;
    height: 100%;
  }

  tabs {
    display: flex;
    align-items: center;
    background: #222;
    border-bottom: 2px solid #111;
  }

  tab {
    padding: 0.5rem 1rem;
    border-right: 1px solid #111;
    cursor: pointer;
  }

  tab.selected {
    background: #333;
    cursor: default;
  }

  texture {
    display: block;
    background: #000;
    border: 8px solid #222;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  }

  name {
    display: block;
  }

  name > input {
    width: 100%;
  }

  modifiers {
    display: flex;
    justify-content: center;
    padding: 0.25rem 0;
  }

  modifiers > label {
    display: block;
    margin: 0 0.5rem;
    cursor: pointer;
  }

  renderer {
    flex-grow: 1;
    overflow: hidden;
  }
</style>
