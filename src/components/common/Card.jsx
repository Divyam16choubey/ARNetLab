/**
 * Reusable card component.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.hoverable]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Card({
  title,
  subtitle,
  icon,
  hoverable = false,
  className = '',
  children,
  ...rest
}) {
  const baseClasses =
    'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 transition-all duration-200';
  const hoverClasses = hoverable
    ? 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md hover:-translate-y-0.5'
    : '';

  const classes = [baseClasses, hoverClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {(icon || title || subtitle) && (
        <div className="flex items-start gap-4 mb-4">
          {icon && (
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400 shrink-0 [&_svg]:w-[22px] [&_svg]:h-[22px]">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold mb-1 text-neutral-900 dark:text-neutral-50">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
