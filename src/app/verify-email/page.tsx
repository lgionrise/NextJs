"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { authApi, ApiError, OtpPurpose } from "@/lib/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.verifyOtp({ email, purpose: OtpPurpose.EMAIL_VERIFICATION, otp });
      router.push("/login?verified=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setMessage(null);
    try {
      const result = await authApi.sendOtp({ email, purpose: OtpPurpose.EMAIL_VERIFICATION });
      setMessage(result.message);
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend OTP.");
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={email ? `We sent a 6-digit code to ${email}.` : "Enter the 6-digit code sent to your email."}
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Verification code</span>
          <input
            type="text"
            required
            maxLength={6}
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="input mt-1.5 tracking-[0.5em]"
            placeholder="000000"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-teal">{message}</p>}
        <button type="submit" disabled={isSubmitting || otp.length !== 6} className="btn-primary w-full">
          {isSubmitting ? "Verifying…" : "Verify email"}
        </button>
      </form>
      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="mt-6 text-sm font-medium text-ink underline underline-offset-4 disabled:text-slate disabled:no-underline"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
