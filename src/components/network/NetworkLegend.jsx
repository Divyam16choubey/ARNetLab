import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';

const ICON_MAP = { Monitor, ToggleLeft, Router, Server };

/**
 * Legend showing device type icons and colors.
 */
export default function NetworkLegend() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Legend
      </p>
      <div className="flex flex-wrap gap-4">
        {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
          const Icon = ICON_MAP[icon];
          return (
            <div key={type} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: color }}
              />
              {Icon && <Icon size={14} style={{ color }} />}
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
