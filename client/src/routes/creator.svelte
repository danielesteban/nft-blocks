<script>
  import { writable } from 'svelte/store';
  import Blocks from '../components/blocks.svelte';
  import BlockTypes from '../components/blockTypes.svelte';
  import Editor from '../components/editor.svelte';
  import Tools from '../components/tools.svelte';
  import Trading from '../components/trading.svelte';
  import BlockTypesStore from '../stores/blockTypes';
  import ColorsStore from '../stores/colors';
  import EditorStore from '../stores/editor';

  const { atlas, types, textures } = BlockTypesStore();
  const colors = ColorsStore();
  const editor = EditorStore();

  let blocks;
  let selected = 0;
</script>

<editor>
  <ui class="aside">
   <heading>
      Block Types
      <button
        on:click={() => {
          types.create();
          selected = $types.length - 1;
          editor.open(selected);
        }}
      >
        &plus;
      </button>
    </heading>
    <scroll>
      <BlockTypes
        bind:selected={selected}
        editor={editor}
        textures={textures}
        types={types}
      />
    </scroll>
    <heading>
      Tools
    </heading>
    <Tools blocks={blocks} />
    <heading>
      Trading
    </heading>
    <Trading />
  </ui>
  <viewport>
    <renderer>
      <Blocks
        bind:this={blocks}
        bind:selected={selected}
        atlas={atlas}
        types={types}
      />
    </renderer>
    {#if $editor !== undefined}
      <ui>
        <Editor
          editor={editor}
          colors={colors}
          textures={textures}
          types={types}
        />
      </ui>
    {/if}
  </viewport>
</editor>

<style>
  editor {
    height: 100%;
    display: flex;
  }

  ui {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-right: 2px solid #000;
  }

  ui.aside {
    width: 320px;
  }

  scroll {
    flex-grow: 1;
    overflow-y: scroll;
  }

  heading {
    display: flex;
    align-items: center;
    background: #333;
    padding: 0.5rem 1rem;
    border-top: 2px solid #111;
    border-bottom: 2px solid #111;
  }

  heading > button {
    margin-left: auto;
    padding: 0.125rem 0.75rem;
  }

  viewport {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  renderer {
    position: relative;
    flex-grow: 1;
    overflow: hidden;
  }
</style>