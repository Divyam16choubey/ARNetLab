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
import { ConnectionManager } from '../ar/ConnectionManager';
import { PacketMesh } from '../ar/PacketMesh';
import { NetworkGraph } from '../network/NetworkGraph';
import { findShortestPath } from '../network/dijkstra';
import { PacketSimulator, SIMULATION_STATUS } from '../network/PacketSimulator';
import { NODE_TYPE_CONFIG, NODE_TYPES } from '../constants/networkTypes';

/**
 * @typedef {'checking'|'supported'|'unsupported'} ARSupportStatus
 * @typedef {'idle'|'starting'|'active'|'ending'|'error'} ARSessionStatus
 * @typedef {'unavailable'|'searching'|'ready'} ARHitTestStatus
 * @typedef {'none'|'placed'} ARPlacementStatus
 * @typedef {'PC'|'SWITCH'|'ROUTER'|'SERVER'} DeviceType
 * @typedef {'place'|'select'|'connect'|'source'|'destination'} InteractionMode
 * @typedef {'IDLE'|'READY'|'RUNNING'|'PAUSED'|'COMPLETED'|'STOPPED'|'ERROR'} SimStatus
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

  // ---- Network Device & Topology State ----
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(NODE_TYPES.PC);

  // ---- Interaction Modes & Routing State ----
  const [activeMode, setActiveModeState] = useState(/** @type {InteractionMode} */ ('place'));
  const [connectSourceNodeId, setConnectSourceNodeId] = useState(null);
  const [sourceNodeId, setSourceNodeId] = useState(null);
  const [destinationNodeId, setDestinationNodeId] = useState(null);
  const [route, setRoute] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // ---- Virtual Packet Simulation State ----
  const [simulationStatus, setSimulationStatus] = useState(/** @type {SimStatus} */ (SIMULATION_STATUS.IDLE));
  const [packetInfo, setPacketInfo] = useState({
    packetId: null,
    currentNodeId: null,
    nextNodeId: null,
    currentEdgeId: null,
    progress: 0,
    elapsedTime: 0,
    hops: 0,
  });

  // ---- Refs for AR managers & immediate state access ----
  const arManagerRef = useRef(null);
  const hitTestManagerRef = useRef(null);
  const reticleManagerRef = useRef(null);
  const placementManagerRef = useRef(null);
  const deviceManagerRef = useRef(null);
  const connectionManagerRef = useRef(null);
  const packetMeshRef = useRef(new PacketMesh());
  const graphRef = useRef(new NetworkGraph());

  // Packet simulation manager and loop refs
  const packetSimulatorRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Synchronous refs for event handlers to prevent stale closures
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;
  const selectedDeviceTypeRef = useRef(selectedDeviceType);
  selectedDeviceTypeRef.current = selectedDeviceType;
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;
  const connectSourceNodeIdRef = useRef(connectSourceNodeId);
  connectSourceNodeIdRef.current = connectSourceNodeId;
  const sourceNodeIdRef = useRef(sourceNodeId);
  sourceNodeIdRef.current = sourceNodeId;
  const destinationNodeIdRef = useRef(destinationNodeId);
  destinationNodeIdRef.current = destinationNodeId;
  const routeRef = useRef(route);
  routeRef.current = route;
  const simulationStatusRef = useRef(simulationStatus);
  simulationStatusRef.current = simulationStatus;

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

  // Input debouncing & reference to tap handler for WebXR events
  const lastTapTimestampRef = useRef(0);
  const onTapRef = useRef(null);

  // Initialize PacketSimulator with discrete milestone callbacks
  useEffect(() => {
    packetSimulatorRef.current = new PacketSimulator({
      onStart: (ev) => {
        setSimulationStatus(SIMULATION_STATUS.RUNNING);
        const srcNode = graphRef.current.getNode(ev.sourceId);
        setStatusMessage(`Packet dispatched from ${srcNode?.label || ev.sourceId}.`);
        setPacketInfo({
          packetId: ev.packetId,
          currentNodeId: ev.sourceId,
          nextNodeId: ev.routeNodeIds[1] || null,
          currentEdgeId: null,
          progress: 0,
          elapsedTime: 0,
          hops: ev.routeNodeIds.length - 1,
        });
      },
      onNodeReached: (ev) => {
        const node = graphRef.current.getNode(ev.nodeId);
        setStatusMessage(`Packet reached ${node?.label || ev.nodeId} (Hop ${ev.hopIndex}/${ev.totalHops})`);
        setPacketInfo((prev) => ({
          ...prev,
          currentNodeId: ev.nodeId,
        }));
      },
      onEdgeChanged: (ev) => {
        const arManager = arManagerRef.current;
        const connectionManager = connectionManagerRef.current;
        if (connectionManager && arManager?.scene) {
          connectionManager.setActivePacketEdge(arManager.scene, ev.edgeId);
        }
        const nextNode = graphRef.current.getNode(ev.toNodeId);
        setStatusMessage(`Packet → ${nextNode?.label || ev.toNodeId}`);
        setPacketInfo((prev) => ({
          ...prev,
          currentNodeId: ev.fromNodeId,
          nextNodeId: ev.toNodeId,
          currentEdgeId: ev.edgeId,
        }));
      },
      onComplete: (ev) => {
        const arManager = arManagerRef.current;
        const connectionManager = connectionManagerRef.current;
        if (connectionManager && arManager?.scene) {
          connectionManager.clearActivePacketEdge(arManager.scene);
        }
        setSimulationStatus(SIMULATION_STATUS.COMPLETED);
        const dstNode = graphRef.current.getNode(ev.destinationId);
        setStatusMessage(`Packet delivered to ${dstNode?.label || ev.destinationId} in ${ev.totalTime}s!`);
        setPacketInfo((prev) => ({
          ...prev,
          currentNodeId: ev.destinationId,
          nextNodeId: null,
          currentEdgeId: null,
          progress: 1.0,
          elapsedTime: ev.totalTime,
        }));
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      },
      onStop: (ev) => {
        const arManager = arManagerRef.current;
        const connectionManager = connectionManagerRef.current;
        const packetMesh = packetMeshRef.current;
        if (connectionManager && arManager?.scene) {
          connectionManager.clearActivePacketEdge(arManager.scene);
        }
        if (packetMesh && arManager?.scene) {
          packetMesh.dispose(arManager.scene);
        }
        setSimulationStatus(SIMULATION_STATUS.STOPPED);
        setStatusMessage('Packet simulation stopped.');
        setPacketInfo((prev) => ({
          ...prev,
          currentEdgeId: null,
          elapsedTime: ev?.elapsedTime ?? prev.elapsedTime,
        }));
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      },
      onError: (ev) => {
        const arManager = arManagerRef.current;
        const connectionManager = connectionManagerRef.current;
        const packetMesh = packetMeshRef.current;
        if (connectionManager && arManager?.scene) {
          connectionManager.clearActivePacketEdge(arManager.scene);
        }
        if (packetMesh && arManager?.scene) {
          packetMesh.dispose(arManager.scene);
        }
        setSimulationStatus(SIMULATION_STATUS.ERROR);
        setStatusMessage(ev?.message || 'Simulation error.');
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      },
    });

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, []);

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

  // ---- Recalculate route helper ----
  const recalculateRoute = useCallback((customSrcId, customDstId) => {
    const srcId = customSrcId !== undefined ? customSrcId : sourceNodeIdRef.current;
    const dstId = customDstId !== undefined ? customDstId : destinationNodeIdRef.current;
    const graph = graphRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;

    if (!srcId || !dstId) {
      setRoute(null);
      setSimulationStatus(SIMULATION_STATUS.IDLE);
      if (connectionManager && arManager?.scene) {
        connectionManager.clearRouteHighlights(arManager.scene);
      }
      return;
    }

    const result = findShortestPath(graph, srcId, dstId);
    setRoute(result);

    const srcNode = graph.getNode(srcId);
    const dstNode = graph.getNode(dstId);

    if (result.reachable && arManager?.scene && connectionManager) {
      connectionManager.highlightRoute(arManager.scene, result.edgeIds);
      const pathNames = result.path.map((id) => graph.getNode(id)?.label || id).join(' → ');
      setStatusMessage(`Route found: ${pathNames} (${result.totalWeight.toFixed(2)}m)`);
      setSimulationStatus(SIMULATION_STATUS.READY);
    } else {
      if (connectionManager && arManager?.scene) {
        connectionManager.clearRouteHighlights(arManager.scene);
      }
      setSimulationStatus(SIMULATION_STATUS.IDLE);
      if (srcNode && dstNode) {
        setStatusMessage(`No route available between ${srcNode.label} and ${dstNode.label}.`);
      }
    }
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
    const connectionManager = new ConnectionManager();

    arManagerRef.current = arManager;
    hitTestManagerRef.current = hitTestManager;
    reticleManagerRef.current = reticleManager;
    placementManagerRef.current = placementManager;
    deviceManagerRef.current = deviceManager;
    connectionManagerRef.current = connectionManager;

    try {
      await arManager.startSession(canvasElement, {
        onFrame: (frame, time) => {
          // 1. Surface detection via HitTest
          const hasHit = hitTestManager.update(
            frame,
            arManager.localRefSpace
          );

          // Reticle is only displayed during initial workspace placement or device placement mode
          const shouldShowReticle = !placementManager.isPlaced || activeModeRef.current === 'place';

          if (hasHit) {
            hitTestReadyRef.current = true;
            if (shouldShowReticle) {
              reticleManager.updatePose(hitTestManager.getHitMatrix());
            } else {
              reticleManager.hide();
            }
          } else {
            reticleManager.hide();
            hitTestReadyRef.current = false;
          }

          // 2. High-frequency Packet Simulation (runs in vanilla JS - zero React setState per frame!)
          const sim = packetSimulatorRef.current;
          const mesh = packetMeshRef.current;
          if (sim && sim.isRunning() && mesh && arManager?.scene) {
            const now = typeof time === 'number' && time > 0 ? time : performance.now();
            const dt = lastFrameTimeRef.current ? Math.max(0, (now - lastFrameTimeRef.current) / 1000) : 0.016;
            lastFrameTimeRef.current = now;

            const res = sim.update(dt, graphRef.current, (id) => deviceManager.getNodePosition(id));
            mesh.setPosition(res.position.x, res.position.y, res.position.z);
            mesh.animate(now * 0.001);
          }
        },
        onSelect: () => {
          if (onTapRef.current) {
            onTapRef.current();
          }
        },
        onSessionEnd: () => {
          // Session ended (user or system)
          cleanupManagers();
          setSession('idle');
          setHitTest('unavailable');
          setPlacement('none');
          setNodes([]);
          setEdges([]);
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          setSourceNodeId(null);
          setDestinationNodeId(null);
          setRoute(null);
          setSimulationStatus(SIMULATION_STATUS.IDLE);
          setStatusMessage(null);
        },
      });

      // Initialize reticle in scene
      reticleManager.init(arManager.scene);

      await hitTestManager.init(arManager.session, arManager.viewerRefSpace);

      setSession('active');
      setHitTest('searching');
      setStatusMessage('Move your phone slowly to find a surface…');

      // Poll hit-test readiness at low frequency to update React UI without redundant re-renders
      hitTestIntervalRef.current = setInterval(() => {
        setHitTest((prev) => {
          const next = hitTestReadyRef.current ? 'ready' : 'searching';
          return prev === next ? prev : next;
        });
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

  // ---- Set Mode (place, select, connect, source, destination) ----
  const setActiveMode = useCallback((mode) => {
    setActiveModeState(mode);
    setConnectSourceNodeId(null);
    setSelectedEdgeId(null);

    switch (mode) {
      case 'place':
        setStatusMessage(`Place mode: Tap a detected surface to place ${selectedDeviceTypeRef.current}.`);
        break;
      case 'connect':
        setStatusMessage('Connect mode: Tap the first device to connect.');
        break;
      case 'source':
        setStatusMessage('Source mode: Tap a device to set as Route Source.');
        break;
      case 'destination':
        setStatusMessage('Destination mode: Tap a device to set as Route Destination.');
        break;
      case 'select':
      default:
        setStatusMessage('Select mode: Tap a device or link to inspect.');
        break;
    }
  }, []);

  // ---- Device Type Selection ----
  const selectDeviceType = useCallback((type) => {
    setSelectedDeviceType(type);
    setActiveModeState('place');
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
      setSelectedEdgeId(null);
      const found = nodesRef.current.find((n) => n.id === nodeId);
      setStatusMessage(`${found?.label || 'Device'} selected.`);
    } else {
      if (deviceManager) {
        deviceManager.clearSelection();
      }
      setSelectedNodeId(null);
    }
  }, []);

  // ---- Select Edge ----
  const selectEdge = useCallback((edgeId) => {
    setSelectedEdgeId(edgeId);
    if (edgeId) {
      const edge = edgesRef.current.find((e) => e.id === edgeId);
      if (edge) {
        const nodeA = graphRef.current.getNode(edge.source);
        const nodeB = graphRef.current.getNode(edge.target);
        setStatusMessage(`Link: ${nodeA?.label || edge.source} ↔ ${nodeB?.label || edge.target} (${edge.weight.toFixed(2)}m)`);
      }
    }
  }, []);

  // ---- Create Connection between two devices ----
  const createConnection = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return null;

    const graph = graphRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const deviceManager = deviceManagerRef.current;

    if (graph.hasEdge(sourceId, targetId)) {
      setStatusMessage('Connection already exists between these devices.');
      return null;
    }

    const pos1 = deviceManager?.getNodePosition(sourceId) || graph.getNode(sourceId)?.position;
    const pos2 = deviceManager?.getNodePosition(targetId) || graph.getNode(targetId)?.position;

    if (!pos1 || !pos2) return null;

    const edge = graph.addEdge(sourceId, targetId);
    if (!edge) return null;

    if (connectionManager && arManager?.scene) {
      connectionManager.addConnection(arManager.scene, edge, pos1, pos2);
    }

    setEdges(graph.getEdges());

    const nodeA = graph.getNode(sourceId);
    const nodeB = graph.getNode(targetId);
    setStatusMessage(`Connected ${nodeA?.label} ↔ ${nodeB?.label} (${edge.weight.toFixed(2)}m).`);

    // Auto-recalculate route if source and destination are already active
    if (sourceNodeIdRef.current && destinationNodeIdRef.current) {
      recalculateRoute();
    }

    return edge;
  }, [recalculateRoute]);

  // ---- Delete Connection ----
  const deleteConnection = useCallback((edgeId) => {
    if (!edgeId) return;

    const graph = graphRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const sim = packetSimulatorRef.current;

    // Topology Safety: If simulation is running, stop it cleanly
    if (sim?.isRunning()) {
      sim.stop();
      if (packetMeshRef.current && arManager?.scene) {
        packetMeshRef.current.dispose(arManager.scene);
      }
      if (connectionManager && arManager?.scene) {
        connectionManager.clearActivePacketEdge(arManager.scene);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setSimulationStatus(SIMULATION_STATUS.STOPPED);
    }

    graph.removeEdge(edgeId);

    if (connectionManager && arManager?.scene) {
      connectionManager.removeConnection(arManager.scene, edgeId);
    }

    setEdges(graph.getEdges());
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }

    setStatusMessage('Connection removed.');

    // Auto-recalculate route if source and destination are active
    if (sourceNodeIdRef.current && destinationNodeIdRef.current) {
      recalculateRoute();
    }
  }, [selectedEdgeId, recalculateRoute]);

  // ---- Set Source Node ----
  const setSourceNode = useCallback((nodeId) => {
    const deviceManager = deviceManagerRef.current;
    const graph = graphRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const sim = packetSimulatorRef.current;

    // If simulation is running, stop it cleanly before switching source
    if (sim?.isRunning()) {
      sim.stop();
      if (packetMeshRef.current && arManager?.scene) {
        packetMeshRef.current.dispose(arManager.scene);
      }
      if (connectionManager && arManager?.scene) {
        connectionManager.clearActivePacketEdge(arManager.scene);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setSimulationStatus(SIMULATION_STATUS.STOPPED);
    }

    if (nodeId && nodeId === destinationNodeIdRef.current) {
      // Cannot be same as destination -> clear destination
      setDestinationNodeId(null);
      if (deviceManager) deviceManager.setDeviceRole(nodeId, null);
    }

    if (sourceNodeIdRef.current && deviceManager) {
      deviceManager.setDeviceRole(sourceNodeIdRef.current, null);
    }

    if (nodeId && deviceManager) {
      deviceManager.setDeviceRole(nodeId, 'source');
    }

    setSourceNodeId(nodeId);
    const node = nodeId ? graph.getNode(nodeId) : null;
    if (node) {
      setStatusMessage(`Source set to ${node.label}.`);
    }

    recalculateRoute(nodeId, destinationNodeIdRef.current);
  }, [recalculateRoute]);

  // ---- Set Destination Node ----
  const setDestinationNode = useCallback((nodeId) => {
    const deviceManager = deviceManagerRef.current;
    const graph = graphRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const sim = packetSimulatorRef.current;

    // If simulation is running, stop it cleanly before switching destination
    if (sim?.isRunning()) {
      sim.stop();
      if (packetMeshRef.current && arManager?.scene) {
        packetMeshRef.current.dispose(arManager.scene);
      }
      if (connectionManager && arManager?.scene) {
        connectionManager.clearActivePacketEdge(arManager.scene);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setSimulationStatus(SIMULATION_STATUS.STOPPED);
    }

    if (nodeId && nodeId === sourceNodeIdRef.current) {
      // Cannot be same as source -> clear source
      setSourceNodeId(null);
      if (deviceManager) deviceManager.setDeviceRole(nodeId, null);
    }

    if (destinationNodeIdRef.current && deviceManager) {
      deviceManager.setDeviceRole(destinationNodeIdRef.current, null);
    }

    if (nodeId && deviceManager) {
      deviceManager.setDeviceRole(nodeId, 'destination');
    }

    setDestinationNodeId(nodeId);
    const node = nodeId ? graph.getNode(nodeId) : null;
    if (node) {
      setStatusMessage(`Destination set to ${node.label}.`);
    }

    recalculateRoute(sourceNodeIdRef.current, nodeId);
  }, [recalculateRoute]);

  // ---- Delete specific node ----
  const deleteNode = useCallback((nodeId) => {
    if (!nodeId) return;
    const arManager = arManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const graph = graphRef.current;
    const sim = packetSimulatorRef.current;

    // Topology Safety: If simulation is running, stop it immediately
    if (sim?.isRunning()) {
      sim.stop();
      if (packetMeshRef.current && arManager?.scene) {
        packetMeshRef.current.dispose(arManager.scene);
      }
      if (connectionManager && arManager?.scene) {
        connectionManager.clearActivePacketEdge(arManager.scene);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setSimulationStatus(SIMULATION_STATUS.STOPPED);
    }

    // 1. Remove from 3D device manager
    if (deviceManager && arManager?.scene) {
      deviceManager.removeDevice(arManager.scene, nodeId);
    }

    // 2. Remove from graph and get incident edge IDs
    const removedEdgeIds = graph.removeNode(nodeId);

    // 3. Remove incident visual connections from 3D scene
    if (connectionManager && arManager?.scene) {
      for (const edgeId of removedEdgeIds) {
        connectionManager.removeConnection(arManager.scene, edgeId);
      }
    }

    const found = nodesRef.current.find((n) => n.id === nodeId);
    setNodes(graph.getNodes());
    setEdges(graph.getEdges());

    if (selectedNodeIdRef.current === nodeId) {
      setSelectedNodeId(null);
    }
    if (connectSourceNodeIdRef.current === nodeId) {
      setConnectSourceNodeId(null);
    }

    // Clear role if deleted device was source or destination
    let newSrc = sourceNodeIdRef.current;
    let newDst = destinationNodeIdRef.current;

    if (sourceNodeIdRef.current === nodeId) {
      newSrc = null;
      setSourceNodeId(null);
    }
    if (destinationNodeIdRef.current === nodeId) {
      newDst = null;
      setDestinationNodeId(null);
    }

    setStatusMessage(`${found?.label || 'Device'} removed.`);

    // Recalculate route
    recalculateRoute(newSrc, newDst);
  }, [recalculateRoute]);

  // ---- Delete currently selected node ----
  const deleteSelectedNode = useCallback(() => {
    const selectedId = selectedNodeIdRef.current;
    if (selectedId) {
      deleteNode(selectedId);
    }
  }, [deleteNode]);

  // ---- Tap handler (handles workspace placement, device selection, connections, routing picks) ----
  const onTap = useCallback((screenX, screenY) => {
    // 1. Debounce rapid duplicate taps (e.g. concurrent DOM pointer event and WebXR select event)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastTapTimestampRef.current < 250) {
      return;
    }
    lastTapTimestampRef.current = now;

    const arManager = arManagerRef.current;
    const hitTestManager = hitTestManagerRef.current;
    const placementManager = placementManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const graph = graphRef.current;

    if (!arManager || !hitTestManager || !placementManager || !deviceManager) {
      return;
    }

    // Case 1: Workspace not placed yet -> Place the AR workspace anchor
    if (!placementManager.isPlaced) {
      if (!hitTestManager.hasHitResult) return;

      placementManager.place(arManager.scene, hitTestManager.getHitMatrix());
      setPlacement('placed');
      setStatusMessage('Workspace placed! Choose a device to place or tap Connect.');
      return;
    }

    // Case 2: Workspace already placed -> Check for interaction based on activeMode
    const targetX =
      screenX !== undefined
        ? screenX
        : typeof window !== 'undefined' && window.__lastPointerX !== undefined
        ? window.__lastPointerX
        : typeof window !== 'undefined'
        ? window.innerWidth / 2
        : 0;

    const targetY =
      screenY !== undefined
        ? screenY
        : typeof window !== 'undefined' && window.__lastPointerY !== undefined
        ? window.__lastPointerY
        : typeof window !== 'undefined'
        ? window.innerHeight / 2
        : 0;

    const width = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1;
    const height = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 1;

    const ndcX = (targetX / width) * 2 - 1;
    const ndcY = -(targetY / height) * 2 + 1;

    // In Three.js WebXR, getCamera() returns an ArrayCamera. Use the active perspective sub-camera for raycasting.
    let activeCamera = arManager.camera;
    if (arManager.renderer?.xr?.isPresenting) {
      const xrCam = arManager.renderer.xr.getCamera();
      activeCamera = xrCam?.cameras && xrCam.cameras.length > 0 ? xrCam.cameras[0] : xrCam;
    }

    // Raycast against existing devices
    const hitNodeId = deviceManager.getDeviceAtScreenPoint(
      activeCamera,
      ndcX,
      ndcY
    );

    const mode = activeModeRef.current;

    // === MODE: CONNECT ===
    if (mode === 'connect') {
      if (hitNodeId) {
        if (!connectSourceNodeIdRef.current) {
          // First device tapped
          setConnectSourceNodeId(hitNodeId);
          const node = graph.getNode(hitNodeId);
          setStatusMessage(`Selected ${node?.label}. Now tap second device to connect.`);
        } else if (connectSourceNodeIdRef.current === hitNodeId) {
          // Tapped same device again -> deselect
          setConnectSourceNodeId(null);
          setStatusMessage('Connect cancelled for this device.');
        } else {
          // Second device tapped -> Create connection!
          createConnection(connectSourceNodeIdRef.current, hitNodeId);
          setConnectSourceNodeId(null);
        }
      } else {
        // Tapped empty space -> cancel pending connection selection
        if (connectSourceNodeIdRef.current) {
          setConnectSourceNodeId(null);
          setStatusMessage('Connect cancelled.');
        }
      }
      return;
    }

    // === MODE: SOURCE SELECTION ===
    if (mode === 'source') {
      if (hitNodeId) {
        setSourceNode(hitNodeId);
        setActiveModeState('select');
      } else {
        setStatusMessage('Tap a placed device to set as Source.');
      }
      return;
    }

    // === MODE: DESTINATION SELECTION ===
    if (mode === 'destination') {
      if (hitNodeId) {
        setDestinationNode(hitNodeId);
        setActiveModeState('select');
      } else {
        setStatusMessage('Tap a placed device to set as Destination.');
      }
      return;
    }

    // === MODE: PLACE DEVICE ===
    if (mode === 'place') {
      if (hitNodeId) {
        // Tapped an existing device -> select it
        deviceManager.setSelected(hitNodeId);
        setSelectedNodeId(hitNodeId);
        const found = graph.getNode(hitNodeId);
        setStatusMessage(`${found?.label || 'Device'} selected.`);
        return;
      }

      // Tapped surface -> place new device
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

        // Add to graph and state
        graph.addNode(newNode);
        setNodes(graph.getNodes());
        setStatusMessage(`${label} placed.`);
      }
      return;
    }

    // === MODE: SELECT / DEFAULT ===
    if (hitNodeId) {
      deviceManager.setSelected(hitNodeId);
      setSelectedNodeId(hitNodeId);
      setSelectedEdgeId(null);
      const found = graph.getNode(hitNodeId);
      setStatusMessage(`${found?.label || 'Device'} selected.`);
      return;
    }

    // Tapped empty space -> Deselect
    if (selectedNodeIdRef.current) {
      deviceManager.clearSelection();
      setSelectedNodeId(null);
      setStatusMessage('Device deselected.');
    }
  }, [createConnection, setSourceNode, setDestinationNode]);
  onTapRef.current = onTap;

  // ---- Send Virtual Packet ----
  const sendPacket = useCallback(() => {
    const graph = graphRef.current;
    const srcId = sourceNodeIdRef.current;
    const dstId = destinationNodeIdRef.current;
    const activeRoute = routeRef.current;
    const sim = packetSimulatorRef.current;

    if (!srcId) {
      setStatusMessage('No source device selected. Set a Source device first.');
      return false;
    }
    if (!dstId) {
      setStatusMessage('No destination device selected. Set a Destination device first.');
      return false;
    }
    if (!activeRoute || !activeRoute.reachable || activeRoute.path.length < 2) {
      setStatusMessage('Calculate a valid route before sending a packet.');
      return false;
    }
    if (sim?.isRunning()) {
      setStatusMessage('Packet simulation is already running.');
      return false;
    }

    const arManager = arManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const posLookup = (id) => deviceManager?.getNodePosition(id) || graph.getNode(id)?.position;

    const sourcePos = posLookup(srcId);
    if (!sourcePos) {
      setStatusMessage('Could not locate 3D position of source device.');
      return false;
    }

    // Initialize 3D packet mesh in Three.js scene
    if (packetMeshRef.current && arManager?.scene) {
      packetMeshRef.current.init(arManager.scene, sourcePos);
    }

    lastFrameTimeRef.current = performance.now();
    const success = sim.start(activeRoute, graph, posLookup);

    // If running outside WebXR presenting session (e.g. desktop preview), drive via requestAnimationFrame
    if (success && (!arManager?.session || !arManager.renderer?.xr?.isPresenting)) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      const animLoop = (now) => {
        if (!sim.isRunning()) return;
        const dt = lastFrameTimeRef.current ? Math.max(0, (now - lastFrameTimeRef.current) / 1000) : 0.016;
        lastFrameTimeRef.current = now;

        const res = sim.update(dt, graphRef.current, posLookup);
        if (packetMeshRef.current && arManager?.scene) {
          packetMeshRef.current.setPosition(res.position.x, res.position.y, res.position.z);
          packetMeshRef.current.animate(now * 0.001);
        }

        if (!res.isFinished) {
          animFrameIdRef.current = requestAnimationFrame(animLoop);
        }
      };
      animFrameIdRef.current = requestAnimationFrame(animLoop);
    }

    return success;
  }, []);

  // ---- Stop Virtual Packet ----
  const stopPacket = useCallback(() => {
    const sim = packetSimulatorRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const packetMesh = packetMeshRef.current;

    if (sim) {
      sim.stop();
    }
    if (packetMesh && arManager?.scene) {
      packetMesh.dispose(arManager.scene);
    }
    if (connectionManager && arManager?.scene) {
      connectionManager.clearActivePacketEdge(arManager.scene);
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    setSimulationStatus(SIMULATION_STATUS.STOPPED);
    setStatusMessage('Packet simulation stopped.');
  }, []);

  // ---- Reset Packet ----
  const resetPacket = useCallback(() => {
    const sim = packetSimulatorRef.current;
    const arManager = arManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const packetMesh = packetMeshRef.current;

    if (sim) {
      sim.stop();
      sim.reset(Boolean(routeRef.current?.reachable));
    }
    if (packetMesh && arManager?.scene) {
      packetMesh.dispose(arManager.scene);
    }
    if (connectionManager && arManager?.scene) {
      connectionManager.clearActivePacketEdge(arManager.scene);
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    setSimulationStatus(routeRef.current?.reachable ? SIMULATION_STATUS.READY : SIMULATION_STATUS.IDLE);
    setPacketInfo({
      packetId: null,
      currentNodeId: null,
      nextNodeId: null,
      currentEdgeId: null,
      progress: 0,
      elapsedTime: 0,
      hops: 0,
    });
  }, []);

  // ---- Reset Network (clears devices & connections only, keeps workspace anchor & AR session) ----
  const resetNetwork = useCallback(() => {
    const arManager = arManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const graph = graphRef.current;
    const sim = packetSimulatorRef.current;
    const packetMesh = packetMeshRef.current;

    if (sim) {
      sim.stop();
      sim.reset(false);
    }
    if (packetMesh && arManager?.scene) {
      packetMesh.dispose(arManager.scene);
    }
    if (connectionManager && arManager?.scene) {
      connectionManager.clearActivePacketEdge(arManager.scene);
      connectionManager.removeAll(arManager.scene);
    }
    if (deviceManager && arManager?.scene) {
      deviceManager.removeAll(arManager.scene);
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    graph.clear();

    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSourceNodeId(null);
    setDestinationNodeId(null);
    setConnectSourceNodeId(null);
    setRoute(null);
    setSimulationStatus(SIMULATION_STATUS.IDLE);
    setPacketInfo({
      packetId: null,
      currentNodeId: null,
      nextNodeId: null,
      currentEdgeId: null,
      progress: 0,
      elapsedTime: 0,
      hops: 0,
    });
    setActiveModeState('place');

    nodeCountersRef.current = {
      PC: 0,
      SWITCH: 0,
      ROUTER: 0,
      SERVER: 0,
    };

    setStatusMessage('Network cleared. Workspace anchor preserved.');
  }, []);

  // ---- Reset Placement (clears anchor, devices, connections, restarts surface scan) ----
  const resetPlacement = useCallback(() => {
    const arManager = arManagerRef.current;
    const placementManager = placementManagerRef.current;
    const deviceManager = deviceManagerRef.current;
    const connectionManager = connectionManagerRef.current;
    const reticleManager = reticleManagerRef.current;
    const graph = graphRef.current;
    const sim = packetSimulatorRef.current;
    const packetMesh = packetMeshRef.current;

    if (sim) {
      sim.stop();
      sim.reset(false);
    }
    if (packetMesh && arManager?.scene) {
      packetMesh.dispose(arManager.scene);
    }
    if (connectionManager && arManager?.scene) {
      connectionManager.clearActivePacketEdge(arManager.scene);
      connectionManager.removeAll(arManager.scene);
    }
    if (deviceManager && arManager?.scene) {
      deviceManager.removeAll(arManager.scene);
    }
    if (placementManager && arManager?.scene) {
      placementManager.reset(arManager.scene);
    }
    if (reticleManager) {
      reticleManager.show();
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    graph.clear();

    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSourceNodeId(null);
    setDestinationNodeId(null);
    setConnectSourceNodeId(null);
    setRoute(null);
    setSimulationStatus(SIMULATION_STATUS.IDLE);
    setPacketInfo({
      packetId: null,
      currentNodeId: null,
      nextNodeId: null,
      currentEdgeId: null,
      progress: 0,
      elapsedTime: 0,
      hops: 0,
    });
    setActiveModeState('place');

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

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const arManager = arManagerRef.current;

    if (packetSimulatorRef.current) {
      packetSimulatorRef.current.stop();
      packetSimulatorRef.current.reset(false);
    }
    if (packetMeshRef.current) {
      packetMeshRef.current.dispose(arManager?.scene);
    }
    if (connectionManagerRef.current) {
      connectionManagerRef.current.dispose(arManager?.scene);
      connectionManagerRef.current = null;
    }
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
    graphRef.current.clear();
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
    // Network Device & Topology State
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    selectedDeviceType,
    // Interaction Modes & Routing
    activeMode,
    connectSourceNodeId,
    sourceNodeId,
    destinationNodeId,
    route,
    // Virtual Packet Simulation
    simulationStatus,
    packetInfo,
    sendPacket,
    stopPacket,
    resetPacket,
    // Actions
    startAR,
    endAR,
    onTap,
    setActiveMode,
    selectDeviceType,
    selectNode,
    selectEdge,
    deleteNode,
    deleteSelectedNode,
    createConnection,
    deleteConnection,
    setSourceNode,
    setDestinationNode,
    recalculateRoute,
    resetNetwork,
    resetPlacement,
  };

  return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
}

