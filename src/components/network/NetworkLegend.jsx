import { Monitor, ToggleLeft, Router, Server } from 'lucide-react';
import { NODE_TYPE_LIST } from '../../constants/networkTypes';
import './NetworkLegend.css';

const ICON_MAP = { Monitor, ToggleLeft, Router, Server };

/**
 * Legend showing device type icons and colors.
 */
export default function NetworkLegend() {
  return (
    <div className="network-legend">
      <p className="network-legend__title">Legend</p>
      <div className="network-legend__items">
        {NODE_TYPE_LIST.map(({ type, label, color, icon }) => {
          const Icon = ICON_MAP[icon];
          return (
            <div key={type} className="network-legend__item">
              <span
                className="network-legend__dot"
                style={{ background: color }}
              />
              {Icon && <Icon size={14} style={{ color }} />}
              <span className="network-legend__label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
