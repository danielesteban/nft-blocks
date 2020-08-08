<script>
  import Texture from '../components/texture.svelte';

  export let editor;
  export let selected = 0;
  export let textures;
  export let types;
</script>

{#each $types as type, i}
  <blockType
    class:selected={selected === i}
    on:click={() => {
      selected = i;
      if ($editor !== selected) {
        editor.close();
      }
    }}
  >
    <texture>
      <Texture pixels={$textures[i].top} />
    </texture>
    <info>
      <name>{type.name}</name>
      <modifiers>
        {type.isTransparent ? 'transparent' : ''}
        {type.isTransparent && type.isLight ? ' | ' : ''}
        {type.isLight ? 'emits light' : ''}
        &nbsp;
      </modifiers>
      <actions>
        <button
          on:click={() => {
            if ($editor !== i) {
              editor.open(i);
            }
          }}
        >
          Edit
        </button>
      </actions>
    </info>
  </blockType>
{/each}

<style>
  blockType {
    display: flex;
    padding: 1rem;
    background: #222;
    border-bottom: 1px solid #111;
  }

  blockType.selected {
    background: #363;
  }

  texture {
    display: block;
    width: 64px;
    height: 64px;
    background: #000;
    border: 4px solid #222;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    margin-right: 1rem;
  }

  info {
    display: block;
  }

  name {
    display: block;
  }

  modifiers {
    display: block;
    color: #999;
  }

  actions {
    display: block;
    padding: 0.25rem 0;
  }
  
  actions > button {
    padding: 0.125rem 0.75rem;
  }
</style>