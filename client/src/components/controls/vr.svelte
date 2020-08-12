<script>
  import { onDestroy } from 'svelte';

  onDestroy(() => {
  
  });

  export const onAnimationTick = ({ player }) => {

  }

  export const setup = (player) => {
    player.camera.position.set(0, 1.6, 0);
    player.camera.rotation.set(0, 0, 0);
  };
</script>
