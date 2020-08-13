<script>
  import { onDestroy } from 'svelte';
  import { Matrix4, Quaternion, Vector3 } from 'three';
  import Hand from '../../renderables/hand';

  const auxVector = new Vector3();
  const auxMatrixA = new Matrix4();
  const auxMatrixB = new Matrix4();
  const head = { position: new Vector3(), rotation: new Quaternion() };
  let controllers;

  onDestroy(() => {
    controllers.forEach((controller) => {
      delete controller._listeners.connected;
      delete controller._listeners.disconnected;
      controller.parent.remove(controller);
    });
  });

  export const onAnimationTick = ({ animation: { delta }, camera, player }) => {
    camera.matrixWorld.decompose(head.position, head.rotation, auxVector);
    controllers.forEach(({
      buttons,
      hand,
      gamepad,
      matrixWorld,
      worldspace,
    }) => {
      if (!hand) {
        return;
      }
      [
        ['forwards', gamepad.axes[3] <= -0.5],
        ['backwards', gamepad.axes[3] >= 0.5],
        ['leftwards', gamepad.axes[2] <= -0.5],
        ['rightwards', gamepad.axes[2] >= 0.5],
        ['trigger', gamepad.buttons[0] && gamepad.buttons[0].pressed],
        ['grip', gamepad.buttons[1] && gamepad.buttons[1].pressed],
        ['primary', gamepad.buttons[4] && gamepad.buttons[4].pressed],
        ['secondary', gamepad.buttons[5] && gamepad.buttons[5].pressed],
      ].forEach(([key, value]) => {
        buttons[`${key}Down`] = value && buttons[key] !== value;
        buttons[`${key}Up`] = !value && buttons[key] !== value;
        buttons[key] = value;
      });
      hand.setFingers({
        thumb: gamepad.buttons[3] && gamepad.buttons[3].touched,
        index: gamepad.buttons[0] && gamepad.buttons[0].pressed,
        middle: gamepad.buttons[1] && gamepad.buttons[1].pressed,
      });
      hand.animate({ delta });
      matrixWorld.decompose(worldspace.position, worldspace.quaternion, auxVector);
      if (
        hand.handedness === 'left'
        && (buttons.leftwardsDown || buttons.rightwardsDown)
      ) {
        const rotation = Math.PI * 0.25 * (buttons.leftwardsDown ? 1 : -1);
        auxMatrixA.makeTranslation(
          head.position.x, player.position.y, head.position.z
        );
        auxMatrixA.multiply(
          auxMatrixB.makeRotationY(rotation)
        );
        auxMatrixA.multiply(
          auxMatrixB.makeTranslation(
            -head.position.x, -player.position.y, -head.position.z
          )
        );
        player.applyMatrix4(auxMatrixA);
      }
      if (
        hand.handedness === 'right'
        && (buttons.backwards || buttons.forwards || buttons.leftwards || buttons.rightwards)
      ) {
        const movement = { x: 0, y: 0, z: 0 };
        if (buttons.backwards) {
          movement.z = 1;
        }
        if (buttons.forwards) {
          movement.z = -1;
        }
        if (buttons.leftwards) {
          movement.x = -1;
        }
        if (buttons.rightwards) {
          movement.x = 1;
        }
        player.position.addScaledVector(
          auxVector
            .copy(movement)
            .normalize()
            .applyQuaternion(worldspace.quaternion),
          delta * 4
        );
      }
    });
  }

  export const setup = ({ player, renderer: { xr } }) => {
    player.camera.position.set(0, 1.6, 0);
    player.camera.rotation.set(0, 0, 0);
    controllers = [...Array(2)].map((v, i) => {
      const controller = xr.getController(i);
      controller.buttons = {
        forwards: false,
        backwards: false,
        leftwards: false,
        rightwards: false,
        trigger: false,
        grip: false,
        primary: false,
        secondary: false,
      };
      controller.worldspace = {
        position: new Vector3(),
        quaternion: new Quaternion(),
      };
      controller.addEventListener('connected', ({ data: { handedness, gamepad } }) => {
        if (controller.hand) {
          return;
        }
        const hand = new Hand({ handedness });
        controller.hand = hand;
        controller.gamepad = gamepad;
        controller.add(hand);
      });
      controller.addEventListener('disconnected', () => {
        if (!controller.hand) {
          return;
        }
        controller.remove(controller.hand);
        delete controller.hand;
        delete controller.gamepad;
      });
      player.add(controller);
      return controller;
    });
  };
</script>
