"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("lgionrise_mfa_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setMfaToken(token);
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.verifyTwoFactorLogin({ mfaToken, code });
      sessionStorage.removeItem("lgionrise_mfa_token");
      setSession(result.user, { accessToken: result.accessToken, refreshToken: result.refreshToken });
      router.push("/student/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Two-factor verification"
      subtitle="Enter the 6-digit code from your authenticator app, or one of your backup codes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Authentication code</span>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input mt-1.5 tracking-[0.3em]"
            placeholder="123456"
            maxLength={8}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting || !mfaToken} className="btn-primary w-full">
          {isSubmitting ? "Verifying…" : "Verify and log in"}
        </button>
      </form>
    </AuthShell>
  );
}
