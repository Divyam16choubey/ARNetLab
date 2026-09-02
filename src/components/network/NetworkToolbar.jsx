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
  const { nodes, resetNetwork } = useAR();

  const TOOLS = [
    {
      id: 'place',
      label: 'Place Device',
      icon: Plus,
      phase: 3,
      enabled: true,
      activeTitle: 'Place Device (Active in Phase 3 AR Mode)',
    },
    {
      id: 'reset',
      label: 'Reset Net',
      icon: RotateCcw,
      phase: 3,
      enabled: nodes.length > 0,
      onClick: resetNetwork,
      activeTitle: 'Reset placed network devices',
    },
    {
      id: 'connect',
      label: 'Connect',
      icon: Link2,
      phase: 4,
      enabled: false,
    },
    {
      id: 'source',
      label: 'Set Source',
      icon: Circle,
      phase: 4,
      enabled: false,
    },
    {
      id: 'destination',
      label: 'Set Dest.',
      icon: Target,
      phase: 4,
      enabled: false,
    },
    {
      id: 'route',
      label: 'Run Route',
      icon: Play,
      phase: 4,
      enabled: false,
    },
  ];

  return (
    <div
      className="flex flex-wrap gap-2 p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-lg max-[480px]:justify-center"
      role="toolbar"
      aria-label="Network editing tools"
    >
      {TOOLS.map(({ id, label, icon: Icon, phase, enabled, onClick, activeTitle }) => (
        <button
          key={id}
          className={`flex flex-col items-center gap-1 py-2 px-3 max-[480px]:p-2 rounded-xl border transition-all duration-150 min-w-[64px] max-[480px]:min-w-[56px] min-h-[52px] ${
            enabled
              ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer shadow-sm'
              : 'border-transparent bg-transparent text-neutral-400 dark:text-neutral-600 opacity-50 cursor-not-allowed'
          }`}
          disabled={!enabled}
          onClick={onClick}
          title={enabled ? activeTitle : `${label} — coming in Phase ${phase}`}
          aria-label={enabled ? label : `${label} (coming in Phase ${phase})`}
        >
          <Icon size={18} />
          <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
}
