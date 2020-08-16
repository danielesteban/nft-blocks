<script>
  export let id;

  $: formattedId = `#${(`000000${id}`).slice(-6)}`;
  $: image = `${__API__}token/${id}/image`;
</script>

<token>
  <img alt={formattedId} src={image} />
  <id>{formattedId}</id>
</token>

<style>
  token {
    display: block;
    margin: 1rem;
    background: #000;
    border: 4px solid #222;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  img {
    display: block;
    width: 256px;
    height: 256px;
  }

  id {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    border-top: 4px solid #222;
  }
</style>
