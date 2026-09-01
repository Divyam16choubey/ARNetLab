import './StatusIndicator.css';

/**
 * Visual status dot with label.
 *
 * @param {Object} props
 * @param {'active'|'inactive'|'warning'|'error'} [props.status='inactive']
 * @param {string} props.label
 */
export default function StatusIndicator({ status = 'inactive', label }) {
  return (
    <div className={`status-indicator status-indicator--${status}`}>
      <span className="status-indicator__dot" />
      <span className="status-indicator__label">{label}</span>
    </div>
  );
}
