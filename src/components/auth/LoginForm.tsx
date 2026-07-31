"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  // Shared field styling - translucent structural wells that brighten on focus.
  const fieldClass =
    "border-ink-inverse/15 bg-structure-900/40 text-ink-inverse placeholder:text-ink-muted/50 " +
    "focus-visible:border-tint focus-visible:ring-structure-600/40 " +
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

    </form>
  );
}