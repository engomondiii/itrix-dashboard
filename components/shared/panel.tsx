import { cn } from '@/lib/utils';

/** The titled card every detail screen is built from. */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  /** Optional control on the title row — a link, a small button. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('glass-surface rounded-xl p-4', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display tracking-display text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
