'use client';

/**
 * Sign in.
 *
 * The point of this page in the template is the error handling. It shows the
 * full round trip: the backend's error envelope arrives, `normalizeError`
 * turns it into `{ message, fieldErrors }`, field errors attach to inputs and
 * anything object-level becomes a form-level message. No status-code
 * branching, no guessing at response shapes.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

import { normalizeError, type FieldError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { useCopy } from '@/lib/i18n/locale-provider';
import { isDemoMode } from '@/lib/env';
import { GuestRoute } from '@/components/auth/protected-route';
import { LocaleToggle } from '@/components/locale-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

/**
 * Only follow a redirect target that is a site-relative path.
 *
 * `?next=https://evil.example.com` on a login page is an open redirect: the
 * link looks like yours, the user signs in, and lands on the attacker's
 * lookalike. The `//` check matters too — `//evil.com` is protocol-relative
 * and navigates off-site despite starting with a slash.
 */
function safeRedirect(target: string | null, fallback = '/today'): string {
  if (!target) return fallback;
  if (!target.startsWith('/') || target.startsWith('//')) return fallback;
  return target;
}

function LoginForm() {
  const { login } = useAuth();
  const copy = useCopy();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errorFor = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message ?? null;

  /**
   * Demo mode only: fill and submit the known credentials in one click, so a
   * first-time visitor reaches the product surface in seconds. The fields are
   * filled (not bypassed) so the visible state matches what was sent.
   */
  async function handleDemoLogin() {
    const { DEMO_CREDENTIALS } = await import('@/lib/demo/data');
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setFieldErrors([]);
    setFormError(null);
    setSubmitting(true);
    try {
      await login({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password });
      router.replace(safeRedirect(searchParams.get('next')));
    } catch (error) {
      setFormError(normalizeError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors([]);
    setFormError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      router.replace(safeRedirect(searchParams.get('next')));
    } catch (error) {
      // login() rejects rather than swallowing — which is what makes this
      // block possible at all. See the note in auth-context.tsx.
      const normalized = normalizeError(error);
      setFieldErrors(normalized.fieldErrors);

      // Show the summary only when no field error already explains it,
      // otherwise the same message appears twice.
      const hasFieldError = normalized.fieldErrors.some((e) => e.field);
      if (!hasFieldError) setFormError(normalized.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      {/*
        Language and theme belong BEFORE sign-in, not only after it. The person
        who cannot read this form is exactly the one who needs the language
        switch, and they have no way to reach Settings from here. Fixed to the
        corner rather than in the column so it does not push the form off
        centre on a short viewport.
      */}
      <div className="fixed right-4 top-4 flex items-center gap-1">
        <LocaleToggle className="text-foreground/70 hover:bg-muted" />
        <ThemeToggle className="text-foreground/70 hover:bg-muted" />
      </div>

      <h1 className="mb-6 text-2xl font-semibold">{copy.auth.signIn}</h1>

      {isDemoMode() && (
        <div className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <p>
            {copy.auth.demoIntro} <code className="font-mono">demo@example.com</code> /{' '}
            <code className="font-mono">demo1234</code>
            {copy.auth.demoOutro}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={handleDemoLogin}
            className="mt-2 w-full"
          >
            {submitting ? copy.auth.signingIn : copy.auth.demoSignIn}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <Field
          label={copy.auth.email}
          type="email"
          name="email"
          // Lets password managers recognise the field.
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errorFor('email')}
          required
        />

        <Field
          label={copy.auth.password}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorFor('password')}
          required
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? copy.auth.signingIn : copy.auth.signIn}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">{copy.auth.lockedOut}</p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <GuestRoute>
      {/*
        useSearchParams() forces the nearest Suspense boundary to render on
        the client. Without one, `next build` fails the whole route with
        "useSearchParams should be wrapped in a suspense boundary" — a common
        first deployment failure that never shows up in `next dev`.
      */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GuestRoute>
  );
}
