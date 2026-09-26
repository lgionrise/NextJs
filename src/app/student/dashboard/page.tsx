"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi, studentApi, ApiError } from "@/lib/api";

interface DashboardData {
  greeting: string;
  profile: {
    fullName: string | null;
    photoUrl: string | null;
    className: string | null;
    isOnboardingDone: boolean;
  };
  accountStatus: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    twoFactorEnabled: boolean;
    memberSince: string;
  };
  activeSessions: {
    count: number;
    devices: Array<{ deviceId: string; userAgent: string | null; lastActiveAt: string; ipAddress: string | null }>;
  };
  quickLinks: Array<{ label: string; path: string }>;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, tokens, isLoading, refreshAccessToken, clearSession } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!tokens?.accessToken) return;
    try {
      const result = await studentApi.getDashboard(tokens.accessToken);
      setData(result as DashboardData);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const result = await studentApi.getDashboard(newToken);
          setData(result as DashboardData);
          return;
        }
        router.replace("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load your dashboard.");
    }
  }, [tokens, refreshAccessToken, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    loadDashboard();
  }, [isLoading, tokens, router, loadDashboard]);

  async function handleLogout() {
    if (tokens) {
      try {
        await authApi.logout(tokens.accessToken, tokens.refreshToken);
      } catch {
        // clear session locally regardless of network errors
      }
    }
    clearSession();
    router.push("/login");
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-slate">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <p className="font-display text-xl font-semibold text-ink">LGIONRISE</p>
          <button onClick={handleLogout} className="btn-secondary">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-3xl font-medium text-ink">{data.greeting}</h1>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card title="Account">
            <p className="text-sm text-ink">{user?.email ?? user?.phone}</p>
            <p className="mt-2 text-xs text-slate">
              Email {data.accountStatus.isEmailVerified ? "verified" : "not verified"}
            </p>
            <p className="text-xs text-slate">
              Two-factor authentication {data.accountStatus.twoFactorEnabled ? "on" : "off"}
            </p>
          </Card>

          <Card title="Profile">
            {data.profile.isOnboardingDone ? (
              <>
                <p className="text-sm text-ink">{data.profile.fullName}</p>
                <p className="text-xs text-slate">Class {data.profile.className}</p>
              </>
            ) : (
              <p className="text-sm text-slate">You haven&apos;t completed onboarding yet.</p>
            )}
          </Card>

          <Card title="Active sessions">
            <p className="text-sm text-ink">{data.activeSessions.count} device(s) signed in</p>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-medium text-ink">Quick links</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {data.quickLinks.map((link) => (
              <li key={link.path}>
                <span className="btn-secondary inline-block cursor-default">{link.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-rule bg-paper-dim p-5">
      <p className="text-xs font-medium text-slate">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
