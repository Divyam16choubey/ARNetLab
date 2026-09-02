import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
      <div className="pt-12 pb-8 flex flex-col gap-10 container">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-primary-600 to-accent-500 text-white text-sm font-extrabold">
            AR
          </span>
          <div>
            <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              ARNetLab
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Build. Connect. Route. Visualize.
            </p>
          </div>
        </div>

        <nav className="flex gap-16 flex-wrap" aria-label="Footer navigation">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Navigate
            </h4>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 no-underline transition-colors duration-150 py-1 hover:text-primary-500"
            >
              Home
            </Link>
            <Link
              to="/ar-lab"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 no-underline transition-colors duration-150 py-1 hover:text-primary-500"
            >
              AR Lab
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 no-underline transition-colors duration-150 py-1 hover:text-primary-500"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 no-underline transition-colors duration-150 py-1 hover:text-primary-500"
            >
              About
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Project
            </h4>
            <a
              href="https://github.com/Divyam16choubey/ARNetLab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 no-underline transition-colors duration-150 py-1 hover:text-primary-500"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
          </div>
        </nav>

        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            &copy; {new Date().getFullYear()} ARNetLab. An educational project
            for network topology visualization.
          </p>
        </div>
      </div>
    </footer>
  );
}
