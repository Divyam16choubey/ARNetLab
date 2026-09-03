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

    this._isDisposed = false;
    this._controller = null;
    this.onSelectCallback = null;
    this._boundOnFrame = this._onXRFrame.bind(this);
    this._boundOnResize = this._onResize.bind(this);
    this._boundSessionEnd = this._handleSessionEnd.bind(this);
    this._boundOnSelect = this._onXRSelect.bind(this);
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
   * @param {(frame: XRFrame, time: number) => void} callbacks.onFrame — called each XR frame
   * @param {() => void} callbacks.onSessionEnd — called when session ends
   * @param {(event: Event) => void} callbacks.onSelect — called when WebXR screen select fires
   * @returns {Promise<void>}
   */
  async startSession(canvas, { onFrame, onSessionEnd, onSelect } = {}) {
    this.canvas = canvas;
    this.onFrameCallback = onFrame || null;
    this.onSessionEndCallback = onSessionEnd || null;
    this.onSelectCallback = onSelect || null;

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

    // Configure WebXR session.
    // On Android Chrome (e.g. Samsung Galaxy Tab S9 FE), domOverlay root must be supplied
    // so Chrome can activate DOM overlay mode; otherwise standard WebXR compositor takes over.
    const overlayRoot =
      typeof document !== 'undefined'
        ? document.getElementById('root') || document.body
        : null;

    let session = null;
    if (overlayRoot) {
      try {
        const sessionInitWithOverlay = {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay', 'local', 'local-floor'],
          domOverlay: { root: overlayRoot },
        };
        session = await navigator.xr.requestSession(
          'immersive-ar',
          sessionInitWithOverlay
        );
      } catch (overlayErr) {
        console.warn(
          'Could not start immersive-ar with dom-overlay, falling back to base session:',
          overlayErr
        );
      }
    }

    if (!session) {
      const fallbackInit = {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local', 'local-floor'],
      };
      try {
        session = await navigator.xr.requestSession('immersive-ar', fallbackInit);
      } catch (err) {
        this.dispose();
        throw new Error(
          `AR could not be started. ${err.message || 'Camera permission may have been denied.'}`
        );
      }
    }

    this.session = session;

    // Listen for session end
    this.session.addEventListener('end', this._boundSessionEnd);

    // Listen for WebXR screen select events (primary input on Android ARCore)
    this.session.addEventListener('select', this._boundOnSelect);

    // Listen for window resize and orientation change
    window.addEventListener('resize', this._boundOnResize);
    window.addEventListener('orientationchange', this._boundOnResize);

    // Acquire tracking reference space with graceful fallback.
    // Three.js defaults to 'local-floor' which is unsupported on handheld AR (ARCore / Galaxy Tab S9 FE),
    // throwing: "Failed to execute 'requestReferenceSpace' on 'XRSession': This device does not support the requested reference space type."
    // Handheld AR devices use 'local' as the primary world coordinate space.
    let chosenRefSpace = null;
    let chosenType = 'local';
    const candidateTypes = ['local', 'local-floor', 'viewer'];

    for (const type of candidateTypes) {
      try {
        chosenRefSpace = await this.session.requestReferenceSpace(type);
        chosenType = type;
        break;
      } catch {
        // Fall back to next space type
      }
    }

    if (!chosenRefSpace) {
      this.dispose();
      throw new Error('This device does not support a compatible WebXR reference space.');
    }

    this.localRefSpace = chosenRefSpace;

    // Configure Three.js reference space BEFORE setSession to prevent defaulting to 'local-floor'
    this.renderer.xr.setReferenceSpaceType(chosenType);
    await this.renderer.xr.setSession(this.session);
    this.renderer.xr.setReferenceSpace(chosenRefSpace);

    // Acquire viewer reference space for hit-test raycasting
    try {
      this.viewerRefSpace = await this.session.requestReferenceSpace('viewer');
    } catch {
      this.viewerRefSpace = chosenRefSpace;
    }

    // Set up XR controller for primary screen interaction in handheld AR
    this._controller = this.renderer.xr.getController(0);
    if (this._controller) {
      this._controller.addEventListener('select', this._boundOnSelect);
      this.scene.add(this._controller);
    }

    // Start the render loop
    this.renderer.setAnimationLoop(this._boundOnFrame);
  }

  /**
   * Internal WebXR select handler — triggered on screen taps in immersive AR.
   * @param {Event} event
   */
  _onXRSelect(event) {
    if (this.onSelectCallback) {
      try {
        this.onSelectCallback(event);
      } catch (err) {
        console.warn('Error in onSelectCallback:', err);
      }
    }
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
   * Handle viewport resize and device orientation changes.
   */
  _onResize() {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Handle session end (either user-initiated or unexpected).
   */
  _handleSessionEnd() {
    if (this._isDisposed) return;
    this._isDisposed = true;

    if (this.onSessionEndCallback) {
      try {
        this.onSessionEndCallback();
      } catch (err) {
        console.warn('Error in onSessionEndCallback:', err);
      }
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
    this._isDisposed = true;

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._boundOnResize);
      window.removeEventListener('orientationchange', this._boundOnResize);
    }

    if (this.session) {
      try {
        this.session.removeEventListener('end', this._boundSessionEnd);
        this.session.removeEventListener('select', this._boundOnSelect);
      } catch {}
    }

    if (this._controller) {
      try {
        this._controller.removeEventListener('select', this._boundOnSelect);
      } catch {}
      this._controller = null;
    }

    if (this.renderer) {
      try {
        this.renderer.setAnimationLoop(null);
      } catch {}
      try {
        this.renderer.xr.setSession(null);
      } catch {}
      try {
        this.renderer.dispose();
      } catch {}
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
    this.onSelectCallback = null;
  }
}
