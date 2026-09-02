/**
 * ARNetLab — ReticleManager
 *
 * Manages the placement reticle — a visual ring that follows detected
 * surfaces to indicate where the user can place the AR workspace.
 *
 * Responsibilities:
 * - Create a simple ring mesh (torus geometry)
 * - Show/hide based on hit-test validity
 * - Update position/rotation from hit-test pose each frame
 * - Dispose on cleanup
 */

import * as THREE from 'three';

export class ReticleManager {
  constructor() {
    /** @type {THREE.Mesh|null} */
    this.mesh = null;
    /** @type {boolean} */
    this.visible = false;
  }

  /**
   * Create the reticle mesh and add it to the scene.
   * @param {THREE.Scene} scene
   */
  init(scene) {
    // Outer ring
    const ringGeo = new THREE.RingGeometry(0.08, 0.1, 32);
    // Rotate to lie flat on horizontal surfaces (ring is created in XY plane)
    ringGeo.rotateX(-Math.PI / 2);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6, // teal accent from design tokens
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    this.mesh = new THREE.Mesh(ringGeo, ringMat);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.visible = false;

    scene.add(this.mesh);
  }

  /**
   * Update the reticle position from the hit-test matrix.
   * Called in the XR frame loop.
   *
   * @param {THREE.Matrix4} hitMatrix
   */
  updatePose(hitMatrix) {
    if (!this.mesh) return;

    this.mesh.matrix.copy(hitMatrix);
    this.mesh.visible = true;
    this.visible = true;
  }

  /**
   * Hide the reticle (no valid surface found).
   */
  hide() {
    if (!this.mesh) return;
    this.mesh.visible = false;
    this.visible = false;
  }

  /**
   * Show the reticle.
   */
  show() {
    // Visibility is controlled by updatePose/hide in the frame loop.
    // This method just re-enables the reticle after it was disabled (e.g., after placement).
    this.visible = true;
  }

  /**
   * Dispose resources.
   * @param {THREE.Scene} [scene]
   */
  dispose(scene) {
    if (this.mesh) {
      if (scene) scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    this.visible = false;
  }
}
