import { useContext } from 'react';
import { ARContext } from '../context/ARContext';

/**
 * Hook to consume AR, Network Topology, and Routing state and actions.
 * @returns {{
 *   support: 'checking'|'supported'|'unsupported',
 *   session: 'idle'|'starting'|'active'|'ending'|'error',
 *   hitTest: 'unavailable'|'searching'|'ready',
 *   placement: 'none'|'placed',
 *   errorMessage: string|null,
 *   statusMessage: string|null,
 *   nodes: Array<{ id: string, type: 'PC'|'SWITCH'|'ROUTER'|'SERVER', label: string, position: {x: number, y: number, z: number}, color: string }>,
 *   edges: Array<{ id: string, source: string, target: string, weight: number }>,
 *   selectedNodeId: string|null,
 *   selectedEdgeId: string|null,
 *   selectedDeviceType: 'PC'|'SWITCH'|'ROUTER'|'SERVER',
 *   activeMode: 'place'|'select'|'connect'|'source'|'destination',
 *   connectSourceNodeId: string|null,
 *   sourceNodeId: string|null,
 *   destinationNodeId: string|null,
 *   route: { reachable: boolean, path: string[], edgeIds: string[], totalWeight: number }|null,
 *   simulationStatus: 'IDLE'|'READY'|'RUNNING'|'PAUSED'|'COMPLETED'|'STOPPED'|'ERROR',
 *   packetInfo: { packetId: string|null, currentNodeId: string|null, nextNodeId: string|null, currentEdgeId: string|null, progress: number, elapsedTime: number, hops: number },
 *   sendPacket: () => boolean,
 *   stopPacket: () => void,
 *   resetPacket: () => void,
 *   startAR: (canvas: HTMLCanvasElement) => Promise<void>,
 *   endAR: () => Promise<void>,
 *   onTap: (screenX?: number, screenY?: number) => void,
 *   setActiveMode: (mode: 'place'|'select'|'connect'|'source'|'destination') => void,
 *   selectDeviceType: (type: 'PC'|'SWITCH'|'ROUTER'|'SERVER') => void,
 *   selectNode: (nodeId: string|null) => void,
 *   selectEdge: (edgeId: string|null) => void,
 *   deleteNode: (nodeId: string) => void,
 *   deleteSelectedNode: () => void,
 *   createConnection: (sourceId: string, targetId: string) => any,
 *   deleteConnection: (edgeId: string) => void,
 *   setSourceNode: (nodeId: string|null) => void,
 *   setDestinationNode: (nodeId: string|null) => void,
 *   recalculateRoute: () => void,
 *   resetNetwork: () => void,
 *   resetPlacement: () => void,
 * }}
 */
export function useAR() {
  const context = useContext(ARContext);
  if (!context) {
    throw new Error('useAR must be used within an ARProvider');
  }
  return context;
}


