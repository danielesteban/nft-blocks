<script>
  import Link from './components/link.svelte';
  import Creator from './routes/creator.svelte';
  import Gallery from './routes/gallery.svelte';
  import Token from './routes/token.svelte';
  import router from './stores/router';

  router.init();

  let component;
  $: switch ($router.id) {
    case '':
      component = Gallery;
      break;
    case 'creator':
      component = Creator;
      break;
    case 'token':
      component = Token;
      break;
    default:
      router.replace('/');
      break;
  }

  const onContextMenu = (e) => e.preventDefault();
</script>

<svelte:window on:contextmenu={onContextMenu} />

<app>
  <route>
    <svelte:component
      this={component}
      {...($router.params ? { params: $router.params } : {})}
    />
  </route>
  <toolbar>
    <div>
      <brand>
        <Link path="/">
          nft-blocks
        </Link>
      </brand>
    </div>
    <div>
      <creator>
        <Link path="/creator">
          Create your own
        </Link>
      </creator>
      <github>
        <a href="https://github.com/danielesteban/nft-blocks" rel="noopener noreferrer" target="_blank">
          view source
        </a>
      </github>
      <credits>
        <a href="https://dani.gatunes.com/" rel="noopener noreferrer" target="_blank">
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

  credits, github {
    border-left: 1px solid #888;
    color: #ccc;
    margin-left: 1em;
    padding-left: 1em;
  }
</style>
