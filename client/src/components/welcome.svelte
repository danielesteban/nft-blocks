<script>
  import Link from './link.svelte';
  import visible from '../stores/welcome';
</script>

<overlay class:visible={$visible} on:click={() => { $visible = false; }}>
  <welcome>
    <h3>
      Welcome, my dudes!
      <close>
        &times;
      </close>
    </h3>
    <p>
      This is a beta test of the cryptoart tool and gallery I'm creating.
    </p>
    <p>
      It features a <Link path="/creator"><l>voxel editor</l></Link> to create small dioramas/destinations
      which then you can mint into immutable NFT tokens and make money by trading them.
    </p>
    <p>
      When minting the NFT token, a cryptographic hash that uniquely indentifies the content gets stored within it.
      Meaning, you will have a verifiable and dated record of ownership for your creation.
    </p>
    <p>
      The gallery viewer has also AR (Android, iOS, etc...) and VR (Oculus Quest, Valve index, etc...) support to showcase your creations and
      they will also appear on NFT marketplaces like <a on:click={(e) => e.stopPropagation()} href="https://rinkeby.opensea.io/assets/nft-blocks-v2" rel="noopener noreferrer" target="_blank"><l>OpenSea</l></a>.
    </p>
    <p>
      As this is still a beta, the NFT tokens are being created in the "Rinkeby Test Network".
      This allows you to mint your creations <a on:click={(e) => e.stopPropagation()} href="https://faucet.rinkeby.io/" rel="noopener noreferrer" target="_blank"><l>for free</l></a> while you get a hold of the tools and the main concepts.
      But remember to export your creations so you can mint them back on the "Main Ethereum Network" once the beta test finishes.
    </p>
    <p>
      You can drop me a <a on:click={(e) => e.stopPropagation()} href="https://twitter.com/DaniGatunes" rel="noopener noreferrer" target="_blank">tweet</a> if you have any suggestions or if you find any bugs.
    </p>
    <p class="signature">
      Much love,<br />
      Dani.
    </p>
  </welcome>
</overlay>

<style>
  overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
  }

  overlay.visible {
    display: block;
  }

  welcome {
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    max-width: 600px;
    transform: translate(-50%, -50%);
    background: #333;
    display: flex;
    flex-direction: column;
    border: 2px solid #111;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  h3 {
    display: flex;
    align-items: center;
    margin: 0 0 1rem;
    background: #222;
    padding: 0.75rem 1rem;
  }

  close {
    margin-left: auto;
  }

  p {
    margin: 0 1rem 0.5rem;
  }

  p l {
    text-decoration: underline;
  }

  p.signature {
    margin: 1rem;
    text-align: right;
  }
</style>
