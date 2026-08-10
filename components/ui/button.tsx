/**
 * The button primitive.
 *
 * Until now every call site hand-wrote its classes, which is how a codebase
 * ends up with eleven slightly different buttons and no hover transition on
 * any of them. One primitive means hover/focus/active/disabled behaviour is
 * decided once — including the parts nobody remembers to hand-write:
 * `transition-colors`, `focus-visible` (keyboard-only ring, no mouse-click
 * ring), `active:` press feedback, and `disabled:pointer-events-none`.
 *
 * Variants are a plain object, not a variant library — five variants and
 * three sizes do not justify a dependency. `asChild` (Radix Slot) lets a
 * `<Link>` wear button styling without nesting interactive elements.
 *
 * No `loading` prop by design: a loading button is a button with
 * `disabled` and a spinner child, and owning that composition keeps this
 * file from growing a second API.
 */

import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ' +
  'transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-60';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4',
  lg: 'h-10 px-6',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the child element (e.g. a next/link) with button styling. */
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  className,
  // `type` explicit so a Button inside a <form> never submits by accident —
  // the exact bug class the entity form's history warns about.
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const typeProp = asChild ? {} : { type };
  return (
    <Comp className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...typeProp} {...props} />
  );
}
