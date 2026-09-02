import { useContext } from 'react';
import { ARContext } from '../context/ARContext';

/**
 * Hook to consume AR and Network Device state and actions.
 * @returns {{
 *   support: 'checking'|'supported'|'unsupported',
 *   session: 'idle'|'starting'|'active'|'ending'|'error',
 *   hitTest: 'unavailable'|'searching'|'ready',
 *   placement: 'none'|'placed',
 *   errorMessage: string|null,
 *   statusMessage: string|null,
 *   nodes: Array<{ id: string, type: 'PC'|'SWITCH'|'ROUTER'|'SERVER', label: string, position: {x: number, y: number, z: number}, color: string }>,
 *   selectedNodeId: string|null,
 *   selectedDeviceType: 'PC'|'SWITCH'|'ROUTER'|'SERVER',
 *   startAR: (canvas: HTMLCanvasElement) => Promise<void>,
 *   endAR: () => Promise<void>,
 *   onTap: (screenX?: number, screenY?: number) => void,
 *   selectDeviceType: (type: 'PC'|'SWITCH'|'ROUTER'|'SERVER') => void,
 *   selectNode: (nodeId: string|null) => void,
 *   deleteNode: (nodeId: string) => void,
 *   deleteSelectedNode: () => void,
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

