/**
 * ARNetLab — ARManager
 *
 * Manages the WebXR immersive-ar session lifecycle and Three.js renderer.
 * This module runs entirely outside React — no React state updates per frame.
 *
 * Responsibilities:
 * - Check WebXR / immersive-ar support
 * - Create and manage the XR session
 * - Set up Three.js renderer, scene, and camera for XR
 * - Run the XR render loop
 * - Clean up on session end
 */

import * as THREE from 'three';

export class ARManager {
  constructor() {
    /** @type {THREE.WebGLRenderer|null} */
    this.renderer = null;
    /** @type {THREE.Scene|null} */
    this.scene = null;
    /** @type {THREE.PerspectiveCamera|null} */
    this.camera = null;
    /** @type {XRSession|null} */
    this.session = null;
    /** @type {XRReferenceSpace|null} */
    this.localRefSpace = null;
    /** @type {XRReferenceSpace|null} */
    this.viewerRefSpace = null;
    /** @type {HTMLCanvasElement|null} */
    this.canvas = null;

    /** @type {((frame: XRFrame) => void)|null} */
    this.onFrameCallback = null;
    /** @type {(() => void)|null} */
    this.onSessionEndCallback = null;

    this._boundOnFrame = this._onXRFrame.bind(this);
  }

  /**
   * Check if WebXR is available in the browser.
   * @returns {Promise<boolean>}
   */
  static async isWebXRAvailable() {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }

  /**
   * Start an immersive-ar WebXR session.
   * @param {HTMLCanvasElement} canvas — the canvas element to render into
   * @param {Object} callbacks
   * @param {(frame: XRFrame) => void} callbacks.onFrame — called each XR frame
   * @param {() => void} callbacks.onSessionEnd — called when session ends
   * @returns {Promise<void>}
   */
  async startSession(canvas, { onFrame, onSessionEnd } = {}) {
    this.canvas = canvas;
    this.onFrameCallback = onFrame || null;
    this.onSessionEndCallback = onSessionEnd || null;

    // Create Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    // Create scene and camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    // Add soft ambient light so placed objects are visible
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0.5, 1, 0.5);
    this.scene.add(directionalLight);

    // Request immersive-ar session with hit-test
    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
    };

    try {
      this.session = await navigator.xr.requestSession(
        'immersive-ar',
        sessionInit
      );
    } catch (err) {
      this.dispose();
      throw new Error(
        `AR could not be started. ${err.message || 'Camera permission may have been denied.'}`
      );
    }

    // Listen for session end
    this.session.addEventListener('end', () => {
      this._handleSessionEnd();
    });

    // Set the session on the renderer
    await this.renderer.xr.setSession(this.session);

    // Get reference spaces
    this.localRefSpace = await this.session.requestReferenceSpace('local');
    this.viewerRefSpace = await this.session.requestReferenceSpace('viewer');

    // Start the render loop
    this.renderer.setAnimationLoop(this._boundOnFrame);
  }

  /**
   * Internal XR frame handler — runs at device frame rate.
   * No React state updates here.
   * @param {number} _time
   * @param {XRFrame} frame
   */
  _onXRFrame(time, frame) {
    if (!this.session || !this.renderer || !this.scene || !this.camera) return;

    // Let external code process the frame (hit-test, reticle, packet animation, etc.)
    if (this.onFrameCallback) {
      this.onFrameCallback(frame, time);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle session end (either user-initiated or unexpected).
   */
  _handleSessionEnd() {
    if (this.onSessionEndCallback) {
      this.onSessionEndCallback();
    }
    this.dispose();
  }

  /**
   * End the AR session gracefully.
   */
  async endSession() {
    if (this.session) {
      try {
        await this.session.end();
      } catch {
        // Session may already be ended
      }
    }
  }

  /**
   * Dispose all resources.
   */
  dispose() {
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.xr.setSession(null);
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.scene = null;
    }

    this.camera = null;
    this.session = null;
    this.localRefSpace = null;
    this.viewerRefSpace = null;
    this.canvas = null;
    this.onFrameCallback = null;
    this.onSessionEndCallback = null;
  }
}
