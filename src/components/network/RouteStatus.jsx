import { Route } from 'lucide-react';
import './RouteStatus.css';

/**
 * Route calculation status panel.
 * Phase 1: static placeholder showing no route is active.
 */
export default function RouteStatus() {
  return (
    <div className="route-status">
      <div className="route-status__header">
        <Route size={16} />
        <span className="route-status__title">Route Status</span>
      </div>
      <p className="route-status__message">
        No route calculated. Build a network and select source/destination
        nodes to calculate routing.
      </p>
      <p className="route-status__note">
        Routing will be available in a future update.
      </p>
    </div>
  );
}
