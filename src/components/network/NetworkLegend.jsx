import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';

const ICON_MAP = { Monitor, ToggleLeft, Router, Server };

/**
 * Legend showing device types and topology/routing states.
 */
export default function NetworkLegend() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2.5">
          Device Types
        </p>
        <div className="grid grid-cols-2 gap-2">
          {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
            const Icon = ICON_MAP[icon];
            return (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                {Icon && <Icon size={14} style={{ color }} />}
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
          Routing &amp; Visual States
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Source Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-sky-400 shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Network Link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded bg-emerald-400 shadow-sm shrink-0" />
            <span className="text-neutral-600 dark:text-neutral-400">Optimal Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
