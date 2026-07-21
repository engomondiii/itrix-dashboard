"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site.config";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState(siteConfig.useMocks ? "naomi@itrix.example" : "");
  const [password, setPassword] = useState(siteConfig.useMocks ? "demo" : "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  // Shared field styling - translucent structural wells that brighten on focus.
  const fieldClass =
    "border-ink-inverse/15 bg-structure-900/40 text-ink-inverse placeholder:text-ink-muted/50 " +
    "focus-visible:border-signature-soft focus-visible:ring-structure-600/40 " +
    "selection:bg-structure-600/30";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-ink-muted">
          Work email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-ink-muted">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </div>

      {login.isError && <ErrorMessage>{(login.error as Error).message}</ErrorMessage>}

      <Button
        type="submit"
        className="w-full bg-ink-primary text-white shadow-2 hover:bg-structure-600 focus-visible:ring-structure-600/50"
        disabled={login.isPending}
      >
        {login.isPending && <Spinner className="text-current" />}
        Sign in
      </Button>

      {siteConfig.useMocks && (
        <p className="rounded-md border border-signature/25 bg-signature/10 px-3 py-2 text-caption text-tint">
          Mock mode — any credentials sign you in. Try{" "}
          <span className="font-mono text-soft">admin@itrix.example</span>.
        </p>
      )}
    </form>
  );
}