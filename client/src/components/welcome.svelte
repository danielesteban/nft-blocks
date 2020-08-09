<script>
  let visible = true;
</script>

<overlay class:visible={visible} on:click={() => { visible = false; }}>
  <welcome>
    <h3>Welcome, my dudes!</h3>
    <p>
      This is an alpha test of the voxel editor for the cryptoart tool I'm creating.
    </p>
    <p>
      As many of you know, what you create with this editor will be mintable into an inmutable NFT Token and you'll be able to trade it and make some money from it.
    </p>
    <p>
      The trading functionality and the gallery in where the creations will be displayed it's not ready yet. I'm still working on both of those things. 
    </p>
    <p>
      There's also no AR/VR support yet since that would be only available on the immutable gallery viewer. No VR editing mode is planned.
    </p>
    <p>
      One last thing... You'll need at least a window size of 1920x1080 since the Block Type Editor UI still have major issues when it comes to small viewports.
    </p>
    <p>
      Tell me what you think or if you find any bugs at <a on:click={(e) => e.stopPropagation()} href="https://twitter.com/DaniGatunes" rel="noopener noreferrer" target="_blank">twitter</a>.
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
    position: absolute;
    top: 50%;
    left: 50%;
    width: 600px;
    transform: translate(-50%, -60%);
    background: #333;
    display: flex;
    flex-direction: column;
    border: 2px solid #111;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  h3 {
    margin: 0 0 1rem;
    padding: 1rem;
    background: #222;
  }

  p {
    margin: 0 1rem 0.5rem;
  }

  p > a {
    text-decoration: underline;
  }

  p.signature {
    margin: 1rem;
    text-align: right;
  }
</style>
