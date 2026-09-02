/**
 * ARNetLab — HitTestManager
 *
 * Manages WebXR hit testing to detect real-world surfaces.
 * Runs inside the XR frame loop — no React state updates.
 *
 * Responsibilities:
 * - Request XRHitTestSource from viewer reference space
 * - Each frame: extract hit-test results, find best horizontal surface pose
 * - Expose current hit pose for the reticle and placement
 * - Dispose on cleanup
 */

import * as THREE from 'three';

export class HitTestManager {
  constructor() {
    /** @type {XRHitTestSource|null} */
    this.hitTestSource = null;

    /** @type {boolean} */
    this.hasHitResult = false;

    /**
     * Reusable matrix to avoid allocations in the frame loop.
     * @type {THREE.Matrix4}
     */
    this._hitMatrix = new THREE.Matrix4();

    /**
     * The last valid hit pose matrix (column-major Float32Array).
     * @type {Float32Array|null}
     */
    this._lastPoseMatrix = null;
  }

  /**
   * Initialize hit testing.
   * @param {XRSession} session
   * @param {XRReferenceSpace} viewerRefSpace
   * @returns {Promise<void>}
   */
  async init(session, viewerRefSpace) {
    try {
      this.hitTestSource = await session.requestHitTestSource({
        space: viewerRefSpace,
      });
    } catch (err) {
      console.warn('Hit-test source could not be created:', err.message);
      this.hitTestSource = null;
    }
  }

  /**
   * Process hit-test results for the current frame.
   * Called inside the XR frame loop — must be fast, no allocations.
   *
   * @param {XRFrame} frame
   * @param {XRReferenceSpace} localRefSpace
   * @returns {boolean} — whether a valid hit was found
   */
  update(frame, localRefSpace) {
    if (!this.hitTestSource) {
      this.hasHitResult = false;
      this._lastPoseMatrix = null;
      return false;
    }

    const results = frame.getHitTestResults(this.hitTestSource);

    if (results.length > 0) {
      const hit = results[0];
      const pose = hit.getPose(localRefSpace);

      if (pose) {
        this._lastPoseMatrix = pose.transform.matrix;
        this._hitMatrix.fromArray(this._lastPoseMatrix);
        this.hasHitResult = true;
        return true;
      }
    }

    this.hasHitResult = false;
    this._lastPoseMatrix = null;
    return false;
  }

  /**
   * Get the current hit-test pose as a Three.js Matrix4.
   * Only valid when hasHitResult is true.
   * @returns {THREE.Matrix4}
   */
  getHitMatrix() {
    return this._hitMatrix;
  }

  /**
   * Get a copy of the current hit pose matrix for placement.
   * Returns a new Float32Array (use sparingly, not in frame loop).
   * Returns null if no valid surface hit is currently tracked.
   * @returns {Float32Array|null}
   */
  getHitPoseMatrixCopy() {
    if (!this.hasHitResult || !this._lastPoseMatrix) return null;
    return new Float32Array(this._lastPoseMatrix);
  }

  /**
   * Dispose resources.
   */
  dispose() {
    if (this.hitTestSource) {
      if (typeof this.hitTestSource.cancel === 'function') {
        try {
          this.hitTestSource.cancel();
        } catch {
          // Ignore if already cancelled
        }
      }
      this.hitTestSource = null;
    }
    this.hasHitResult = false;
    this._lastPoseMatrix = null;
  }
}
