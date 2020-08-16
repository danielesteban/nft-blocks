<script>
  import { account, mint, status } from '../stores/tokens';
  import router from '../stores/router';

  export let blocks;

  let isMinting = false;
  const onMint = () => {
    isMinting = true;
    blocks.gltf()
      .then((blob) => (
        mint(blob)
      ))
      .then((tokenId) => (
        router.push(`/token/${tokenId}`)
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

<trading>
  {#if $status === 'ready'}
    {#if $account}
      <button
        class:primary={!isMinting}
        disabled={isMinting}
        on:click={onMint}
      >
        {#if isMinting}
          Minting...
        {:else}
          Mint NFT token
        {/if}
      </button>
    {:else}
      <button
        class="primary"
        on:click={() => account.request()}
      >
        Connect to wallet
      </button>
    {/if}
  {:else}
    <feedback>
      {#if $status === 'unsupported'}
        Web3 is not supported.
        Please open in an Ethereum enabled browser
        (or install <a href="https://metamask.io/download.html" rel="noopener noreferrer" target="_blank">MetaMask</a>).
      {:else if $status === 'wrongnetwork'}
        Please switch to: "{networkNames[networkId] || `Network ${networkId}`}"
      {:else if $status === 'error'}
        Error loading contract
      {:else if $status === 'loading'}
        Loading contract...
      {/if}
    </feedback>
  {/if}
</trading>

<style>
  trading {
    background: #222;
    display: flex;
    padding: 1rem 0.5rem;
  }

  trading > button {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0 0.5rem;
  }

  feedback {
    display: block;
    width: 100%;
    padding: 0.25rem 0;
    text-align: center;
  }

  feedback > a {
    text-decoration: underline;
  }
</style>
