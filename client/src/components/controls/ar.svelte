<script>
  import { onDestroy } from 'svelte';
  import { Matrix4, Quaternion, Vector3 } from 'three';
  import Hand from '../../renderables/hand';

  const auxVector = new Vector3();
  const auxMatrixA = new Matrix4();
  const auxMatrixB = new Matrix4();
  let controller;

  onDestroy(() => {
    delete controller._listeners.selectstart;
    delete controller._listeners.selectend;
    controller.parent.remove(controller);
  });

  export const onAnimationTick = ({
    animation: { delta },
    camera,
    player,
    xr,  
  }) => {
    const {
      selecting,
      matrixWorld,
      worldspace,
    } = controller;
    if (!selecting) {
      return;
    }
    matrixWorld.decompose(worldspace.position, worldspace.quaternion, auxVector);
    player.position.addScaledVector(
      auxVector
        .set(0, 0, -1)
        .applyQuaternion(worldspace.quaternion),
      delta * 0.1
    );
  }

  export const setup = ({ player, renderer: { xr } }) => {
    player.camera.position.set(0, 0, 0);
    player.camera.rotation.set(0, 0, 0);
    controller = xr.getController(0);
    controller.selecting = false;
    controller.worldspace = {
      position: new Vector3(),
      quaternion: new Quaternion(),
    };
    controller.addEventListener('selectstart', () => {
      controller.selecting = true;
    });
    controller.addEventListener('selectend', () => {
      controller.selecting = false;
    });
    player.add(controller);
  };
</script>
