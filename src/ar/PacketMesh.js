/**
 * ARNetLab — PacketMesh
 *
 * Lightweight 3D visual object representing a virtual network packet in Three.js.
 *
 * Responsibilities:
 * - Create a distinct, compact glowing 3D packet mesh (faceted icosahedron with halo ring)
 * - Move smoothly along 3D coordinates without memory allocations per frame
 * - Provide subtle pulsation effect
 * - Cleanly dispose geometry and material on removal
 */

import * as THREE from 'three';

const PACKET_COLOR = 0xf59e0b; // luminous amber
const PACKET_EMISSIVE = 0xfbbf24; // bright gold glow
const PACKET_RADIUS = 0.012; // 1.2cm in world space

export class PacketMesh {
  constructor() {
    /** @type {THREE.Group|null} */
    this.group = null;

    /** @type {THREE.Mesh|null} */
    this._coreMesh = null;

    /** @type {THREE.Mesh|null} */
    this._glowRing = null;

    /** @type {boolean} */
    this._visible = false;
  }

  /**
   * Create and add the packet 3D object to the scene.
   * @param {THREE.Scene} scene
   * @param {{x: number, y: number, z: number}} initialPos
   * @returns {THREE.Group}
   */
  init(scene, initialPos = { x: 0, y: 0, z: 0 }) {
    this.dispose(scene);

    this.group = new THREE.Group();
    this.group.name = '_virtualPacket';

    // 1. Core glowing faceted sphere
    const geom = new THREE.IcosahedronGeometry(PACKET_RADIUS, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: PACKET_COLOR,
      emissive: PACKET_EMISSIVE,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.1,
    });
    this._coreMesh = new THREE.Mesh(geom, mat);
    this.group.add(this._coreMesh);

    // 2. Subtle outer beacon ring
    const ringGeo = new THREE.RingGeometry(PACKET_RADIUS * 1.2, PACKET_RADIUS * 1.5, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this._glowRing = new THREE.Mesh(ringGeo, ringMat);
    this._glowRing.rotation.x = Math.PI / 2;
    this.group.add(this._glowRing);

    // Initial position (raised slightly to match connection line height)
    this.setPosition(initialPos.x, initialPos.y, initialPos.z);
    this.setVisible(true);

    if (scene) {
      scene.add(this.group);
    }

    return this.group;
  }

  /**
   * Update packet position in 3D world space.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setPosition(x, y, z) {
    if (!this.group) return;
    // Y elevation offset to align with connection cylinder center (0.015m)
    this.group.position.set(x, y + 0.015, z);
  }

  /**
   * Subtle rotation and pulsation animation (no object allocation).
   * @param {number} time — timestamp or elapsed time
   */
  animate(time) {
    if (!this.group || !this._visible) return;

    // Slow rotation
    if (this._coreMesh) {
      this._coreMesh.rotation.y += 0.04;
      this._coreMesh.rotation.x += 0.02;
    }

    // Subtle breathing pulse on halo ring
    if (this._glowRing) {
      const scale = 1.0 + Math.sin(time * 6) * 0.15;
      this._glowRing.scale.set(scale, scale, 1);
    }
  }

  /**
   * Set packet visibility.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visible = visible;
    if (this.group) {
      this.group.visible = visible;
    }
  }

  /**
   * Check if packet is currently visible in scene.
   * @returns {boolean}
   */
  isVisible() {
    return this._visible;
  }

  /**
   * Cleanly dispose geometries and materials.
   * @param {THREE.Scene} [scene]
   */
  dispose(scene) {
    if (this.group) {
      if (scene) {
        scene.remove(this.group);
      } else if (this.group.parent) {
        this.group.parent.remove(this.group);
      }
      this.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.group = null;
    }
    this._coreMesh = null;
    this._glowRing = null;
    this._visible = false;
  }
}
