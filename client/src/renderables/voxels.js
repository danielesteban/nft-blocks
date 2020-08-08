import {
  BufferGeometry,
  DataTexture,
  Mesh,
  BufferAttribute,
  MeshBasicMaterial,
  NearestFilter,
  Object3D,
  RGBFormat,
  RGBAFormat,
  RepeatWrapping,
  sRGBEncoding,
  UnsignedByteType,
  UVMapping,
} from 'three';

// Voxels chunk

class Voxels extends Object3D {
  static setupMaterials() {
    Voxels.materials = {
      opaque: new MeshBasicMaterial({
        vertexColors: true,
      }),
      transparent: new MeshBasicMaterial({
        transparent: true,
        vertexColors: true,
      }),
    };
  }

  static updateAtlas(atlas) {
    if (!Voxels.materials) {
      Voxels.setupMaterials();
    }
    const { materials } = Voxels;
    ['opaque', 'transparent'].forEach((key) => {
      if (materials[key].map) {
        materials[key].map.dispose();
        materials[key].map = null;
      }
      const { pixels, width, height } = atlas[key];
      if (!pixels.length) {
        return;
      }
      const texture = new DataTexture(
        pixels,
        width,
        height,
        key === 'transparent' ? RGBAFormat : RGBFormat,
        UnsignedByteType,
        UVMapping,
        RepeatWrapping,
        RepeatWrapping,
        NearestFilter,
        NearestFilter,
        1,
        sRGBEncoding
      );
      texture.needsUpdate = true;
      materials[key].map = texture;
    });
  }

  constructor(subchunk) {
    if (!Voxels.materials) {
      Voxels.setupMaterials();
    }
    super();
    this.matrixAutoUpdate = false;
    this.meshes = {
      opaque: new Mesh(new BufferGeometry(), Voxels.materials.opaque),
      transparent: new Mesh(new BufferGeometry(), Voxels.materials.transparent),
    };
    ['opaque', 'transparent'].forEach((key) => {
      this.meshes[key].matrixAutoUpdate = false;
      this.add(this.meshes[key]);
    });
    this.subchunk = subchunk;
    this.position
      .set(subchunk.x, 0, subchunk.z)
      .multiplyScalar(8);
    this.scale.setScalar(0.5);
    this.updateMatrix();
  }

  dispose() {
    const { geometry } = this;
    geometry.dispose();
  }

  update(geometries) {
    const { meshes } = this;
    ['opaque', 'transparent'].forEach((key) => {
      const {
        color,
        position,
        uv,
        index,
      } = geometries[key];
      const mesh = meshes[key];

      if (!position.length) {
        mesh.visible = false;
        return;
      }

      const { geometry } = mesh;
      geometry.setAttribute('color', new BufferAttribute(color, 3));
      geometry.setAttribute('position', new BufferAttribute(position, 3));
      geometry.setAttribute('uv', new BufferAttribute(uv, 2));
      geometry.setIndex(new BufferAttribute(index, 1));
      geometry.computeBoundingSphere();
      mesh.visible = true;
    });
  }
}

export default Voxels;
