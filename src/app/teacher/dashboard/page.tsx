"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { teacherApi, batchApi, ApiError, TeacherProfileData, BatchData } from "@/lib/api";
import { ProfileHeroCard } from "@/components/profile-hero-card";

const NAV = [
  { label: "Dashboard", href: "/teacher/dashboard" },
  { label: "My Application", href: "/teacher/apply" },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, tokens, isLoading } = useAuth();
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tokens?.accessToken || !user) return;
    try {
      const p = await teacherApi.getMyProfile(tokens.accessToken);
      setProfile(p);
    } catch {
      setProfile(null);
    }
    try {
      const b = await batchApi.list({ teacherUserId: user.id });
      setBatches(b);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load batches");
    }
  }, [tokens, user]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    load();
  }, [isLoading, tokens, router, load]);

  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">Teacher dashboard</h1>
      <div className="mt-6 max-w-lg">
        <ProfileHeroCard
          name={profile?.fullName ?? user?.email ?? "Teacher"}
          identifier={user?.email ?? user?.phone ?? ""}
          role="Teacher"
          isVerified={profile?.approvalStatus === "APPROVED"}
          extraBadge={profile?.approvalStatus}
        />
      </div>

      {!profile && (
        <div className="card mt-6 max-w-lg">
          <p className="text-sm text-ink">You haven&apos;t submitted a teacher application yet.</p>
          <Link href="/teacher/apply" className="btn-primary mt-4 inline-block">
            Apply now
          </Link>
        </div>
      )}

      {profile && profile.approvalStatus !== "APPROVED" && (
        <div className="card mt-6 max-w-lg">
          <p className="text-sm text-ink">
            Your application is <strong>{profile.approvalStatus}</strong>.
          </p>
          {profile.approvalStatus === "REJECTED" && (
            <p className="mt-2 text-sm text-red-600">{profile.rejectionReason}</p>
          )}
        </div>
      )}

      {profile && profile.approvalStatus === "APPROVED" && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-medium text-ink">My batches</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {batches.length === 0 ? (
            <p className="mt-4 text-sm text-slate">No batches assigned to you yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-rule text-xs uppercase text-slate">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Course</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="border-b border-rule/60">
                      <td className="py-3 pr-4 text-ink">{b.name}</td>
                      <td className="py-3 pr-4 text-slate">{b.course?.title}</td>
                      <td className="py-3 pr-4">
                        <span className="badge bg-paper-dim text-ink">{b.status}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate">₹{(b.priceInPaise / 100).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
