import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="animate-fade-up">
      {/* Brand mark above the card, in oni white like the sidebar */}
      <div className="mb-6 flex items-center justify-center gap-2 text-section font-semibold tracking-tight text-oni">
        itri<span className="text-sapphire-300">X</span>
        <span className="text-micro font-medium uppercase tracking-[0.1em] text-oni-muted">
          Ops
        </span>
      </div>

      {/* Card — luminous indigo panel, lifted off the deep background */}
      <div className="relative overflow-hidden rounded-lg border border-sapphire-300/15 bg-gradient-to-b from-indigo-700/70 to-indigo-800/80 p-8 shadow-3 ring-1 ring-inset ring-oni/5 backdrop-blur-md">
        {/* Gold signature line across the top edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent"
        />

        <div className="mb-6">
          <div className="text-page-title font-semibold tracking-tight text-oni">
            Welcome back
          </div>
          <p className="mt-1 text-sec text-oni-muted">
            Internal Operations — sign in to continue.
          </p>
        </div>

        <LoginForm />
      </div>

      {/* Quiet footer note */}
      <p className="mt-6 text-center text-micro uppercase tracking-[0.08em] text-oni-muted/60">
        Authorized personnel only
      </p>
    </div>
  );
}