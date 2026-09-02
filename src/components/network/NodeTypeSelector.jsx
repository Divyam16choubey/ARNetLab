import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';

const ICON_MAP = {
  Monitor,
  ToggleLeft,
  Router,
  Server,
};

/**
 * Visual selector for network device types.
 * Phase 1: display-only, no interaction logic.
 */
export default function NodeTypeSelector() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Device Types
      </p>
      <div className="grid grid-cols-4 gap-2">
        {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
          const Icon = ICON_MAP[icon];
          return (
            <button
              key={type}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-all duration-150 cursor-not-allowed min-h-[72px] disabled:opacity-55"
              disabled
              title={`${label} — available in Phase 2`}
              aria-label={`Place ${label} device (coming soon)`}
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-md"
                style={{
                  backgroundColor: `${color}1f`,
                  color: color,
                }}
              >
                {Icon && <Icon size={20} />}
              </span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
