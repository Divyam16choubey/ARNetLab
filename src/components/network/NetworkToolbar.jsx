import {
  Plus,
  Link2,
  Play,
  RotateCcw,
  Circle,
  Target,
} from 'lucide-react';
import { useAR } from '../../hooks/useAR';

export default function NetworkToolbar() {
  const {
    nodes,
    activeMode,
    setActiveMode,
    sourceNodeId,
    destinationNodeId,
    recalculateRoute,
    resetNetwork,
  } = useAR();

  const hasMultipleNodes = nodes.length >= 2;
  const hasNodes = nodes.length >= 1;
  const canRunRoute = Boolean(sourceNodeId && destinationNodeId);

  const TOOLS = [
    {
      id: 'place',
      label: 'Place Device',
      icon: Plus,
      phase: 3,
      enabled: true,
      active: activeMode === 'place',
      onClick: () => setActiveMode('place'),
      activeTitle: 'Place Device Mode',
    },
    {
      id: 'connect',
      label: 'Connect',
      icon: Link2,
      phase: 4,
      enabled: hasMultipleNodes,
      active: activeMode === 'connect',
      onClick: () => setActiveMode(activeMode === 'connect' ? 'select' : 'connect'),
      activeTitle: 'Connect Nodes Mode',
    },
    {
      id: 'source',
      label: 'Set Source',
      icon: Circle,
      phase: 4,
      enabled: hasNodes,
      active: activeMode === 'source',
      onClick: () => setActiveMode(activeMode === 'source' ? 'select' : 'source'),
      activeTitle: 'Set Route Source',
    },
    {
      id: 'destination',
      label: 'Set Dest.',
      icon: Target,
      phase: 4,
      enabled: hasNodes,
      active: activeMode === 'destination',
      onClick: () => setActiveMode(activeMode === 'destination' ? 'select' : 'destination'),
      activeTitle: 'Set Route Destination',
    },
    {
      id: 'route',
      label: 'Run Route',
      icon: Play,
      phase: 4,
      enabled: canRunRoute,
      active: false,
      onClick: () => recalculateRoute(),
      activeTitle: 'Calculate Dijkstra Shortest Path',
    },
    {
      id: 'reset',
      label: 'Reset Net',
      icon: RotateCcw,
      phase: 3,
      enabled: nodes.length > 0,
      active: false,
      onClick: resetNetwork,
      activeTitle: 'Reset network topology',
    },
  ];

  return (
    <div
      className="flex flex-wrap gap-2 p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-lg max-[480px]:justify-center"
      role="toolbar"
      aria-label="Network editing tools"
    >
      {TOOLS.map(({ id, label, icon: Icon, enabled, active, onClick, activeTitle }) => (
        <button
          key={id}
          className={`flex flex-col items-center gap-1 py-2 px-3 max-[480px]:p-2 rounded-xl border transition-all duration-150 min-w-[64px] max-[480px]:min-w-[56px] min-h-[52px] ${
            active
              ? 'border-primary-500 bg-primary-500/15 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/30'
              : enabled
              ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer shadow-sm'
              : 'border-transparent bg-transparent text-neutral-400 dark:text-neutral-600 opacity-45 cursor-not-allowed'
          }`}
          disabled={!enabled}
          onClick={onClick}
          title={enabled ? activeTitle : `${label} — requires placed nodes`}
          aria-label={label}
          aria-pressed={active}
        >
          <Icon size={18} />
          <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
}
