export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar px-4">
      {/* Ambient structural depth - soft glow top, signature whisper bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-ink-primary/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/4 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-signature/10 blur-[120px]"
      />
      {/* Hairline grid texture, barely there */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink-inverse) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-inverse) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}