import { Loader } from 'lucide-react';

/**
 * Loading indicator.
 *
 * @param {Object} props
 * @param {string} [props.message='Loading…']
 */
export default function LoadingState({ message = 'Loading\u2026' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
      <Loader size={28} className="text-primary-500 animate-spin" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
    </div>
  );
}
