import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import MobileMenu from './MobileMenu';

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
      <nav
        className="sticky top-0 z-sticky h-16 bg-white/85 dark:bg-neutral-950/85 border-b border-neutral-100 dark:border-neutral-800 backdrop-blur-md transition-[background,border-color] duration-200"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-full gap-4 container">
          <Link
            to="/"
            className="flex items-center gap-3 no-underline text-neutral-900 dark:text-neutral-50 shrink-0"
            aria-label="ARNetLab Home"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-primary-600 to-accent-500 text-white text-sm font-extrabold tracking-tight">
              AR
            </span>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              ARNetLab
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1" role="menubar">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `py-2 px-3 text-sm font-medium rounded-md transition-all duration-150 no-underline ${
                    isActive
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-500/15 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-neutral-50 dark:hover:bg-neutral-800'
                  }`
                }
                role="menuitem"
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-md text-neutral-600 dark:text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 cursor-pointer"
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
