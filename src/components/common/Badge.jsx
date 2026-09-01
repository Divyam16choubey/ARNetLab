import './Badge.css';

/**
 * Status badge component.
 *
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'upcoming'} [props.variant='info']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Badge({ variant = 'info', className = '', children }) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  );
}
