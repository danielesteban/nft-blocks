<script>
  export let blocks;
</script>

<tools>
  <button on:click={blocks.load}>
    Import
  </button>
  <button on:click={blocks.save}>
    Export
  </button>
  <button on:click={() => blocks.gltf(true)}>
    Download GLTF
  </button>
</tools>

<style>
  tools {
    background: #222;
    display: flex;
    padding: 1rem 0.5rem;
  }

  tools > button {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0 0.5rem;
  }
</style>
