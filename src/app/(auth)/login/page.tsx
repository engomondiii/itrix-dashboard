import Image from "next/image";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="animate-fade-up">
      {/* Brand mark above the card — the supplied itriX wordmark (reversed cut,
          for the deep background), not a typed approximation of it. */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <Image
          src="/brand/itrix-logo-inverse.png"
          alt="itriX"
          width={66}
          height={30}
          unoptimized
          priority
        />
        <span className="text-micro font-medium uppercase tracking-[0.1em] text-ink-muted">
          Ops
        </span>
      </div>

      {/* Card - luminous structural panel, lifted off the deep background */}
      <div className="relative overflow-hidden rounded-lg border border-tint/15 bg-gradient-to-b from-structure-600/70 to-structure-700/80 p-8 shadow-3 ring-1 ring-inset ring-ink-inverse/5 backdrop-blur-md">
        {/* Signature line across the top edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-tint to-transparent"
        />

        <div className="mb-6">
          <div className="text-page-title font-semibold tracking-tight text-ink-inverse">
            Welcome back
          </div>
          <p className="mt-1 text-sec text-ink-muted">
            Internal Operations — sign in to continue.
          </p>
        </div>

        <LoginForm />
      </div>

      {/* Quiet footer note */}
      <p className="mt-6 text-center text-micro uppercase tracking-[0.08em] text-ink-muted/60">
        Authorized personnel only
      </p>
    </div>
  );
}