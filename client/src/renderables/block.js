import {
  BoxBufferGeometry,
  BufferGeometry,
  DataTexture,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  RepeatWrapping,
  sRGBEncoding,
  UnsignedByteType,
  UVMapping,
} from 'three';

// Block Model

class Block extends Mesh {
  static setupModels() {
    const cross = new BufferGeometry();
    const merged = new Geometry();
    const plane = new PlaneGeometry();
    for (let i = 0; i < 4; i += 1) {
      plane.rotateY(Math.PI * 0.5);
      const clone = plane.clone();
      merged.merge(clone);
    }
    cross.fromGeometry(merged);
    cross.groups[0].materialIndex = 2;
    Block.models = {
      box: new BoxBufferGeometry(),
      cross,
    };
  }

  static setupMaterial() {
    Block.material = [...Array(6)].map(() => new MeshBasicMaterial());
  }

  constructor() {
    if (!Block.models) {
      Block.setupModels();
    }
    if (!Block.material) {
      Block.setupMaterial();
    }
    super(
      Block.models.box,
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
    this.textures = [pixels.bottom, pixels.top, pixels.side].map((pixels) => {
      const texture = new DataTexture(
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
      );
      texture.flipY = true;
      return texture;
    });
    const [bottom, top, side] = this.textures;
    material[0].map = side;
    material[1].map = side;
    material[2].map = top;
    material[3].map = bottom;
    material[4].map = side;
    material[5].map = side;
  }

  updateType({ model, isTransparent }) {
    const { material } = this;
    this.geometry = Block.models[model];
    material.forEach((material) => {
      material.transparent = isTransparent;
    });
  }
}

export default Block;
