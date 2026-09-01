import { Inbox } from 'lucide-react';
import './EmptyState.css';

/**
 * Empty state placeholder.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state__icon">
        {icon || <Inbox size={40} />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
