import {
  Plus,
  Link2,
  Play,
  RotateCcw,
  Circle,
  Target,
} from 'lucide-react';

/**
 * Floating toolbar for network editing actions.
 * Phase 1: All buttons disabled, visually indicating future functionality.
 */
const TOOLS = [
  { id: 'place', label: 'Place Node', icon: Plus, phase: 2 },
  { id: 'connect', label: 'Connect', icon: Link2, phase: 2 },
  { id: 'source', label: 'Set Source', icon: Circle, phase: 3 },
  { id: 'destination', label: 'Set Dest.', icon: Target, phase: 3 },
  { id: 'route', label: 'Run Route', icon: Play, phase: 3 },
  { id: 'reset', label: 'Reset', icon: RotateCcw, phase: 2 },
];

export default function NetworkToolbar() {
  return (
    <div
      className="flex flex-wrap gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg max-[480px]:justify-center"
      role="toolbar"
      aria-label="Network editing tools"
    >
      {TOOLS.map(({ id, label, icon: Icon, phase }) => (
        <button
          key={id}
          className="flex flex-col items-center gap-1 py-2 px-3 max-[480px]:p-2 rounded-md border border-transparent bg-transparent text-neutral-600 dark:text-neutral-400 transition-all duration-150 min-w-[64px] max-[480px]:min-w-[56px] min-h-[52px] disabled:opacity-45 disabled:cursor-not-allowed hover:enabled:bg-neutral-100 dark:hover:enabled:bg-neutral-800 hover:enabled:border-neutral-200 dark:hover:enabled:border-neutral-700 hover:enabled:text-neutral-900 dark:hover:enabled:text-neutral-50 cursor-pointer"
          disabled
          title={`${label} — coming in Phase ${phase}`}
          aria-label={`${label} (coming in Phase ${phase})`}
        >
          <Icon size={18} />
          <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
}
