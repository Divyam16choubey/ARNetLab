import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';
import './NodeTypeSelector.css';

const ICON_MAP = {
  Monitor,
  ToggleLeft,
  Router,
  Server,
};

/**
 * Visual selector for network device types.
 * Phase 1: display-only, no interaction logic.
 */
export default function NodeTypeSelector() {
  return (
    <div className="node-selector">
      <p className="node-selector__label">Device Types</p>
      <div className="node-selector__grid">
        {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
          const Icon = ICON_MAP[icon];
          return (
            <button
              key={type}
              className="node-selector__item"
              disabled
              title={`${label} — available in Phase 2`}
              aria-label={`Place ${label} device (coming soon)`}
            >
              <span
                className="node-selector__icon"
                style={{ '--node-color': color }}
              >
                {Icon && <Icon size={20} />}
              </span>
              <span className="node-selector__name">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
