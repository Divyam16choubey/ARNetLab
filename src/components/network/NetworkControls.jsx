import { Link2, Circle, Target } from 'lucide-react';

/**
 * Side panel controls for network operations.
 * Phase 1: disabled placeholder controls.
 */
export default function NetworkControls() {
  const controls = [
    {
      id: 'connect',
      label: 'Connect Nodes',
      description: 'Create a link between two devices',
      icon: Link2,
    },
    {
      id: 'source',
      label: 'Select Source',
      description: 'Pick the source device for routing',
      icon: Circle,
    },
    {
      id: 'destination',
      label: 'Select Destination',
      description: 'Pick the destination device for routing',
      icon: Target,
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Network Controls
      </p>
      <div className="flex flex-col gap-2">
        {controls.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            className="flex items-center gap-3 p-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-left transition-all duration-150 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:border-primary-300 dark:hover:enabled:border-primary-700 hover:enabled:bg-neutral-50 dark:hover:enabled:bg-neutral-800"
            disabled
            title={`${label} — coming soon`}
            aria-label={`${label} (coming soon)`}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
              <Icon size={16} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {label}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
