/**
 * The standard surface for one settings panel.
 *
 * Every section on every settings page renders through this card, which is
 * what makes the settings area feel like one product as it grows: a new
 * "Billing" or "API keys" page is a route plus SettingsSections — never a
 * new layout invention.
 *
 * The `footer` slot exists for action rows (Save buttons, danger actions)
 * that belong to the section but not inside its content flow — it renders
 * with a top border in the muted band at the card's bottom edge.
 */

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface SettingsSectionProps {
  title: string;
  /** One sentence under the title. What does this section control? */
  description?: string;
  children: ReactNode;
  /** Action row rendered in the card's bottom band. */
  footer?: ReactNode;
  /** `destructive` tints the border for danger areas. */
  tone?: 'default' | 'destructive';
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  footer,
  tone = 'default',
  className,
}: SettingsSectionProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        'overflow-hidden rounded-lg border bg-card',
        tone === 'destructive' ? 'border-destructive/40' : 'border-border',
        className,
      )}
    >
      <div className="px-5 pb-5 pt-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{description}</p>}
        {!description && <div className="mb-4" />}
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-3">
          {footer}
        </div>
      )}
    </section>
  );
}
