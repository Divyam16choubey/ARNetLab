import { Link2, Circle, Target } from 'lucide-react';
import './NetworkControls.css';

/**
 * Side panel controls for network operations.
 * Phase 1: disabled placeholder controls.
 */
export default function NetworkControls() {
  const controls = [
    {
      id: 'connect',
      label: 'Connect Nodes',
      description: 'Create a link between two devices',
      icon: Link2,
    },
    {
      id: 'source',
      label: 'Select Source',
      description: 'Pick the source device for routing',
      icon: Circle,
    },
    {
      id: 'destination',
      label: 'Select Destination',
      description: 'Pick the destination device for routing',
      icon: Target,
    },
  ];

  return (
    <div className="network-controls">
      <p className="network-controls__title">Network Controls</p>
      <div className="network-controls__list">
        {controls.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            className="network-controls__item"
            disabled
            title={`${label} — coming soon`}
            aria-label={`${label} (coming soon)`}
          >
            <span className="network-controls__item-icon">
              <Icon size={16} />
            </span>
            <span className="network-controls__item-text">
              <span className="network-controls__item-label">{label}</span>
              <span className="network-controls__item-desc">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
