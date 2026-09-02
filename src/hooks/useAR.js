import { useContext } from 'react';
import { ARContext } from '../context/ARContext';

/**
 * Hook to consume AR state and actions.
 * @returns {{
 *   support: 'checking'|'supported'|'unsupported',
 *   session: 'idle'|'starting'|'active'|'ending'|'error',
 *   hitTest: 'unavailable'|'searching'|'ready',
 *   placement: 'none'|'placed',
 *   errorMessage: string|null,
 *   startAR: (canvas: HTMLCanvasElement) => Promise<void>,
 *   endAR: () => Promise<void>,
 *   onTap: () => void,
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
