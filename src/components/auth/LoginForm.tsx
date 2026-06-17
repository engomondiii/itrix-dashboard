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

  // Shared field styling — translucent indigo wells that brighten on focus.
  const fieldClass =
    "border-oni/15 bg-indigo-950/40 text-oni placeholder:text-oni-muted/50 " +
    "focus-visible:border-sapphire-300 focus-visible:ring-sapphire-500/40 " +
    "selection:bg-sapphire-500/30";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-oni-muted">
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
        <Label htmlFor="password" className="text-oni-muted">
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
        className="w-full bg-sapphire-600 text-white shadow-2 hover:bg-sapphire-500 focus-visible:ring-sapphire-500/50"
        disabled={login.isPending}
      >
        {login.isPending && <Spinner className="text-current" />}
        Sign in
      </Button>

      {siteConfig.useMocks && (
        <p className="rounded-md border border-gold-500/25 bg-gold-500/10 px-3 py-2 text-caption text-gold-100">
          Mock mode — any credentials sign you in. Try{" "}
          <span className="font-mono text-gold-50">admin@itrix.example</span>.
        </p>
      )}
    </form>
  );
}