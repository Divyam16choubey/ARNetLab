import {
  Route,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Square,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useAR } from '../../hooks/useAR';

/**
 * Route calculation & virtual packet simulation panel.
 * Phase 4: Displays real-time Dijkstra shortest path calculation results.
 * Phase 5: Virtual packet dispatch, edge-by-edge traversal status, and simulation timing.
 */
export default function RouteStatus() {
  const {
    nodes,
    sourceNodeId,
    destinationNodeId,
    route,
    simulationStatus,
    packetInfo,
    sendPacket,
    stopPacket,
    resetPacket,
  } = useAR();

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const destNode = nodes.find((n) => n.id === destinationNodeId);

  const isRouteReady = Boolean(route && route.reachable && route.path.length >= 2);
  const isRunning = simulationStatus === 'RUNNING';
  const isCompleted = simulationStatus === 'COMPLETED';

  function renderRouteContent() {
    if (!sourceNode && !destNode) {
      return (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Select a <span className="font-semibold text-emerald-600 dark:text-emerald-400">Source</span> and{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">Destination</span> device to compute the shortest path.
        </p>
      );
    }

    if (!sourceNode) {
      return (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Destination is <span className="font-semibold text-rose-600 dark:text-rose-400">{destNode.label}</span>. Select a Source device to calculate route.
        </p>
      );
    }

    if (!destNode) {
      return (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Source is <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sourceNode.label}</span>. Select a Destination device to calculate route.
        </p>
      );
    }

    if (route && route.reachable) {
      const hopCount = route.path.length - 1;
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-1 px-2.5 rounded-lg w-fit">
              <CheckCircle2 size={14} />
              <span>Optimal Route Found</span>
            </div>
            {/* Simulation Status Badge */}
            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 py-0.5 px-2 rounded-full animate-pulse border border-amber-500/30">
                <Zap size={12} />
                <span>In Transit</span>
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-0.5 px-2 rounded-full border border-emerald-500/30">
                <CheckCircle2 size={12} />
                <span>Delivered</span>
              </span>
            )}
          </div>

          {/* Path Chain */}
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700">
            {route.path.map((nodeId, idx) => {
              const node = nodes.find((n) => n.id === nodeId);
              const isFirst = idx === 0;
              const isLast = idx === route.path.length - 1;
              const isCurrentPacketNode = isRunning && packetInfo.currentNodeId === nodeId;

              return (
                <div key={nodeId} className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold py-0.5 px-2 rounded transition-all ${
                      isCurrentPacketNode
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400 animate-pulse'
                        : isFirst
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isLast
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {node?.label || nodeId}
                  </span>
                  {!isLast && <ArrowRight size={12} className="text-neutral-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Hop Count</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                {hopCount} {hopCount === 1 ? 'Hop' : 'Hops'}
              </span>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Route Distance</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                {route.totalWeight.toFixed(2)} m
              </span>
            </div>
          </div>

          {/* Virtual Packet Simulation Controls (Phase 5) */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Zap size={14} className="text-amber-500" />
                <span>Virtual Packet Simulation</span>
              </span>
              {packetInfo.elapsedTime > 0 && (
                <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
                  Simulation Time: {packetInfo.elapsedTime.toFixed(1)}s
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isRouteReady
                      ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-98'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-200 dark:border-neutral-700'
                  }`}
                  onClick={sendPacket}
                  disabled={!isRouteReady}
                  aria-label="Send Virtual Packet along shortest route"
                >
                  <Send size={14} />
                  <span>{isCompleted ? 'Send Again' : 'Send Packet'}</span>
                </button>
              ) : (
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-all shadow-sm active:scale-98 animate-pulse"
                  onClick={stopPacket}
                  aria-label="Stop Packet Simulation"
                >
                  <Square size={14} />
                  <span>Stop Packet</span>
                </button>
              )}

              {isCompleted && (
                <button
                  className="p-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                  onClick={resetPacket}
                  title="Reset Simulation"
                  aria-label="Reset Simulation"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (route && !route.reachable) {
      return (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
            <AlertTriangle size={15} />
            <span>Unreachable Destination</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No path exists between <span className="font-semibold text-neutral-900 dark:text-neutral-100">{sourceNode.label}</span> and <span className="font-semibold text-neutral-900 dark:text-neutral-100">{destNode.label}</span>. Use Connect Nodes to create links.
          </p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm">
      <div className="flex items-center justify-between gap-2 text-neutral-900 dark:text-neutral-50 mb-3">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-primary-500" />
          <span className="text-sm font-bold">Route &amp; Simulation</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 py-0.5 px-2 rounded-full border border-amber-500/20">
          Phase 5
        </span>
      </div>

      {renderRouteContent()}

      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3 italic border-t border-neutral-100 dark:border-neutral-800 pt-2">
        Constant-speed time-based 3D packet simulation.
      </p>
    </div>
  );
}
