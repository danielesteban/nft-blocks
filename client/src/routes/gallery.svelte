<script>
  import { list } from '../stores/tokens';
  import Link from '../components/link.svelte';
  import Token from '../components/token.svelte';
  import Welcome from '../components/welcome.svelte';

  $: !$list && list.fetch();
</script>

<gallery>
  {#if $list}
    <tokens>
      {#each $list as tokenId}
        <Link path="/token/{tokenId}">
          <Token id={tokenId} />
        </Link>
      {/each}
    </tokens>
  {:else}
    <feedback>
      Loading tokens...
    </feedback>
  {/if}
  <create>
    <Link path="/creator">
      <button>
        &plus;
      </button>
    </Link>
  </create>
</gallery>

<Welcome />

<style>
  gallery {
    display: block;
    height: 100%;
    position: relative;
  }

  tokens {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 2rem 3rem;
    display: flex;
    align-content: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    overflow-y: overlay;
  }

  create {
    position: absolute;
    right: 2rem;
    bottom: 2rem;
  }

  create button {
    border-radius: 32px;
    width: 64px;
    height: 64px;
    padding: 0;
    font-size: 2rem;
    background: #393;
  }

  feedback {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>
