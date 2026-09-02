import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

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
      className={`fixed inset-0 z-overlay transition-all duration-300 ${
        isOpen
          ? 'pointer-events-auto visible'
          : 'pointer-events-none invisible'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-neutral-900/40 dark:bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 flex flex-col transition-transform duration-300 shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between py-4 px-5 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Menu
          </span>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-md text-neutral-600 dark:text-neutral-400 transition-all duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 cursor-pointer"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center p-3 px-4 text-base font-medium no-underline rounded-md transition-all duration-150 min-h-[44px] ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
                }`
              }
              onClick={onClose}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 px-5 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
