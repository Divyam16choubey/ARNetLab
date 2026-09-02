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
        <div className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium text-neutral-400 dark:text-neutral-500">
          <Loader size={16} className="animate-spin" />
          <span>Checking AR support…</span>
        </div>
      );
    }
    if (support === 'unsupported') {
      return (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium bg-red-500/10 dark:bg-red-500/15 text-red-500 text-center max-w-[400px]">
          <XCircle size={16} className="shrink-0" />
          <span>
            AR is not supported on this browser/device. Try Chrome on an
            Android device with ARCore.
          </span>
        </div>
      );
    }
    if (support === 'supported') {
      return (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-500">
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
    <div
      className={`flex flex-col relative ${
        isARActive ? 'min-h-screen' : 'min-h-[calc(100vh-var(--navbar-height))]'
      }`}
    >
      {/* === AR Canvas (always in DOM, visible only when active) === */}
      <canvas
        ref={canvasRef}
        className={`${
          isARActive
            ? 'block fixed inset-0 w-full h-full z-[299] [touch-action:none]'
            : 'hidden'
        }`}
        onClick={handleCanvasTap}
        aria-label="AR viewport"
      />

      {/* === AR Overlay (floating controls during AR) === */}
      {isARActive && <AROverlay />}

      {/* === Default UI (hidden during AR) === */}
      {!isARActive && (
        <>
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                  AR Lab
                </span>
                <Badge variant={session === 'error' ? 'warning' : 'info'}>
                  Phase 2 — WebXR AR
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusIndicator
                status={statusProps.status}
                label={statusProps.label}
              />
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:flex flex-col gap-4 w-[260px] p-4 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-y-auto shrink-0">
              <NodeTypeSelector />
              <NetworkControls />
              <RouteStatus />
              <NetworkLegend />
            </aside>

            {/* Viewport */}
            <main className="flex-1 flex flex-col relative min-h-[400px]">
              <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 relative bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-fade-in">
                <div className="flex flex-col items-center text-center gap-4 p-8 max-w-[480px]">
                  {/* Error state */}
                  {session === 'error' ? (
                    <>
                      <div className="text-red-500 mb-2">
                        <AlertCircle size={48} />
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        AR Error
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
                      <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                        <MonitorOff size={48} />
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        AR Workspace
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
                      <div className="flex flex-col gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 [&_svg]:shrink-0">
                          <Smartphone size={18} />
                          <span>Requires a WebXR-compatible mobile browser</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 [&_svg]:shrink-0">
                          <Maximize size={18} />
                          <span>The AR view uses the full screen</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Toolbar */}
              <div className="py-3 px-4 flex justify-center border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
                <NetworkToolbar />
              </div>
            </main>
          </div>

          {/* Mobile Controls Panel */}
          <div className="block lg:hidden border-t border-neutral-100 dark:border-neutral-800">
            <details className="group bg-neutral-50 dark:bg-neutral-900">
              <summary className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer select-none list-none flex items-center justify-center gap-2 [&::-webkit-details-marker]:hidden before:content-['▸'] before:transition-transform before:duration-150 group-open:before:rotate-90">
                Network Controls &amp; Info
              </summary>
              <div className="p-4 flex flex-col gap-4">
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
