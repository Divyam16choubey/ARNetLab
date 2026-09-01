import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import './MobileMenu.css';

/**
 * Full-screen mobile navigation menu.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {{ to: string; label: string }[]} props.links
 */
export default function MobileMenu({ isOpen, onClose, links }) {
  return (
    <div
      className={`mobile-menu ${isOpen ? 'mobile-menu--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Overlay */}
      <div className="mobile-menu__overlay" onClick={onClose} />

      {/* Panel */}
      <div className="mobile-menu__panel">
        <div className="mobile-menu__header">
          <span className="mobile-menu__title">Menu</span>
          <button
            className="mobile-menu__close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-menu__nav">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
              }
              onClick={onClose}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu__footer">
          <div className="mobile-menu__theme">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
