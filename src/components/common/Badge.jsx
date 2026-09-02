/**
 * Status badge component.
 *
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'upcoming'} [props.variant='info']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Badge({ variant = 'info', className = '', children }) {
  const baseClasses =
    'inline-flex items-center py-1 px-3 text-xs font-semibold rounded-full uppercase tracking-wider leading-[1.4]';

  const variantClasses = {
    info: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    warning:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    upcoming:
      'bg-neutral-100 text-neutral-600 border border-dashed border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-600',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.info} ${className}`}
    >
      {children}
    </span>
  );
}
