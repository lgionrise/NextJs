"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { authApi, ApiError, redirectPathForRole } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function resolveIdentifier(value: string) {
  const trimmed = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { email: trimmed };
  if (/^\+?[0-9]{7,15}$/.test(trimmed)) return { phone: trimmed };
  return { username: trimmed };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const justVerified = searchParams.get("verified") === "1";
  const justReset = searchParams.get("reset") === "1";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.login({ ...resolveIdentifier(identifier), password });

      if (result.requiresTwoFactor) {
        sessionStorage.setItem("lgionrise_mfa_token", result.mfaToken);
        router.push("/verify-2fa");
        return;
      }

      setSession(result.user, { accessToken: result.accessToken, refreshToken: result.refreshToken });
      router.push(redirectPathForRole(result.user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue.">
      {justVerified && (
        <p className="mb-4 rounded-lg bg-teal/10 px-3.5 py-2.5 text-sm text-teal">
          Email verified. You can log in now.
        </p>
      )}
      {justReset && (
        <p className="mb-4 rounded-lg bg-teal/10 px-3.5 py-2.5 text-sm text-teal">
          Password reset. Log in with your new password.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Email, phone or username</span>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input mt-1.5"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Password</span>
            <Link href="/forgot-password" className="text-xs font-medium text-slate underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1.5"
            placeholder="Your password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate">
        New to LGIONRISE?{" "}
        <Link href="/register" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
