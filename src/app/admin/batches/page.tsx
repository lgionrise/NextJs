"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import {
  batchApi,
  courseApi,
  adminTeacherApi,
  ApiError,
  BatchData,
  CourseData,
  TeacherProfileData,
  WeekDay,
  ScheduleEntry,
  LanguageOption,
} from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Teacher Applications", href: "/admin/teachers" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Batches", href: "/admin/batches" },
];

const WEEK_DAYS: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const LANGUAGES: LanguageOption[] = ["ENGLISH", "HINDI", "HINGLISH", "REGIONAL"];

const emptySchedule = (): ScheduleEntry => ({ dayOfWeek: "MONDAY", startTime: "18:00", endTime: "19:00", subject: "" });

export default function AdminBatchesPage() {
  const router = useRouter();
  const { tokens, isLoading } = useAuth();

  const [batches, setBatches] = useState<BatchData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [teacherUserId, setTeacherUserId] = useState("");
  const [language, setLanguage] = useState<LanguageOption>("ENGLISH");
  const [priceInPaise, setPriceInPaise] = useState(999900);
  const [discountedPriceInPaise, setDiscountedPriceInPaise] = useState<number | "">("");
  const [validityDays, setValidityDays] = useState(365);
  const [startDate, setStartDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([emptySchedule()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!tokens?.accessToken) return;
    try {
      const [b, c, t] = await Promise.all([
        batchApi.list(),
        courseApi.list(),
        adminTeacherApi.listApplications(tokens.accessToken, "APPROVED"),
      ]);
      setBatches(b);
      setCourses(c);
      setTeachers(t);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load data");
    }
  }, [tokens]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    load();
  }, [isLoading, tokens, router, load]);

  function updateSchedule(index: number, patch: Partial<ScheduleEntry>) {
    setSchedules((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!tokens?.accessToken) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await batchApi.create(tokens.accessToken, {
        courseId,
        name,
        teacherUserId,
        language,
        priceInPaise,
        discountedPriceInPaise: discountedPriceInPaise === "" ? undefined : discountedPriceInPaise,
        validityDays,
        startDate: new Date(startDate).toISOString(),
        schedules,
      });
      setMessage("Batch created as draft.");
      setName("");
      setSchedules([emptySchedule()]);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create batch");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublish(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await batchApi.publish(tokens.accessToken, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish batch");
    }
  }

  async function handleArchive(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await batchApi.archive(tokens.accessToken, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not archive batch");
    }
  }

  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">Batches</h1>

      <form onSubmit={handleCreate} className="card mt-6 max-w-2xl space-y-4">
        <p className="text-sm font-medium text-ink">Create a new batch</p>

        <select required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="select">
          <option value="">Select course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <input required placeholder="Batch name" value={name} onChange={(e) => setName(e.target.value)} className="input" />

        <select required value={teacherUserId} onChange={(e) => setTeacherUserId(e.target.value)} className="select">
          <option value="">Select approved teacher…</option>
          {teachers.map((t) => (
            <option key={t.userId} value={t.userId}>
              {t.fullName}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select value={language} onChange={(e) => setLanguage(e.target.value as LanguageOption)} className="select">
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            required
            type="number"
            placeholder="Price (paise)"
            value={priceInPaise}
            onChange={(e) => setPriceInPaise(Number(e.target.value))}
            className="input"
          />
          <input
            type="number"
            placeholder="Discounted price (optional)"
            value={discountedPriceInPaise}
            onChange={(e) => setDiscountedPriceInPaise(e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
          />
          <input
            required
            type="number"
            placeholder="Validity (days)"
            value={validityDays}
            onChange={(e) => setValidityDays(Number(e.target.value))}
            className="input"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Weekly schedule</p>
          <div className="mt-2 space-y-2">
            {schedules.map((s, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <select
                  value={s.dayOfWeek}
                  onChange={(e) => updateSchedule(i, { dayOfWeek: e.target.value as WeekDay })}
                  className="select"
                >
                  {WEEK_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={s.startTime}
                  onChange={(e) => updateSchedule(i, { startTime: e.target.value })}
                  className="input"
                />
                <input
                  type="time"
                  value={s.endTime}
                  onChange={(e) => updateSchedule(i, { endTime: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Subject"
                  value={s.subject}
                  onChange={(e) => updateSchedule(i, { subject: e.target.value })}
                  className="input"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSchedules((prev) => [...prev, emptySchedule()])}
            className="btn-secondary mt-2"
          >
            Add schedule slot
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-teal">{message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Creating…" : "Create batch"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {batches.map((batch) => (
          <div key={batch.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{batch.name}</p>
                <p className="mt-1 text-xs text-slate">
                  {batch.course?.title} · {batch.teacher?.teacherProfile?.fullName} · ₹
                  {(batch.priceInPaise / 100).toFixed(0)}
                </p>
              </div>
              <span className="badge bg-paper text-ink">{batch.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {batch.status === "DRAFT" && (
                <button onClick={() => handlePublish(batch.id)} className="btn-primary">
                  Publish
                </button>
              )}
              {batch.status !== "ARCHIVED" && (
                <button onClick={() => handleArchive(batch.id)} className="btn-secondary">
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
