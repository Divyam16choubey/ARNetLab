import './Card.css';

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
  const classes = ['card', hoverable && 'card--hoverable', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {(icon || title || subtitle) && (
        <div className="card__header">
          {icon && <div className="card__icon">{icon}</div>}
          <div className="card__header-text">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      {children && <div className="card__body">{children}</div>}
    </div>
  );
}
