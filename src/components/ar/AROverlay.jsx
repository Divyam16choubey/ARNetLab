import { useEffect } from 'react';
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
  Link2,
  Circle,
  Target,
  Route,
  Plus,
  Send,
  Square,
  Zap,
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
 * AR-mode floating overlay — status messages, mode selector, device palette,
 * contextual inspector, connection assistant, route HUD, and packet simulation controls.
 */
export default function AROverlay() {
  const {
    session,
    hitTest,
    placement,
    errorMessage,
    statusMessage,
    nodes,
    edges,
    selectedNodeId,
    selectedDeviceType,
    activeMode,
    connectSourceNodeId,
    sourceNodeId,
    destinationNodeId,
    route,
    simulationStatus,
    packetInfo,
    sendPacket,
    stopPacket,
    endAR,
    setActiveMode,
    selectDeviceType,
    selectNode,
    deleteSelectedNode,
    setSourceNode,
    setDestinationNode,
    resetNetwork,
    resetPlacement,
  } = useAR();

  // Prevent UI clicks in DOM overlay from triggering accidental WebXR 3D scene placement
  useEffect(() => {
    const handleBeforeXRSelect = (e) => {
      if (e.target.closest('button, a, input, [role="button"], [data-overlay-control]')) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforexrselect', handleBeforeXRSelect);
    return () => {
      window.removeEventListener('beforexrselect', handleBeforeXRSelect);
    };
  }, []);

  if (session !== 'active' && session !== 'starting') return null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const connectSourceNode = nodes.find((n) => n.id === connectSourceNodeId);

  const isRunning = simulationStatus === 'RUNNING';

  // Derive top banner icon and text
  let statusIcon = <ScanLine size={18} />;
  let defaultText = '';

  if (isRunning) {
    statusIcon = <Zap size={18} className="text-amber-400 animate-pulse" />;
    defaultText = statusMessage || 'Packet in transit…';
  } else if (session === 'starting') {
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
    if (activeMode === 'connect') {
      statusIcon = <Link2 size={18} className="text-primary-400 animate-pulse" />;
      defaultText = connectSourceNode
        ? `Tap 2nd device to link with ${connectSourceNode.label}`
        : 'Connect: Tap 1st device to link';
    } else if (activeMode === 'source') {
      statusIcon = <Circle size={18} className="text-emerald-400" />;
      defaultText = 'Source Mode: Tap a device to set as Source';
    } else if (activeMode === 'destination') {
      statusIcon = <Target size={18} className="text-rose-400" />;
      defaultText = 'Destination Mode: Tap a device to set as Destination';
    } else if (selectedNode) {
      statusIcon = <CheckCircle2 size={18} className="text-sky-400" />;
      defaultText = `${selectedNode.label} selected`;
    } else if (hitTest === 'ready' && activeMode === 'place') {
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
      {/* Top Section: Status Bar & Badges */}
      <div className="flex flex-col items-center gap-2 pt-2 pointer-events-auto">
        {/* Main Status Pill */}
        <div className="inline-flex items-center gap-2 py-2 px-4 bg-black/80 text-white rounded-full text-xs sm:text-sm font-medium backdrop-blur-md animate-fade-in-down shadow-lg [&_svg]:shrink-0 max-w-[92vw] truncate border border-white/10">
          {statusIcon}
          <span className="truncate">{displayText}</span>
        </div>

        {/* Counter & Topology Pill */}
        {placement === 'placed' && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-neutral-900/80 text-neutral-300 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 animate-fade-in">
              <Layers size={13} className="text-primary-400" />
              <span>{nodes.length} {nodes.length === 1 ? 'Device' : 'Devices'}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-sky-400">{edges.length} {edges.length === 1 ? 'Link' : 'Links'}</span>
            </div>

            {route && route.reachable && (
              <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-950/80 text-emerald-300 rounded-full text-xs font-bold backdrop-blur-md border border-emerald-500/30 animate-fade-in">
                <Route size={13} className="text-emerald-400" />
                <span>Route: {route.totalWeight.toFixed(2)}m ({route.path.length - 1} hops)</span>
              </div>
            )}

            {/* Virtual Packet Dispatch / Stop Controls in AR HUD */}
            {route && route.reachable && !isRunning && (
              <button
                className="inline-flex items-center gap-1.5 py-1 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full text-xs font-bold backdrop-blur-md border border-amber-300/40 shadow-lg cursor-pointer transition-all [touch-action:manipulation] animate-fade-in"
                onClick={sendPacket}
                aria-label="Send Packet in AR"
              >
                <Send size={13} />
                <span>{simulationStatus === 'COMPLETED' ? 'Send Again' : 'Send Packet'}</span>
              </button>
            )}

            {isRunning && (
              <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-amber-950/90 text-amber-300 rounded-full text-xs font-bold backdrop-blur-md border border-amber-500/50 shadow-lg animate-fade-in">
                <Zap size={13} className="text-amber-400 animate-pulse" />
                <span>{packetInfo.elapsedTime.toFixed(1)}s</span>
                <button
                  onClick={stopPacket}
                  className="ml-1 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer active:scale-95"
                  title="Stop Packet Simulation"
                  aria-label="Stop Packet Simulation"
                >
                  <Square size={11} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interaction Mode Switcher */}
        {placement === 'placed' && (
          <div className="flex items-center gap-1 p-1 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl mt-1">
            <button
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer [touch-action:manipulation] ${
                activeMode === 'place'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveMode('place')}
              aria-label="Place Device Mode"
            >
              <Plus size={14} />
              <span>Place</span>
            </button>

            <button
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer [touch-action:manipulation] ${
                activeMode === 'connect'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveMode(activeMode === 'connect' ? 'select' : 'connect')}
              aria-label="Connect Mode"
            >
              <Link2 size={14} />
              <span>Connect</span>
            </button>

            <button
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer [touch-action:manipulation] ${
                activeMode === 'source'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveMode(activeMode === 'source' ? 'select' : 'source')}
              aria-label="Source Mode"
            >
              <Circle size={14} />
              <span>Source</span>
            </button>

            <button
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer [touch-action:manipulation] ${
                activeMode === 'destination'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveMode(activeMode === 'destination' ? 'select' : 'destination')}
              aria-label="Destination Mode"
            >
              <Target size={14} />
              <span>Dest</span>
            </button>
          </div>
        )}
      </div>

      {/* Contextual Device Inspector Card (when device selected) */}
      {selectedNode && (
        <div className="mx-auto w-full max-w-sm p-4 bg-neutral-950/92 text-white rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in-up pointer-events-auto mb-2 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: selectedNode.color }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-white leading-tight">
                    {selectedNode.label}
                  </h3>
                  {sourceNodeId === selectedNode.id && (
                    <span className="text-[10px] uppercase font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                      Source
                    </span>
                  )}
                  {destinationNodeId === selectedNode.id && (
                    <span className="text-[10px] uppercase font-extrabold bg-rose-500 text-white px-1.5 py-0.5 rounded">
                      Dest
                    </span>
                  )}
                </div>
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

          {/* Quick Routing & Connection Assignment Actions */}
          <div className="grid grid-cols-2 gap-2 py-3 border-b border-neutral-800/80">
            <button
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer [touch-action:manipulation] ${
                sourceNodeId === selectedNode.id
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 active:bg-emerald-500 active:text-white'
              }`}
              onClick={() => setSourceNode(sourceNodeId === selectedNode.id ? null : selectedNode.id)}
            >
              <Circle size={14} />
              <span>{sourceNodeId === selectedNode.id ? 'Unset Source' : 'Set as Source'}</span>
            </button>

            <button
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer [touch-action:manipulation] ${
                destinationNodeId === selectedNode.id
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30 active:bg-rose-500 active:text-white'
              }`}
              onClick={() => setDestinationNode(destinationNodeId === selectedNode.id ? null : selectedNode.id)}
            >
              <Target size={14} />
              <span>{destinationNodeId === selectedNode.id ? 'Unset Dest' : 'Set as Dest'}</span>
            </button>
          </div>

          <div className="py-2.5 text-xs text-neutral-400 flex items-center justify-between">
            <span>Position:</span>
            <span className="font-mono text-neutral-300 text-[11px]">
              X: {selectedNode.position?.x?.toFixed(2) ?? '0.00'} | Y: {selectedNode.position?.y?.toFixed(2) ?? '0.00'} | Z: {selectedNode.position?.z?.toFixed(2) ?? '0.00'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
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

      {/* Floating Device Palette (when in place mode and no device card open) */}
      {placement === 'placed' && activeMode === 'place' && !selectedNode && (
        <div className="flex flex-col items-center gap-2 pointer-events-auto mb-2">
          <div className="flex items-center gap-1.5 p-1.5 bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl animate-fade-in-up max-w-[95vw] overflow-x-auto">
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
        {/* Reset Network (clears devices & connections only) */}
        {placement === 'placed' && nodes.length > 0 && (
          <button
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-semibold border border-amber-500/40 bg-amber-500/20 text-amber-200 active:bg-amber-500 active:text-white cursor-pointer backdrop-blur-md transition-all min-h-[44px] [touch-action:manipulation]"
            onClick={resetNetwork}
            aria-label="Reset network devices and connections"
            title="Remove all network devices and connections while keeping the AR anchor"
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

