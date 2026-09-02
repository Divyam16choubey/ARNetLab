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
import { DeviceManager } from '../ar/DeviceManager';
import { NODE_TYPE_CONFIG, NODE_TYPES } from '../constants/networkTypes';

/**
 * @typedef {'checking'|'supported'|'unsupported'} ARSupportStatus
 * @typedef {'idle'|'starting'|'active'|'ending'|'error'} ARSessionStatus
 * @typedef {'unavailable'|'searching'|'ready'} ARHitTestStatus
 * @typedef {'none'|'placed'} ARPlacementStatus
 * @typedef {'PC'|'SWITCH'|'ROUTER'|'SERVER'} DeviceType
 */

/** @type {React.Context} */
export const ARContext = createContext(null);

export function ARProvider({ children }) {
  // ---- AR Session State ----
  const [support, setSupport] = useState(/** @type {ARSupportStatus} */ ('checking'));
  const [session, setSession] = useState(/** @type {ARSessionStatus} */ ('idle'));
  const [hitTest, setHitTest] = useState(/** @type {ARHitTestStatus} */ ('unavailable'));
  const [placement, setPlacement] = useState(/** @type {ARPlacementStatus} */ ('none'));
  const [errorMessage, setErrorMessage] = useState(/** @type {string|null} */ (null));

  // ---- Network Device State ----
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(NODE_TYPES.PC);
  const [statusMessage, setStatusMessage] = useState(null);

  // ---- Refs for AR managers & immediate state access ----
  const arManagerRef = useRef(null);
  const hitTestManagerRef = useRef(null);
  const reticleManagerRef = useRef(null);
  const placementManagerRef = useRef(null);
  const deviceManagerRef = useRef(null);

  // Synchronous refs for event handlers to avoid stale closures
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;
  const selectedDeviceTypeRef = useRef(selectedDeviceType);
  selectedDeviceTypeRef.current = selectedDeviceType;

  // Stable label counters per device type
  const nodeCountersRef = useRef({
    PC: 0,
    SWITCH: 0,
    ROUTER: 0,
    SERVER: 0,
  });

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
    setStatusMessage('Starting AR session…');

    const arManager = new ARManager();
    const hitTestManager = new HitTestManager();
    const reticleManager = new ReticleManager();
    const placementManager = new PlacementManager();
    const deviceManager = new DeviceManager();

    arManagerRef.current = arManager;
    hitTestManagerRef.current = hitTestManager;
    reticleManagerRef.current = reticleManager;
    placementManagerRef.current = placementManager;
    deviceManagerRef.current = deviceManager;

    try {
      await arManager.startSession(canvasElement, {
        onFrame: (frame) => {
          // Frame loop runs in vanilla JS — no setState here
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
        },
        onSessionEnd: () => {
          // Session ended (user or system)
          cleanupManagers();
          setSession('idle');
          setHitTest('unavailable');
          setPlacement('none');
          setNodes([]);
          setSelectedNodeId(null);
          setStatusMessage(null);
        },
      });

      // Initialize reticle in scene
      reticleManager.init(arManager.scene);

      await hitTestManager.init(arManager.session, arManager.viewerRefSpace);

      setSession('active');
      setHitTest('searching');
      setStatusMessage('Move your phone slowly to find a surface…');

      // Poll hit-test readiness at low frequency to update React UI
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
      setStatusMessage('AR failed to start.');
    }
  }, []);

  // ---- End AR ----
  const endAR = useCallback(async () => {
    setSession('ending');
    const arManager = arManagerRef.current;
    if (arManager) {
      await arManager.endSession();
    }
    // Cleanup handled in onSessionEnd
  }, []);

  // ---- Device Type Selection ----
  const selectDeviceType = useCallback((type) => {
    setSelectedDeviceType(type);
    const label = NODE_TYPE_CONFIG[type]?.label || type;
    setStatusMessage(`Selected ${label}. Tap a detected surface to place.`);
  }, []);

  // ---- Select Node (or clear selection) ----
  const selectNode = useCallback((nodeId) => {
    const deviceManager = deviceManagerRef.current;
    if (nodeId) {
      if (deviceManager) {
        deviceManager.setSelected(nodeId);
      }
      setSelectedNodeId(nodeId);
      const found = nodesRef.current.find((n) => n.id === nodeId);
      setStatusMessage(`${found?.label || 'Device'} selected.`);
    } else {
      if (deviceManager) {
        deviceManager.clearSelection();
      }
      setSelectedNodeId(null);
    }
  }, []);

  // ---- Delete specific node ----
  const deleteNode = useCallback((nodeId) => {
    if (!nodeId) return;
    const arManager = arManagerRef.current;
    const deviceManager = deviceManagerRef.current;

    if (deviceManager && arManager?.scene) {
      deviceManager.removeDevice(arManager.scene, nodeId);
    }

    const found = nodesRef.current.find((n) => n.id === nodeId);
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));

    if (selectedNodeIdRef.current === nodeId) {
      setSelectedNodeId(null);
    }

    setStatusMessage(`${found?.label || 'Device'} removed.`);
  }, []);

  // ---- Delete currently selected node ----
  const deleteSelectedNode = useCallback(() => {
    const selectedId = selectedNodeIdRef.current;
    if (selectedId) {
      deleteNode(selectedId);
    }
  }, [deleteNode]);

  // ---- Tap handler (handles workspace placement, device selection, device placement) ----
  const onTap = useCallback((screenX, screenY) => {
    const arManager = arManagerRef.current;
    const hitTestManager = hitTestManagerRef.current;
    const placementManager = placementManagerRef.current;
    const deviceManager = deviceManagerRef.current;

    if (!arManager || !hitTestManager || !placementManager || !deviceManager) {
      return;
    }

    // Case 1: Workspace not placed yet -> Place the AR workspace anchor
    if (!placementManager.isPlaced) {
      if (!hitTestManager.hasHitResult) return;

      placementManager.place(arManager.scene, hitTestManager.getHitMatrix());
      setPlacement('placed');
      setStatusMessage('Workspace placed! Choose a device to place.');
      return;
    }

    // Case 2: Workspace already placed -> Check for device selection or device placement
    // Calculate normalized device coordinates (NDC)
    const ndcX =
      screenX !== undefined
        ? (screenX / window.innerWidth) * 2 - 1
        : 0;
    const ndcY =
      screenY !== undefined
        ? -(screenY / window.innerHeight) * 2 + 1
        : 0;

    const activeCamera = arManager.renderer?.xr?.isPresenting
      ? arManager.renderer.xr.getCamera()
      : arManager.camera;

    // Raycast against existing devices first
    const hitNodeId = deviceManager.getDeviceAtScreenPoint(
      activeCamera,
      ndcX,
      ndcY
    );

    if (hitNodeId) {
      // User tapped an existing device -> Select it
      deviceManager.setSelected(hitNodeId);
      setSelectedNodeId(hitNodeId);
      const found = nodesRef.current.find((n) => n.id === hitNodeId);
      setStatusMessage(`${found?.label || 'Device'} selected.`);
      return;
    }

    // If an object is currently selected and user tapped empty space -> Deselect
    if (selectedNodeIdRef.current) {
      deviceManager.clearSelection();
      setSelectedNodeId(null);
      setStatusMessage('Device deselected.');
      return;
    }

    // Otherwise, place a new device of selectedDeviceType at the current hit-test pose
    if (hitTestManager.hasHitResult) {
      const type = selectedDeviceTypeRef.current || NODE_TYPES.PC;
      const count = (nodeCountersRef.current[type] || 0) + 1;
      nodeCountersRef.current[type] = count;

      const label = `${type}-${String(count).padStart(2, '0')}`;
      const id = `node-${type.toLowerCase()}-${Date.now()}`;
      const color = NODE_TYPE_CONFIG[type]?.color || '#3b82f6';
      const hitMatrix = hitTestManager.getHitMatrix();

      deviceManager.addDevice(
        arManager.scene,
        type,
        hitMatrix,
        id,
        label,
        color
      );

      const pos = deviceManager.getNodePosition(id) || { x: 0, y: 0, z: 0 };
      const newNode = {
        id,
        type,
        label,
        position: pos,
        color,
      };

      setNodes((prev) => [...prev, newNode]);
      setStatusMessage(`${label} placed.`);
    }
  }, []);

  // ---- Reset Network (clears devices only, keeps workspace anchor & AR session) ----
  const resetNetwork = useCallback(() => {
    const arManager = arManagerRef.current;
    const deviceManager = deviceManagerRef.current;

    if (deviceManager && arManager?.scene) {
      deviceManager.removeAll(arManager.scene);
    }

    setNodes([]);
    setSelectedNodeId(null);
    nodeCountersRef.current = {
      PC: 0,
      SWITCH: 0,
      ROUTER: 0,
      SERVER: 0,
    };

    setStatusMessage('Network cleared. Workspace anchor preserved.');
  }, []);

  // ---- Reset Placement (clears anchor AND devices, restarts surface scan) ----
  const resetPlacement = useCallback(() => {
    const arManager = arManagerRef.current;
    const placementManager = placementManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const reticleManager = reticleManagerRef.current;

    if (deviceManager && arManager?.scene) {
      deviceManager.removeAll(arManager.scene);
    }
    if (placementManager && arManager?.scene) {
      placementManager.reset(arManager.scene);
    }
    if (reticleManager) {
      reticleManager.show();
    }

    setNodes([]);
    setSelectedNodeId(null);
    nodeCountersRef.current = {
      PC: 0,
      SWITCH: 0,
      ROUTER: 0,
      SERVER: 0,
    };

    setPlacement('none');
    setHitTest('searching');
    hitTestReadyRef.current = false;
    setStatusMessage('Workspace reset. Move your phone to find a surface.');
  }, []);

  // ---- Internal cleanup ----
  function cleanupManagers() {
    if (hitTestIntervalRef.current) {
      clearInterval(hitTestIntervalRef.current);
      hitTestIntervalRef.current = null;
    }
    hitTestReadyRef.current = false;

    const arManager = arManagerRef.current;

    if (deviceManagerRef.current) {
      deviceManagerRef.current.dispose(arManager?.scene);
      deviceManagerRef.current = null;
    }
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
    // AR Session State
    support,
    session,
    hitTest,
    placement,
    errorMessage,
    statusMessage,
    // Network Device State
    nodes,
    selectedNodeId,
    selectedDeviceType,
    // Actions
    startAR,
    endAR,
    onTap,
    selectDeviceType,
    selectNode,
    deleteNode,
    deleteSelectedNode,
    resetNetwork,
    resetPlacement,
  };

  return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
}
