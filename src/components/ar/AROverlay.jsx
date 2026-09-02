import {
  X,
  RotateCcw,
  ScanLine,
  CheckCircle2,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { useAR } from '../../hooks/useAR';
import './AROverlay.css';

/**
 * AR-mode floating overlay — status messages and controls rendered
 * on top of the XR canvas. Touch-friendly, positioned at safe edges.
 */
export default function AROverlay() {
  const { session, hitTest, placement, errorMessage, endAR, resetPlacement } =
    useAR();

  if (session !== 'active' && session !== 'starting') return null;

  // Determine status message
  let statusIcon = null;
  let statusText = '';

  if (session === 'starting') {
    statusIcon = <ScanLine size={18} />;
    statusText = 'Starting AR session…';
  } else if (placement === 'placed') {
    statusIcon = <CheckCircle2 size={18} />;
    statusText = 'Workspace placed';
  } else if (hitTest === 'ready') {
    statusIcon = <Crosshair size={18} />;
    statusText = 'Surface detected — tap to place';
  } else if (hitTest === 'searching') {
    statusIcon = <ScanLine size={18} />;
    statusText = 'Move your phone slowly to find a surface…';
  } else {
    statusIcon = <ScanLine size={18} />;
    statusText = 'Initializing surface detection…';
  }

  return (
    <div className="ar-overlay" aria-live="polite">
      {/* Top status bar */}
      <div className="ar-overlay__top">
        <div className="ar-overlay__status">
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="ar-overlay__bottom">
        {placement === 'placed' && (
          <button
            className="ar-overlay__btn ar-overlay__btn--secondary"
            onClick={resetPlacement}
            aria-label="Reset workspace placement"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
        )}

        <button
          className="ar-overlay__btn ar-overlay__btn--exit"
          onClick={endAR}
          aria-label="Exit AR mode"
        >
          <X size={20} />
          <span>Exit AR</span>
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="ar-overlay__error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
