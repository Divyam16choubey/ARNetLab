import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';
import { useAR } from '../../hooks/useAR';

const ICON_MAP = {
  Monitor,
  ToggleLeft,
  Router,
  Server,
};

/**
 * Visual selector for network device types.
 * Interactive device type selector for AR placement.
 */
export default function NodeTypeSelector() {
  const { selectedDeviceType, selectDeviceType } = useAR();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Device Palette
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
        {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
          const Icon = ICON_MAP[icon];
          const isSelected = selectedDeviceType === type;
          return (
            <button
              key={type}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left min-h-[52px] ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15 ring-2 ring-primary-500/30'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
              onClick={() => selectDeviceType(type)}
              aria-pressed={isSelected}
              aria-label={`Select ${label} device type`}
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{
                  backgroundColor: `${color}1f`,
                  color: color,
                }}
              >
                {Icon && <Icon size={18} />}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {label}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {isSelected ? 'Active for placement' : 'Click to select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
