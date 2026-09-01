import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import MobileMenu from './MobileMenu';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/ar-lab', label: 'AR Lab' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar__inner container">
          <Link to="/" className="navbar__brand" aria-label="ARNetLab Home">
            <span className="navbar__logo">AR</span>
            <span className="navbar__brand-text">
              <span className="navbar__brand-name">ARNetLab</span>
            </span>
          </Link>

          <div className="navbar__links" role="menubar">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
                role="menuitem"
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="navbar__actions">
            <ThemeToggle />
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
      />
    </>
  );
}
