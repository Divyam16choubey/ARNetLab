import { Inbox } from 'lucide-react';

/**
 * Empty state placeholder.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-3 animate-fade-in">
      <div className="text-neutral-400 dark:text-neutral-500 mb-2">
        {icon || <Inbox size={40} />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[360px]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
