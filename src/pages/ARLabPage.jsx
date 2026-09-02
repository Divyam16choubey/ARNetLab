import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  MonitorOff,
  Maximize,
  Play,
  AlertCircle,
  Loader,
  XCircle,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import StatusIndicator from '../components/common/StatusIndicator';
import NetworkToolbar from '../components/network/NetworkToolbar';
import NodeTypeSelector from '../components/network/NodeTypeSelector';
import NetworkControls from '../components/network/NetworkControls';
import RouteStatus from '../components/network/RouteStatus';
import NetworkLegend from '../components/network/NetworkLegend';
import AROverlay from '../components/ar/AROverlay';
import { useAR } from '../hooks/useAR';
import './ARLabPage.css';

export default function ARLabPage() {
  const {
    support,
    session,
    hitTest,
    placement,
    errorMessage,
    startAR,
    endAR,
    onTap,
  } = useAR();

  /** @type {React.RefObject<HTMLCanvasElement>} */
  const canvasRef = useRef(null);

  const isARActive =
    session === 'active' || session === 'starting' || session === 'ending';

  // ---- Handlers ----

  const handleEnterAR = useCallback(async () => {
    if (canvasRef.current) {
      await startAR(canvasRef.current);
    }
  }, [startAR]);

  const handleCanvasTap = useCallback(() => {
    if (session === 'active') {
      onTap();
    }
  }, [session, onTap]);

  // ---- Render support status for the placeholder ----

  function renderSupportStatus() {
    if (support === 'checking') {
      return (
        <div className="arlab__support-status arlab__support-status--checking">
          <Loader size={16} className="animate-spin" />
          <span>Checking AR support…</span>
        </div>
      );
    }
    if (support === 'unsupported') {
      return (
        <div className="arlab__support-status arlab__support-status--unsupported">
          <XCircle size={16} />
          <span>
            AR is not supported on this browser/device. Try Chrome on an
            Android device with ARCore.
          </span>
        </div>
      );
    }
    if (support === 'supported') {
      return (
        <div className="arlab__support-status arlab__support-status--supported">
          <Smartphone size={16} />
          <span>AR is supported on this device</span>
        </div>
      );
    }
    return null;
  }

  // ---- Derive top bar status ----

  function getStatusIndicator() {
    if (session === 'active') {
      if (placement === 'placed') return { status: 'active', label: 'Workspace Placed' };
      if (hitTest === 'ready') return { status: 'warning', label: 'Surface Detected' };
      return { status: 'warning', label: 'AR Active — Scanning' };
    }
    if (session === 'starting') return { status: 'warning', label: 'Starting AR…' };
    if (session === 'error') return { status: 'error', label: 'AR Error' };
    return { status: 'inactive', label: 'AR Inactive' };
  }

  const statusProps = getStatusIndicator();

  return (
    <div className={`arlab ${isARActive ? 'arlab--ar-active' : ''}`}>
      {/* === AR Canvas (always in DOM, visible only when active) === */}
      <canvas
        ref={canvasRef}
        className={`arlab__canvas ${isARActive ? 'arlab__canvas--visible' : ''}`}
        onClick={handleCanvasTap}
        aria-label="AR viewport"
      />

      {/* === AR Overlay (floating controls during AR) === */}
      {isARActive && <AROverlay />}

      {/* === Default UI (hidden during AR) === */}
      {!isARActive && (
        <>
          {/* Top Bar */}
          <div className="arlab__topbar">
            <div className="arlab__topbar-left">
              <Link to="/">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
              </Link>
              <div className="arlab__topbar-title">
                <span className="arlab__topbar-name">AR Lab</span>
                <Badge variant={session === 'error' ? 'warning' : 'info'}>
                  Phase 2 — WebXR AR
                </Badge>
              </div>
            </div>
            <div className="arlab__topbar-right">
              <StatusIndicator
                status={statusProps.status}
                label={statusProps.label}
              />
            </div>
          </div>

          {/* Main Layout */}
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
                  {/* Error state */}
                  {session === 'error' ? (
                    <>
                      <div className="arlab__placeholder-icon arlab__placeholder-icon--error">
                        <AlertCircle size={48} />
                      </div>
                      <h2 className="arlab__placeholder-title">AR Error</h2>
                      <p className="arlab__placeholder-text">
                        {errorMessage ||
                          'AR could not be started. Make sure you are using a supported browser and device.'}
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={<Play size={18} />}
                        onClick={handleEnterAR}
                        disabled={support !== 'supported'}
                      >
                        Try Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="arlab__placeholder-icon">
                        <MonitorOff size={48} />
                      </div>
                      <h2 className="arlab__placeholder-title">AR Workspace</h2>
                      <p className="arlab__placeholder-text">
                        Enter AR mode to use your camera, detect real-world
                        surfaces, and place the network workspace on a desk or
                        table.
                      </p>

                      {/* Support status */}
                      {renderSupportStatus()}

                      {/* Enter AR button */}
                      <Button
                        variant="primary"
                        size="lg"
                        icon={<Play size={18} />}
                        onClick={handleEnterAR}
                        disabled={support !== 'supported' || session === 'starting'}
                      >
                        {session === 'starting' ? 'Starting…' : 'Enter AR'}
                      </Button>

                      {/* Supplementary info */}
                      <div className="arlab__placeholder-info">
                        <div className="arlab__info-item">
                          <Smartphone size={18} />
                          <span>Requires a WebXR-compatible mobile browser</span>
                        </div>
                        <div className="arlab__info-item">
                          <Maximize size={18} />
                          <span>The AR view uses the full screen</span>
                        </div>
                      </div>
                    </>
                  )}
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
                Network Controls &amp; Info
              </summary>
              <div className="arlab__mobile-panel-content">
                <NodeTypeSelector />
                <NetworkControls />
                <RouteStatus />
                <NetworkLegend />
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  );
}
