import { Route, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAR } from '../../hooks/useAR';

/**
 * Route calculation status panel.
 * Phase 4: Displays real-time Dijkstra shortest path calculation results.
 */
export default function RouteStatus() {
  const { nodes, sourceNodeId, destinationNodeId, route } = useAR();

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const destNode = nodes.find((n) => n.id === destinationNodeId);

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
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-1 px-2.5 rounded-lg w-fit">
            <CheckCircle2 size={14} />
            <span>Optimal Route Found</span>
          </div>

          {/* Path Chain */}
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700">
            {route.path.map((nodeId, idx) => {
              const node = nodes.find((n) => n.id === nodeId);
              const isFirst = idx === 0;
              const isLast = idx === route.path.length - 1;
              return (
                <div key={nodeId} className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold py-0.5 px-2 rounded ${
                      isFirst
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
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{hopCount} {hopCount === 1 ? 'Hop' : 'Hops'}</span>
            </div>
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Total Cost / Dist</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{route.totalWeight.toFixed(2)} m</span>
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
          <span className="text-sm font-bold">Route Status</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 py-0.5 px-2 rounded-full">
          Dijkstra Engine
        </span>
      </div>

      {renderRouteContent()}

      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3 italic border-t border-neutral-100 dark:border-neutral-800 pt-2">
        Edge weights computed from 3D Euclidean distances.
      </p>
    </div>
  );
}
