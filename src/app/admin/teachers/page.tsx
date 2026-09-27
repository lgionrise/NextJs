"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { adminTeacherApi, ApiError, ApprovalStatus, TeacherProfileData } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Teacher Applications", href: "/admin/teachers" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Batches", href: "/admin/batches" },
];

export default function AdminTeachersPage() {
  const router = useRouter();
  const { tokens, isLoading } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus | "">("PENDING");
  const [applications, setApplications] = useState<TeacherProfileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rejectionDrafts, setRejectionDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!tokens?.accessToken) return;
    try {
      const result = await adminTeacherApi.listApplications(
        tokens.accessToken,
        status === "" ? undefined : status,
      );
      setApplications(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load applications");
    }
  }, [tokens, status]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    load();
  }, [isLoading, tokens, router, load]);

  async function handleApprove(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await adminTeacherApi.reviewApplication(tokens.accessToken, id, { status: "APPROVED" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve application");
    }
  }

  async function handleReject(id: string) {
    if (!tokens?.accessToken) return;
    const reason = rejectionDrafts[id]?.trim();
    if (!reason) {
      setError("Please provide a rejection reason first");
      return;
    }
    try {
      await adminTeacherApi.reviewApplication(tokens.accessToken, id, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject application");
    }
  }

  return (
    <DashboardShell navItems={NAV}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Teacher applications</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApprovalStatus | "")}
          className="select w-48"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-4">
        {applications.length === 0 && <p className="text-sm text-slate">No applications found.</p>}
        {applications.map((app) => (
          <div key={app.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{app.fullName}</p>
                <p className="mt-1 text-xs text-slate">{app.user?.email ?? app.user?.phone}</p>
                <p className="mt-2 text-sm text-slate">{app.bio}</p>
                <p className="mt-2 text-xs text-slate">
                  {app.qualifications} · {app.experienceYears} yrs · {app.subjects.join(", ")}
                </p>
              </div>
              <span
                className={`badge ${
                  app.approvalStatus === "APPROVED"
                    ? "bg-teal/10 text-teal"
                    : app.approvalStatus === "REJECTED"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber/10 text-amber"
                }`}
              >
                {app.approvalStatus}
              </span>
            </div>

            {app.approvalStatus === "PENDING" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={() => handleApprove(app.id)} className="btn-primary">
                  Approve
                </button>
                <input
                  placeholder="Rejection reason"
                  value={rejectionDrafts[app.id] ?? ""}
                  onChange={(e) =>
                    setRejectionDrafts((prev) => ({ ...prev, [app.id]: e.target.value }))
                  }
                  className="input w-64"
                />
                <button onClick={() => handleReject(app.id)} className="btn-danger">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
