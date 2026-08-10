'use client';

/**
 * Toasts — transient confirmation and failure notices.
 *
 * Hand-rolled rather than a dependency, for the same reason as the rest of
 * `components/ui/`: ~150 lines is cheaper to own than a library is to
 * configure, and the template stays free of component-library lock-in.
 *
 * Ground rules, learned the annoying way:
 *
 * - Toasts are for outcomes of actions the user just took ("Saved",
 *   "3 items deleted"), not for form validation — field errors belong next
 *   to fields, where `normalizeError` puts them.
 * - `aria-live="polite"`, never `assertive`: a toast must not interrupt a
 *   screen reader mid-sentence for something that is, by definition,
 *   non-blocking.
 * - Auto-dismiss pauses on hover. A timed message you cannot finish reading
 *   is worse than no message.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastTone = 'default' | 'success' | 'destructive';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. */
  duration?: number;
}

interface ToastRecord extends Required<Omit<ToastOptions, 'description'>> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_CLASS: Record<ToastTone, string> = {
  default: 'border-border bg-popover text-popover-foreground',
  success: 'border-positive/40 bg-popover text-popover-foreground',
  destructive: 'border-destructive/40 bg-popover text-popover-foreground',
};

const TONE_BAR: Record<ToastTone, string> = {
  default: 'bg-muted-foreground/40',
  success: 'bg-positive',
  destructive: 'bg-destructive',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const schedule = useCallback(
    (id: number, duration: number) => {
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  const toast = useCallback(
    ({ title, description, tone = 'default', duration = 5000 }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, title, description, tone, duration }]);
      schedule(id, duration);
    },
    [schedule],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* One permanent live region. Screen readers only announce additions
          to a region that already exists — rendering the region lazily with
          the first toast means the first toast is never announced. */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        role="region"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-md border py-3 pl-4 pr-2 shadow-md ${TONE_CLASS[t.tone]}`}
            onMouseEnter={() => {
              const timer = timers.current.get(t.id);
              if (timer) clearTimeout(timer);
            }}
            onMouseLeave={() => schedule(t.id, 2000)}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1 ${TONE_BAR[t.tone]}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
