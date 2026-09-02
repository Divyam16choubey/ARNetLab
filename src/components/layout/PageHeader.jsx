/**
 * Reusable page header with title, subtitle, and optional badge.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.badge]
 * @param {React.ReactNode} [props.actions]
 */
export default function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div className="py-8 pb-6 md:py-12 md:pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-[600px] mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
