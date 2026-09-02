import {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { ARManager } from '../ar/ARManager';
import { HitTestManager } from '../ar/HitTestManager';
import { ReticleManager } from '../ar/ReticleManager';
import { PlacementManager } from '../ar/PlacementManager';

/**
 * @typedef {'checking'|'supported'|'unsupported'} ARSupportStatus
 * @typedef {'idle'|'starting'|'active'|'ending'|'error'} ARSessionStatus
 * @typedef {'unavailable'|'searching'|'ready'} ARHitTestStatus
 * @typedef {'none'|'placed'} ARPlacementStatus
 */

/** @type {React.Context} */
export const ARContext = createContext(null);

export function ARProvider({ children }) {
  // ---- State visible to React ----
  const [support, setSupport] = useState(/** @type {ARSupportStatus} */ ('checking'));
  const [session, setSession] = useState(/** @type {ARSessionStatus} */ ('idle'));
  const [hitTest, setHitTest] = useState(/** @type {ARHitTestStatus} */ ('unavailable'));
  const [placement, setPlacement] = useState(/** @type {ARPlacementStatus} */ ('none'));
  const [errorMessage, setErrorMessage] = useState(/** @type {string|null} */ (null));

  // ---- Refs for AR managers (never trigger re-renders) ----
  const arManagerRef = useRef(null);
  const hitTestManagerRef = useRef(null);
  const reticleManagerRef = useRef(null);
  const placementManagerRef = useRef(null);

  // Track hit-test state changes without React re-render per frame
  const hitTestReadyRef = useRef(false);
  const hitTestIntervalRef = useRef(null);

  // ---- Check WebXR support on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supported = await ARManager.isWebXRAvailable();
      if (!cancelled) {
        setSupport(supported ? 'supported' : 'unsupported');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Start AR ----
  const startAR = useCallback(async (canvasElement) => {
    if (!canvasElement) return;

    setSession('starting');
    setErrorMessage(null);

    const arManager = new ARManager();
    const hitTestManager = new HitTestManager();
    const reticleManager = new ReticleManager();
    const placementManager = new PlacementManager();

    arManagerRef.current = arManager;
    hitTestManagerRef.current = hitTestManager;
    reticleManagerRef.current = reticleManager;
    placementManagerRef.current = placementManager;

    try {
      await arManager.startSession(canvasElement, {
        onFrame: (frame) => {
          // This runs at device frame rate — no setState here
          if (!placementManager.isPlaced) {
            const hasHit = hitTestManager.update(
              frame,
              arManager.localRefSpace
            );

            if (hasHit) {
              reticleManager.updatePose(hitTestManager.getHitMatrix());
              hitTestReadyRef.current = true;
            } else {
              reticleManager.hide();
              hitTestReadyRef.current = false;
            }
          }
        },
        onSessionEnd: () => {
          // Session ended (user or system)
          cleanupManagers();
          setSession('idle');
          setHitTest('unavailable');
          setPlacement('none');
        },
      });

      // Initialize sub-managers after session is established
      reticleManager.init(arManager.scene);

      await hitTestManager.init(arManager.session, arManager.viewerRefSpace);

      setSession('active');
      setHitTest('searching');

      // Poll hit-test readiness from the ref at low frequency
      // to update React UI without per-frame re-renders
      hitTestIntervalRef.current = setInterval(() => {
        if (hitTestReadyRef.current) {
          setHitTest('ready');
        } else {
          setHitTest((prev) => (prev === 'ready' ? 'searching' : prev));
        }
      }, 300);
    } catch (err) {
      cleanupManagers();
      setSession('error');
      setErrorMessage(
        err.message ||
          'AR could not be started. Make sure you are using a supported browser and device.'
      );
    }
  }, []);

  // ---- End AR ----
  const endAR = useCallback(async () => {
    setSession('ending');
    const arManager = arManagerRef.current;
    if (arManager) {
      await arManager.endSession();
    }
    // Cleanup is handled by the onSessionEnd callback
  }, []);

  // ---- Tap to place ----
  const onTap = useCallback(() => {
    const hitTestManager = hitTestManagerRef.current;
    const reticleManager = reticleManagerRef.current;
    const placementManager = placementManagerRef.current;
    const arManager = arManagerRef.current;

    if (
      !hitTestManager ||
      !reticleManager ||
      !placementManager ||
      !arManager
    )
      return;

    if (!hitTestManager.hasHitResult || placementManager.isPlaced) return;

    placementManager.place(arManager.scene, hitTestManager.getHitMatrix());
    reticleManager.hide();
    setPlacement('placed');
  }, []);

  // ---- Reset placement ----
  const resetPlacement = useCallback(() => {
    const placementManager = placementManagerRef.current;
    const reticleManager = reticleManagerRef.current;
    const arManager = arManagerRef.current;

    if (!placementManager || !arManager) return;

    placementManager.reset(arManager.scene);
    if (reticleManager) reticleManager.show();
    setPlacement('none');
    setHitTest('searching');
    hitTestReadyRef.current = false;
  }, []);

  // ---- Internal cleanup ----
  function cleanupManagers() {
    if (hitTestIntervalRef.current) {
      clearInterval(hitTestIntervalRef.current);
      hitTestIntervalRef.current = null;
    }
    hitTestReadyRef.current = false;

    const arManager = arManagerRef.current;

    if (hitTestManagerRef.current) {
      hitTestManagerRef.current.dispose();
      hitTestManagerRef.current = null;
    }
    if (reticleManagerRef.current) {
      reticleManagerRef.current.dispose(arManager?.scene);
      reticleManagerRef.current = null;
    }
    if (placementManagerRef.current) {
      placementManagerRef.current.dispose(arManager?.scene);
      placementManagerRef.current = null;
    }
    if (arManager) {
      arManager.dispose();
      arManagerRef.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupManagers();
    };
  }, []);

  const value = {
    // State
    support,
    session,
    hitTest,
    placement,
    errorMessage,
    // Actions
    startAR,
    endAR,
    onTap,
    resetPlacement,
  };

  return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
}
