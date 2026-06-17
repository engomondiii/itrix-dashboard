import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-lg border border-line bg-surface p-8 shadow-2">
      <div className="mb-6">
        <div className="text-page-title font-semibold tracking-tight text-ink-900">
          itri<span className="text-sapphire-600">X</span>
        </div>
        <p className="mt-1 text-sec text-ink-500">
          Internal Operations — sign in to continue.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
