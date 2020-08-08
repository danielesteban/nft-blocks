<script>
  import { Vector2 } from 'three';

  let isActive = false;
  const pointer = new Vector2(0, 0);

  export const onAnimationTick = ({ player }) => {
    if (!isActive) {
      return;
    }
    if (pointer.x !== 0 || pointer.y !== 0) {
      player.rotation.y -= pointer.x * 0.006;
      player.rotation.x -= pointer.y * 0.006;
      pointer.set(0, 0);
    }
  }

  export const request = () => {
    isActive = true;
  };

  export const setup = ({ camera, player }) => {
    camera.position.z = 2.5;
    player.rotation.y = Math.PI * 0.25;
    player.rotation.x = Math.PI * -0.25;
    player.rotation.order = 'YXZ';
  };

  const onMouseMove = ({ movementX, movementY }) => {
    if (!isActive) {
      return;
    }
    pointer.set(movementX, movementY);
  };

  const onMouseUp = () => {
    isActive = false;
  };
</script>

<svelte:window
  on:blur={onMouseUp}
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
/>
