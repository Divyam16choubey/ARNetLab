import {
  Plus,
  Link2,
  Play,
  RotateCcw,
  Circle,
  Target,
} from 'lucide-react';
import './NetworkToolbar.css';

/**
 * Floating toolbar for network editing actions.
 * Phase 1: All buttons disabled, visually indicating future functionality.
 */
const TOOLS = [
  { id: 'place', label: 'Place Node', icon: Plus, phase: 2 },
  { id: 'connect', label: 'Connect', icon: Link2, phase: 2 },
  { id: 'source', label: 'Set Source', icon: Circle, phase: 3 },
  { id: 'destination', label: 'Set Dest.', icon: Target, phase: 3 },
  { id: 'route', label: 'Run Route', icon: Play, phase: 3 },
  { id: 'reset', label: 'Reset', icon: RotateCcw, phase: 2 },
];

export default function NetworkToolbar() {
  return (
    <div className="network-toolbar" role="toolbar" aria-label="Network editing tools">
      {TOOLS.map(({ id, label, icon: Icon, phase }) => (
        <button
          key={id}
          className="network-toolbar__btn"
          disabled
          title={`${label} — coming in Phase ${phase}`}
          aria-label={`${label} (coming in Phase ${phase})`}
        >
          <Icon size={18} />
          <span className="network-toolbar__label">{label}</span>
        </button>
      ))}
    </div>
  );
}
