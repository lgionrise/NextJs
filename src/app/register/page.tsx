"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, ApiError, OtpPurpose } from "@/lib/api";
import { Badge } from "@/components/badge";

type RoleChoice = "STUDENT" | "TEACHER";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleChoice>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.register({ email, password, role });
      await authApi.sendOtp({ email, purpose: OtpPurpose.EMAIL_VERIFICATION });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-ink to-ink-soft p-12 text-paper md:flex">
        <Link href="/" className="font-display text-xl font-semibold">
          LGIONRISE
        </Link>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-xs font-medium text-amber-soft">Assalamu alaikum 👋</p>
          <p className="mt-3 font-display text-2xl font-medium leading-snug">
            Join thousands preparing for JEE, NEET and Boards.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge label="Live Classes" icon="🎥" tone="neutral" />
            <Badge label="Rank Tracking" icon="📊" tone="success" />
            <Badge label="Doubt Support" icon="💬" tone="warning" />
          </div>
        </div>

        <p className="text-xs text-paper/40">© {new Date().getFullYear()} LGIONRISE</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-xl font-semibold text-ink md:hidden">
            LGIONRISE
          </Link>

          <h1 className="mt-6 font-display text-3xl font-medium text-ink md:mt-0">Create your account</h1>
          <p className="mt-2 text-sm text-slate">Choose how you want to use LGIONRISE.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                role === "STUDENT" ? "border-ink bg-paper-dim" : "border-rule hover:bg-paper-dim"
              }`}
            >
              <p className="text-2xl">🎒</p>
              <p className="mt-2 text-sm font-medium text-ink">Student</p>
              <p className="text-xs text-slate">Learn & prepare</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                role === "TEACHER" ? "border-ink bg-paper-dim" : "border-rule hover:bg-paper-dim"
              }`}
            >
              <p className="text-2xl">👩‍🏫</p>
              <p className="mt-2 text-sm font-medium text-ink">Teacher</p>
              <p className="text-xs text-slate">Teach & earn</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1.5"
                placeholder="At least 8 characters"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Creating account…" : `Create ${role === "TEACHER" ? "teacher" : "student"} account`}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
