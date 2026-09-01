import { Loader } from 'lucide-react';
import './LoadingState.css';

/**
 * Loading indicator.
 *
 * @param {Object} props
 * @param {string} [props.message='Loading…']
 */
export default function LoadingState({ message = 'Loading\u2026' }) {
  return (
    <div className="loading-state">
      <Loader size={28} className="loading-state__spinner animate-spin" />
      <p className="loading-state__message">{message}</p>
    </div>
  );
}
