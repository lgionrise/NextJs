"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { courseApi, ApiError, CourseData, TargetExam } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Teacher Applications", href: "/admin/teachers" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Batches", href: "/admin/batches" },
];

const TARGET_EXAMS: TargetExam[] = ["JEE_MAIN", "JEE_ADVANCED", "NEET", "BOARDS_10", "BOARDS_12", "OTHER"];

export default function AdminCoursesPage() {
  const router = useRouter();
  const { tokens, isLoading } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetExam, setTargetExam] = useState<TargetExam>("JEE_MAIN");
  const [className, setClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await courseApi.list();
      setCourses(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load courses");
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    load();
  }, [isLoading, tokens, router, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!tokens?.accessToken) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await courseApi.create(tokens.accessToken, { title, description, targetExam, className });
      setTitle("");
      setDescription("");
      setClassName("");
      setMessage("Course created as draft.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create course");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublish(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await courseApi.publish(tokens.accessToken, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish course");
    }
  }

  async function handleArchive(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await courseApi.archive(tokens.accessToken, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not archive course");
    }
  }

  async function handleDelete(id: string) {
    if (!tokens?.accessToken) return;
    try {
      await courseApi.delete(tokens.accessToken, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete course");
    }
  }

  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">Courses</h1>

      <form onSubmit={handleCreate} className="card mt-6 max-w-xl space-y-4">
        <p className="text-sm font-medium text-ink">Create a new course</p>
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <textarea
          required
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input"
        />
        <div className="grid grid-cols-2 gap-3">
          <select value={targetExam} onChange={(e) => setTargetExam(e.target.value as TargetExam)} className="select">
            {TARGET_EXAMS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Class (e.g. 12, Dropper)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-teal">{message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Creating…" : "Create course"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/admin/courses/${course.id}`} className="text-sm font-medium text-ink underline underline-offset-4">
                  {course.title}
                </Link>
                <p className="mt-1 text-xs text-slate">
                  {course.targetExam} · Class {course.className} · {course.chapters?.length ?? 0} chapter(s)
                </p>
              </div>
              <span className="badge bg-paper text-ink">{course.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {course.status === "DRAFT" && (
                <button onClick={() => handlePublish(course.id)} className="btn-primary">
                  Publish
                </button>
              )}
              {course.status !== "ARCHIVED" && (
                <button onClick={() => handleArchive(course.id)} className="btn-secondary">
                  Archive
                </button>
              )}
              <button onClick={() => handleDelete(course.id)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
