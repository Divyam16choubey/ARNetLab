import { Route } from 'lucide-react';

/**
 * Route calculation status panel.
 * Phase 3: indicates device placement is active; routing is planned for Phase 4.
 */
export default function RouteStatus() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50 mb-2">
        <Route size={16} />
        <span className="text-sm font-semibold">Route Status</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        No route calculated. Place devices in AR mode. Graph connections and shortest-path routing will be introduced in Phase 4.
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 italic">
        Routing algorithm: Dijkstra (coming in Phase 4)
      </p>
    </div>
  );
}
