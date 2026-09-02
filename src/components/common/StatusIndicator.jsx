/**
 * Visual status dot with label.
 *
 * @param {Object} props
 * @param {'active'|'inactive'|'warning'|'error'} [props.status='inactive']
 * @param {string} props.label
 */
export default function StatusIndicator({ status = 'inactive', label }) {
  const dotVariants = {
    active: 'bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]',
    inactive: 'bg-neutral-400',
    warning: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    error: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
  };

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${dotVariants[status] || dotVariants.inactive}`}
      />
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
    </div>
  );
}
