import { Route } from 'lucide-react';

/**
 * Route calculation status panel.
 * Phase 1: static placeholder showing no route is active.
 */
export default function RouteStatus() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50 mb-2">
        <Route size={16} />
        <span className="text-sm font-semibold">Route Status</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        No route calculated. Build a network and select source/destination
        nodes to calculate routing.
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 italic">
        Routing will be available in a future update.
      </p>
    </div>
  );
}
