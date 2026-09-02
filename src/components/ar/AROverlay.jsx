import {
  X,
  RotateCcw,
  ScanLine,
  CheckCircle2,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import { useAR } from '../../hooks/useAR';

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
    <div
      className="fixed inset-0 z-overlay pointer-events-none flex flex-col justify-between p-[env(safe-area-inset-top,16px)_16px_env(safe-area-inset-bottom,16px)]"
      aria-live="polite"
    >
      {/* Top status bar */}
      <div className="flex justify-center pt-3 pointer-events-auto">
        <div className="inline-flex items-center gap-2 py-2 px-4 bg-black/65 text-white rounded-full text-sm font-medium backdrop-blur-md animate-fade-in-down [&_svg]:shrink-0 [&_svg]:opacity-85">
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center gap-3 pb-4 pointer-events-auto">
        {placement === 'placed' && (
          <button
            className="flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold border border-white/30 bg-white/20 text-white active:bg-white/35 cursor-pointer backdrop-blur-md transition-all duration-150 min-h-[48px] [touch-action:manipulation]"
            onClick={resetPlacement}
            aria-label="Reset workspace placement"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
        )}

        <button
          className="flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold bg-red-500/85 text-white active:bg-red-500 cursor-pointer backdrop-blur-md transition-all duration-150 min-h-[48px] [touch-action:manipulation]"
          onClick={endAR}
          aria-label="Exit AR mode"
        >
          <X size={20} />
          <span>Exit AR</span>
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex items-center gap-2 py-3 px-4 bg-red-500/90 text-white rounded-xl text-sm max-w-[90vw] text-center backdrop-blur-md animate-fade-in-up pointer-events-auto">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
