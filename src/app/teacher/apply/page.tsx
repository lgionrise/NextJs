"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { teacherApi, ApiError, TeacherProfileData } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/teacher/dashboard" },
  { label: "My Application", href: "/teacher/apply" },
];

export default function TeacherApplyPage() {
  const router = useRouter();
  const { tokens, isLoading } = useAuth();
  const [existing, setExisting] = useState<TeacherProfileData | null>(null);
  const [checked, setChecked] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [subjects, setSubjects] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    teacherApi
      .getMyProfile(tokens.accessToken)
      .then((profile) => setExisting(profile))
      .catch(() => setExisting(null))
      .finally(() => setChecked(true));
  }, [isLoading, tokens, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!tokens?.accessToken) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const profile = await teacherApi.submitApplication(tokens.accessToken, {
        fullName,
        bio,
        qualifications,
        experienceYears,
        subjects: subjects.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setExisting(profile);
      setMessage("Application submitted. Awaiting admin approval.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!checked) {
    return (
      <DashboardShell navItems={NAV}>
        <p className="text-sm text-slate">Loading…</p>
      </DashboardShell>
    );
  }

  if (existing) {
    return (
      <DashboardShell navItems={NAV}>
        <h1 className="font-display text-2xl font-medium text-ink">My teacher application</h1>
        <div className="card mt-6 max-w-lg">
          <p className="text-sm text-ink">{existing.fullName}</p>
          <p className="mt-1 text-xs text-slate">{existing.qualifications}</p>
          <p className="mt-3 text-xs text-slate">Subjects: {existing.subjects.join(", ")}</p>
          <p className="mt-4">
            <span
              className={`badge ${
                existing.approvalStatus === "APPROVED"
                  ? "bg-teal/10 text-teal"
                  : existing.approvalStatus === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber/10 text-amber"
              }`}
            >
              {existing.approvalStatus}
            </span>
          </p>
          {existing.approvalStatus === "REJECTED" && existing.rejectionReason && (
            <p className="mt-3 text-sm text-red-600">Reason: {existing.rejectionReason}</p>
          )}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">Submit your teacher application</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink">Full name</span>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Bio</span>
          <textarea required value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Qualifications</span>
          <input
            required
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            className="input mt-1.5"
            placeholder="M.Sc Physics, IIT Delhi"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Years of experience</span>
          <input
            required
            type="number"
            min={0}
            max={60}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Subjects (comma-separated)</span>
          <input
            required
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="input mt-1.5"
            placeholder="Physics, Mathematics"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-teal">{message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </DashboardShell>
  );
}
