'use client';

/**
 * Email verification landing page.
 *
 * The link in the verification email points here with the confirmation key in
 * the path. The page POSTs the key immediately on arrival — requiring a
 * button press first adds a step that only loses users, and the key is
 * single-use so nothing is gained by waiting.
 *
 * The failure state matters more than the success state: keys expire, emails
 * get opened days later, and corporate mail scanners sometimes consume the
 * key before the human clicks it. That is why failure leads straight into a
 * resend form rather than a dead end.
 */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { AuthAPI } from '@/lib/auth/auth-api';
import { normalizeError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

type VerifyState = 'verifying' | 'verified' | 'failed';

export default function VerifyEmailPage() {
  const params = useParams<{ key: string }>();

  const [state, setState] = useState<VerifyState>('verifying');
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // StrictMode mounts effects twice in development; the key is single-use on
  // the server, so the second POST would report failure for a verification
  // that just succeeded.
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !params.key) return;
    started.current = true;

    AuthAPI.verifyEmail(params.key)
      .then(() => setState('verified'))
      .catch(() => setState('failed'));
  }, [params.key]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await AuthAPI.resendVerification(email);
      // Same non-enumeration stance as forgot-password: succeed either way.
      setResent(true);
    } catch (error) {
      setFormError(normalizeError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'verifying') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
        <h1 className="mb-3 text-2xl font-semibold">Verifying…</h1>
        <p className="text-sm opacity-80">Confirming your email address.</p>
      </main>
    );
  }

  if (state === 'verified') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
        <h1 className="mb-3 text-2xl font-semibold">Email verified</h1>
        <p className="mb-6 text-sm opacity-80">
          Your address is confirmed. You can sign in now.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </main>
    );
  }

  if (resent) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
        <h1 className="mb-3 text-2xl font-semibold">Check your email</h1>
        <p className="mb-6 text-sm opacity-80">
          If an account exists for {email}, a fresh verification link is on its
          way.
        </p>
        <Link href="/login" className="text-sm underline">
          Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <h1 className="mb-3 text-2xl font-semibold">Verification failed</h1>
      <p className="mb-6 text-sm opacity-80">
        The link is invalid or has expired — they are single-use and
        short-lived. Enter your address and we will send a new one.
      </p>

      <form onSubmit={handleResend} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Sending…' : 'Send a new link'}
        </Button>
      </form>

      <div className="mt-4 text-sm">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
