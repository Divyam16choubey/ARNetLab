/**
 * Reusable button component with variants and sizes.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {React.ReactNode} [props.icon] - Leading icon element
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.fullWidth]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 whitespace-nowrap border border-transparent leading-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm [&_svg]:w-4 [&_svg]:h-4',
    md: 'py-2 px-5 text-sm min-h-[40px] [&_svg]:w-[18px] [&_svg]:h-[18px]',
    lg: 'py-3 px-6 text-base min-h-[48px] [&_svg]:w-5 [&_svg]:h-5',
  };

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:enabled:bg-primary-700 active:enabled:bg-primary-800',
    secondary:
      'bg-neutral-100 text-neutral-900 border-neutral-200 hover:enabled:bg-neutral-50 hover:enabled:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700 dark:hover:enabled:bg-neutral-800 dark:hover:enabled:border-neutral-600',
    outline:
      'bg-transparent text-primary-500 border-primary-500 hover:enabled:bg-primary-50 hover:enabled:text-primary-600 dark:hover:enabled:bg-primary-500/10',
    ghost:
      'bg-transparent text-neutral-600 hover:enabled:bg-neutral-100 hover:enabled:text-neutral-900 dark:text-neutral-400 dark:hover:enabled:bg-neutral-800 dark:hover:enabled:text-neutral-50',
  };

  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {icon && <span className="flex items-center shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}
