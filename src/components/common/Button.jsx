import './Button.css';

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
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
    </button>
  );
}
