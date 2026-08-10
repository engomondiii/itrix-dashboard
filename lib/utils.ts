import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class combinator for components that accept a `className` override.
 *
 * `clsx` handles the conditional/array shapes; `twMerge` resolves Tailwind
 * conflicts so a caller's `p-4` actually beats a default `p-2` instead of
 * depending on stylesheet order. Only worth using where overrides are real —
 * static class strings don't need it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
