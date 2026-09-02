import { Link2, Circle, Target, X, Send, Square, Zap } from 'lucide-react';
import { useAR } from '../../hooks/useAR';

/**
 * Side panel controls for network operations.
 * Phase 4: Interactive connection, source, and destination selection.
 * Phase 5: Virtual packet dispatch and traversal control.
 */
export default function NetworkControls() {
  const {
    nodes,
    activeMode,
    setActiveMode,
    sourceNodeId,
    destinationNodeId,
    route,
    simulationStatus,
    packetInfo,
    sendPacket,
    stopPacket,
    setSourceNode,
    setDestinationNode,
  } = useAR();

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const destNode = nodes.find((n) => n.id === destinationNodeId);
  const hasNodes = nodes.length >= 2;
  const isRouteReady = Boolean(route && route.reachable && route.path.length >= 2);
  const isRunning = simulationStatus === 'RUNNING';

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Network Controls (Phase 4)
      </p>
      <div className="flex flex-col gap-2">
        {/* Connect Nodes */}
        <button
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 min-h-[52px] ${
            activeMode === 'connect'
              ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15 ring-2 ring-primary-500/30'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
          } ${hasNodes ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => setActiveMode(activeMode === 'connect' ? 'select' : 'connect')}
          disabled={!hasNodes}
          title={hasNodes ? 'Toggle connection mode' : 'Place at least 2 devices to connect'}
          aria-label="Connect Nodes"
          aria-pressed={activeMode === 'connect'}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                activeMode === 'connect'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Link2 size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Connect Nodes
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeMode === 'connect' ? 'Active — tap two devices' : 'Create links between devices'}
              </span>
            </div>
          </div>
          {activeMode === 'connect' && (
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          )}
        </button>

        {/* Select Source */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 min-h-[52px] ${
            activeMode === 'source'
              ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-2 ring-emerald-500/30'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}
        >
          <button
            className="flex-1 flex items-center gap-3 cursor-pointer text-left"
            onClick={() => setActiveMode(activeMode === 'source' ? 'select' : 'source')}
            disabled={nodes.length === 0}
            title="Set Source Device for routing"
            aria-label="Set Source Node"
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                sourceNode
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Circle size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                <span>Select Source</span>
                {sourceNode && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-0.5 px-1.5 rounded">
                    {sourceNode.label}
                  </span>
                )}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeMode === 'source' ? 'Tap a device to set Source' : 'Starting node for route'}
              </span>
            </div>
          </button>
          {sourceNode && (
            <button
              className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
              onClick={() => setSourceNode(null)}
              title="Clear Source"
              aria-label="Clear Source"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Select Destination */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 min-h-[52px] ${
            activeMode === 'destination'
              ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/15 ring-2 ring-rose-500/30'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
          }`}
        >
          <button
            className="flex-1 flex items-center gap-3 cursor-pointer text-left"
            onClick={() => setActiveMode(activeMode === 'destination' ? 'select' : 'destination')}
            disabled={nodes.length === 0}
            title="Set Destination Device for routing"
            aria-label="Set Destination Node"
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                destNode
                  ? 'bg-rose-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Target size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                <span>Select Destination</span>
                {destNode && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 py-0.5 px-1.5 rounded">
                    {destNode.label}
                  </span>
                )}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeMode === 'destination' ? 'Tap a device to set Destination' : 'Target node for route'}
              </span>
            </div>
          </button>
          {destNode && (
            <button
              className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
              onClick={() => setDestinationNode(null)}
              title="Clear Destination"
              aria-label="Clear Destination"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Phase 5: Virtual Packet Simulation Trigger */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-500" />
            <span>Virtual Packet Simulation (Phase 5)</span>
          </p>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isRouteReady
                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-98'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-200 dark:border-neutral-700'
                }`}
                onClick={sendPacket}
                disabled={!isRouteReady}
                aria-label="Send Virtual Packet"
              >
                <Send size={14} />
                <span>{simulationStatus === 'COMPLETED' ? 'Send Again' : 'Send Virtual Packet'}</span>
              </button>
            ) : (
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-all shadow-sm active:scale-98 animate-pulse"
                onClick={stopPacket}
                aria-label="Stop Packet Simulation"
              >
                <Square size={14} />
                <span>Stop Packet ({packetInfo.elapsedTime.toFixed(1)}s)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
