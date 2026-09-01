import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  MonitorOff,
  Maximize,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import StatusIndicator from '../components/common/StatusIndicator';
import NetworkToolbar from '../components/network/NetworkToolbar';
import NodeTypeSelector from '../components/network/NodeTypeSelector';
import NetworkControls from '../components/network/NetworkControls';
import RouteStatus from '../components/network/RouteStatus';
import NetworkLegend from '../components/network/NetworkLegend';
import './ARLabPage.css';

export default function ARLabPage() {
  return (
    <div className="arlab">
      {/* === Top Bar === */}
      <div className="arlab__topbar">
        <div className="arlab__topbar-left">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          </Link>
          <div className="arlab__topbar-title">
            <span className="arlab__topbar-name">AR Lab</span>
            <Badge variant="upcoming">Phase 1 — Foundation</Badge>
          </div>
        </div>
        <div className="arlab__topbar-right">
          <StatusIndicator status="inactive" label="AR Inactive" />
        </div>
      </div>

      {/* === Main Layout === */}
      <div className="arlab__layout">
        {/* Sidebar (desktop) */}
        <aside className="arlab__sidebar">
          <NodeTypeSelector />
          <NetworkControls />
          <RouteStatus />
          <NetworkLegend />
        </aside>

        {/* Viewport */}
        <main className="arlab__viewport">
          <div className="arlab__canvas-placeholder animate-fade-in">
            <div className="arlab__placeholder-content">
              <div className="arlab__placeholder-icon">
                <MonitorOff size={48} />
              </div>
              <h2 className="arlab__placeholder-title">AR Workspace</h2>
              <p className="arlab__placeholder-text">
                This area will display the AR camera feed and 3D network
                visualization once AR mode is implemented. The WebXR session,
                plane detection, and device placement will appear here.
              </p>
              <div className="arlab__placeholder-info">
                <div className="arlab__info-item">
                  <Smartphone size={18} />
                  <span>AR mode will be available on supported mobile devices</span>
                </div>
                <div className="arlab__info-item">
                  <Maximize size={18} />
                  <span>The viewport will use the full available screen area</span>
                </div>
              </div>
              <Badge variant="upcoming">
                AR integration planned for Phase 2
              </Badge>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="arlab__bottom-bar">
            <NetworkToolbar />
          </div>
        </main>
      </div>

      {/* Mobile Controls Panel */}
      <div className="arlab__mobile-panel">
        <details className="arlab__mobile-details">
          <summary className="arlab__mobile-summary">
            Network Controls & Info
          </summary>
          <div className="arlab__mobile-panel-content">
            <NodeTypeSelector />
            <NetworkControls />
            <RouteStatus />
            <NetworkLegend />
          </div>
        </details>
      </div>
    </div>
  );
}
