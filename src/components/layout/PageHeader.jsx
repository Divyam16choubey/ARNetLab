import './PageHeader.css';

/**
 * Reusable page header with title, subtitle, and optional badge.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.badge]
 * @param {React.ReactNode} [props.actions]
 */
export default function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div className="page-header animate-fade-in-up">
      <div className="page-header__text">
        <div className="page-header__title-row">
          <h1 className="page-header__title">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
