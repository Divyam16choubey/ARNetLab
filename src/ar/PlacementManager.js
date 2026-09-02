/**
 * ARNetLab — PlacementManager
 *
 * Manages the AR workspace anchor — a simple visual platform placed
 * on a detected surface when the user taps.
 *
 * Phase 2: The placed object is a neutral workspace indicator
 * (subtle grid/platform). Actual network device models belong
 * to Phase 3.
 *
 * Responsibilities:
 * - Place a workspace anchor at the reticle's current pose
 * - Remove the anchor (reset)
 * - Dispose on cleanup
 */

import * as THREE from 'three';

export class PlacementManager {
  constructor() {
    /** @type {THREE.Group|null} */
    this.anchor = null;
    /** @type {boolean} */
    this.isPlaced = false;
  }

  /**
   * Place the AR workspace anchor at the given pose matrix.
   * @param {THREE.Scene} scene
   * @param {THREE.Matrix4} poseMatrix — the hit-test pose
   */
  place(scene, poseMatrix) {
    // Remove existing anchor if any
    this.reset(scene);

    this.anchor = new THREE.Group();
    this.anchor.matrixAutoUpdate = false;
    this.anchor.matrix.copy(poseMatrix);

    // Create a subtle circular platform
    const platformGeo = new THREE.CircleGeometry(0.15, 48);
    platformGeo.rotateX(-Math.PI / 2);
    const platformMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // primary indigo from design tokens
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    this.anchor.add(platform);

    // Create a thin ring border around the platform
    const ringGeo = new THREE.RingGeometry(0.14, 0.155, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6, // teal accent
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.anchor.add(ring);

    // Small center dot to mark the origin
    const dotGeo = new THREE.CircleGeometry(0.008, 16);
    dotGeo.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    // Slight Y offset to prevent z-fighting
    dot.position.y = 0.001;
    this.anchor.add(dot);

    scene.add(this.anchor);
    this.isPlaced = true;
  }

  /**
   * Remove the placed workspace anchor.
   * @param {THREE.Scene} scene
   */
  reset(scene) {
    if (this.anchor) {
      // Dispose all children
      this.anchor.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (scene) {
        scene.remove(this.anchor);
      } else if (this.anchor.parent) {
        this.anchor.parent.remove(this.anchor);
      }
      this.anchor = null;
    }
    this.isPlaced = false;
  }

  /**
   * Dispose all resources.
   * @param {THREE.Scene} [scene]
   */
  dispose(scene) {
    this.reset(scene);
    this.anchor = null;
    this.isPlaced = false;
  }
}
