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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {login.isError && <ErrorMessage>{(login.error as Error).message}</ErrorMessage>}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Spinner className="text-current" />}
        Sign in
      </Button>

      {siteConfig.useMocks && (
        <p className="text-caption text-ink-400">
          Mock mode — any credentials sign you in. Try{" "}
          <span className="font-mono">admin@itrix.example</span>.
        </p>
      )}
    </form>
  );
}
