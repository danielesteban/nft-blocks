import {
  BoxBufferGeometry,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  RepeatWrapping,
  sRGBEncoding,
  UnsignedByteType,
  UVMapping,
} from 'three';

// Block Model

class Block extends Mesh {
  static setupGeoemtry() {
    Block.geometry = new BoxBufferGeometry();
  }

  static setupMaterial() {
    Block.material = [...Array(6)].map(() => new MeshBasicMaterial());
  }

  constructor() {
    if (!Block.geometry) {
      Block.setupGeoemtry();
    }
    if (!Block.material) {
      Block.setupMaterial();
    }
    super(
      Block.geometry,
      Block.material
    );
    this.matrixAutoUpdate = false;
  }

  updateTextures(pixels) {
    const { material, textures } = this;
    if (textures) {
      textures.forEach((texture) => (
        texture.dispose()
      ));
    }
    this.textures = [pixels.bottom, pixels.top, pixels.side].map((pixels) => (
      new DataTexture(
        pixels,
        16,
        16,
        RGBAFormat,
        UnsignedByteType,
        UVMapping,
        RepeatWrapping,
        RepeatWrapping,
        NearestFilter,
        NearestFilter,
        1,
        sRGBEncoding
      )
    ));
    const [bottom, top, side] = this.textures;
    material[0].map = side;
    material[1].map = side;
    material[2].map = top;
    material[3].map = bottom;
    material[4].map = side;
    material[5].map = side;
  }

  updateType(isTransparent) {
    const { material } = this;
    material.forEach((material) => {
      material.transparent = isTransparent;
    });
  }
}

export default Block;
