import {
  X,
  RotateCcw,
  Trash2,
  Monitor,
  ToggleLeft,
  Router as RouterIcon,
  Server,
  ScanLine,
  CheckCircle2,
  Crosshair,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useAR } from '../../hooks/useAR';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';

const ICON_MAP = {
  Monitor,
  ToggleLeft,
  Router: RouterIcon,
  Server,
};

/**
 * AR-mode floating overlay — status messages, device palette,
 * contextual device inspector, and controls rendered on top of the XR canvas.
 */
export default function AROverlay() {
  const {
    session,
    hitTest,
    placement,
    errorMessage,
    statusMessage,
    nodes,
    selectedNodeId,
    selectedDeviceType,
    endAR,
    selectDeviceType,
    selectNode,
    deleteSelectedNode,
    resetNetwork,
    resetPlacement,
  } = useAR();

  if (session !== 'active' && session !== 'starting') return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Derive top banner icon and text
  let statusIcon = <ScanLine size={18} />;
  let defaultText = '';

  if (session === 'starting') {
    statusIcon = <ScanLine size={18} />;
    defaultText = 'Starting AR session…';
  } else if (placement === 'none') {
    if (hitTest === 'ready') {
      statusIcon = <Crosshair size={18} />;
      defaultText = 'Surface detected — tap to place workspace';
    } else {
      statusIcon = <ScanLine size={18} />;
      defaultText = 'Move phone slowly to find a surface…';
    }
  } else {
    // Placement is placed
    if (selectedNode) {
      statusIcon = <CheckCircle2 size={18} />;
      defaultText = `${selectedNode.label} selected`;
    } else if (hitTest === 'ready') {
      statusIcon = <Crosshair size={18} />;
      defaultText = `Tap surface to place ${selectedDeviceType}`;
    } else {
      statusIcon = <ScanLine size={18} />;
      defaultText = 'Scanning surface…';
    }
  }

  const displayText = statusMessage || defaultText;

  return (
    <div
      className="fixed inset-0 z-overlay pointer-events-none flex flex-col justify-between p-[env(safe-area-inset-top,16px)_16px_env(safe-area-inset-bottom,16px)] select-none"
      aria-live="polite"
    >
      {/* Top status bar & node counter */}
      <div className="flex flex-col items-center gap-2 pt-2 pointer-events-auto">
        <div className="inline-flex items-center gap-2 py-2 px-4 bg-black/75 text-white rounded-full text-xs sm:text-sm font-medium backdrop-blur-md animate-fade-in-down shadow-lg [&_svg]:shrink-0 [&_svg]:opacity-90 max-w-[90vw] truncate">
          {statusIcon}
          <span className="truncate">{displayText}</span>
        </div>

        {placement === 'placed' && nodes.length > 0 && (
          <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-neutral-900/80 text-neutral-300 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 animate-fade-in">
            <Layers size={13} className="text-primary-400" />
            <span>{nodes.length} {nodes.length === 1 ? 'Device' : 'Devices'} Placed</span>
          </div>
        )}
      </div>

      {/* Center/Bottom Contextual Device Info Card (when a device is selected) */}
      {selectedNode && (
        <div className="mx-auto w-full max-w-sm p-4 bg-neutral-950/90 text-white rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in-up pointer-events-auto mb-2">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: selectedNode.color }}
              />
              <div>
                <h3 className="text-base font-bold tracking-tight text-white leading-tight">
                  {selectedNode.label}
                </h3>
                <span className="text-xs text-neutral-400 font-medium">
                  Type: {selectedNode.type}
                </span>
              </div>
            </div>
            <button
              className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              onClick={() => selectNode(null)}
              aria-label="Close device details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="py-2.5 text-xs text-neutral-400 flex items-center justify-between">
            <span>Position in space:</span>
            <span className="font-mono text-neutral-300 text-[11px]">
              X: {selectedNode.position?.x?.toFixed(2) ?? '0.00'} | Y: {selectedNode.position?.y?.toFixed(2) ?? '0.00'} | Z: {selectedNode.position?.z?.toFixed(2) ?? '0.00'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 active:bg-red-500 active:text-white transition-all cursor-pointer min-h-[42px] [touch-action:manipulation]"
              onClick={deleteSelectedNode}
              aria-label={`Delete ${selectedNode.label}`}
            >
              <Trash2 size={16} />
              <span>Delete Device</span>
            </button>
            <button
              className="flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-medium bg-neutral-800 text-neutral-300 active:bg-neutral-700 transition-all cursor-pointer min-h-[42px] [touch-action:manipulation]"
              onClick={() => selectNode(null)}
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Floating Network Device Palette (when workspace is placed and no device card is blocking) */}
      {placement === 'placed' && !selectedNode && (
        <div className="flex flex-col items-center gap-2 pointer-events-auto mb-2">
          <div className="flex items-center gap-1.5 p-1.5 bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl animate-fade-in-up max-w-[95vw] overflow-x-auto">
            {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
              const Icon = ICON_MAP[icon];
              const isSelected = selectedDeviceType === type;
              return (
                <button
                  key={type}
                  className={`flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-xl transition-all duration-150 cursor-pointer min-w-[64px] min-h-[54px] [touch-action:manipulation] ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/40 shadow-inner'
                      : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => selectDeviceType(type)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${label} to place`}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-transform"
                    style={{
                      backgroundColor: `${color}25`,
                      color: color,
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {Icon && <Icon size={18} />}
                  </span>
                  <span className="text-[11px] font-semibold tracking-tight">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom controls bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-3 pointer-events-auto">
        {/* Reset Network (clears devices only) */}
        {placement === 'placed' && nodes.length > 0 && (
          <button
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-semibold border border-amber-500/40 bg-amber-500/20 text-amber-200 active:bg-amber-500 active:text-white cursor-pointer backdrop-blur-md transition-all min-h-[44px] [touch-action:manipulation]"
            onClick={resetNetwork}
            aria-label="Reset all network devices"
            title="Remove all network devices while keeping the AR anchor"
          >
            <RotateCcw size={16} />
            <span>Reset Network</span>
          </button>
        )}

        {/* Reset Workspace Anchor */}
        {placement === 'placed' && (
          <button
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-semibold border border-white/25 bg-white/15 text-white active:bg-white/30 cursor-pointer backdrop-blur-md transition-all min-h-[44px] [touch-action:manipulation]"
            onClick={resetPlacement}
            aria-label="Reset AR workspace anchor"
            title="Reset workspace position and re-scan surfaces"
          >
            <RotateCcw size={16} />
            <span>Reset Workspace</span>
          </button>
        )}

        {/* Exit AR */}
        <button
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-semibold bg-red-500/85 text-white active:bg-red-600 cursor-pointer backdrop-blur-md transition-all min-h-[44px] [touch-action:manipulation]"
          onClick={endAR}
          aria-label="Exit AR mode"
        >
          <X size={16} />
          <span>Exit AR</span>
        </button>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex items-center gap-2 py-3 px-4 bg-red-500/90 text-white rounded-xl text-sm max-w-[90vw] text-center backdrop-blur-md animate-fade-in-up pointer-events-auto shadow-2xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
