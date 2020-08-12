<script>
  import Creator from './routes/creator.svelte';
  import Token from './routes/token.svelte';

  // This should prolly be a service that just exports a store.
  // Maybe use the history module and a path-to-regex schema.
  // But this quick&dirty hash router should work for now.
  const route = {};
  const onLocationChange = () => {
    const [id, ...params] = document.location.hash.substr(2).split('/').map((value) => (
      decodeURIComponent(value.trim())
    ));
    switch (id) {
      case 'creator':
        route.component = Creator;
        break;
      case 'token':
        route.component = Token;
        break;
      default:
        location.replace('#/creator');
        return;
    }
    route.params = params.length ? params : undefined;
  };
  window.addEventListener('hashchange', onLocationChange);
  onLocationChange();

  const onContextMenu = (e) => e.preventDefault();
</script>

<svelte:window on:contextmenu={onContextMenu} />

<app>
  <route>
    <svelte:component
      this={route.component}
      {...(route.params ? { params: route.params } : {})}
    />
  </route>
  <toolbar>
    <div>
      <brand>
        <a href="#/">
          nft-blocks
        </a>
      </brand>
    </div>
    <div>
      <github>
        <a href="https://github.com/danielesteban/nft-blocks" target="_blank">
          view source
        </a>
      </github>
      <credits>
        <a href="https://dani.gatunes.com/" target="_blank">
          dani@gatunes
        </a> © 2020
      </credits>
    </div>
  </toolbar>
</app>

<style>
  app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  route {
    flex-grow: 1;
    display: block;
    overflow: overlay;
  }

  toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 1rem;
    box-sizing: border-box;
    background: #222;
    border-top: 2px solid #000;
  }

  toolbar > div {
    display: flex;
    align-items: center;
  }

  brand {
    letter-spacing: 0.2rem;
  }

  credits {
    border-left: 1px solid #999;
    color: #ccc;
    margin-left: 1em;
    padding-left: 1em;
  }
</style>
