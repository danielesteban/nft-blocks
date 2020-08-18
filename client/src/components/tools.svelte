<script>
  import { mint, status } from '../stores/tokens';
  import router from '../stores/router';

  export let blocks;

  let isMinting = false;
  const onMint = () => {
    isMinting = true;
    blocks.gltf()
      .then((blob) => (
        mint(blob)
      ))
      .then((id) => (
        blocks
          .save(`Blocks #${(`000000${id}`).slice(-Math.max(`${id}`.length, 6))}`)
          .then(() => router.push(`/token/${id}`))
      ))
      .catch(() => {
        isMinting = false;
      });
  };

  const networkId = __NetworkId__;
  const networkNames = {
    1: 'Main Ethereum Network',
    3: 'Ropsten Test Network',
    4: 'Rinkeby Test Network',
    5: 'Goerli Test Network',
    42: 'Kovan Test Network',
  };
</script>

<minting>
  <cta>
    <button
      class:primary={!isMinting}
      disabled={$status !== 'ready' || isMinting}
      on:click={onMint}
    >
      {#if isMinting}
        Submitting...
      {:else}
        Mint NFT token & Submit to gallery
      {/if}
    </button>
  </cta>
  {#if $status !== 'loading' && $status !== 'ready'}
    <feedback>
      {#if $status === 'unsupported'}
        Web3 is not supported.
        Please open in an Ethereum enabled browser
        (or install <a href="https://metamask.io/download.html" rel="noopener noreferrer" target="_blank">MetaMask</a>).
      {:else if $status === 'wrongnetwork'}
        Please switch to: "{networkNames[networkId] || `Network ${networkId}`}"
      {:else if $status === 'error'}
        Error loading contract
      {/if}
    </feedback>
  {/if}
</minting>
<tools>
  <button on:click={() => blocks.load()}>
    Import
  </button>
  <button on:click={() => blocks.save()}>
    Export
  </button>
  <button on:click={() => blocks.gltf(true)}>
    Download GLTF
  </button>
</tools>

<style>
  minting, tools {
    background: #222;
    padding: 1rem 0.5rem;
  }

  cta, tools {
    display: flex;
  }

  tools {
    border-top: 2px solid #111;
  }

  button {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0 0.5rem;
  }

  feedback {
    display: block;
    width: 100%;
    padding-top: 0.75rem;
    text-align: center;
  }

  feedback > a {
    text-decoration: underline;
  }
</style>
