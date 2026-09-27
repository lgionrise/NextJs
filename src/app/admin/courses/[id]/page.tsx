"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { courseApi, ApiError, CourseData } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Teacher Applications", href: "/admin/teachers" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Batches", href: "/admin/batches" },
];

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { tokens, isLoading } = useAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [topics, setTopics] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await courseApi.getOne(courseId);
      setCourse(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load course");
    }
  }, [courseId]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace("/login");
      return;
    }
    load();
  }, [isLoading, tokens, router, load]);

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!tokens?.accessToken || !course) return;
    try {
      await courseApi.addChapter(tokens.accessToken, course.id, {
        title: chapterTitle,
        orderIndex: course.chapters?.length ?? 0,
        topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setChapterTitle("");
      setTopics("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add chapter");
    }
  }

  async function handleRemoveChapter(chapterId: string) {
    if (!tokens?.accessToken || !course) return;
    try {
      await courseApi.removeChapter(tokens.accessToken, course.id, chapterId);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove chapter");
    }
  }

  if (!course) {
    return (
      <DashboardShell navItems={NAV}>
        <p className="text-sm text-slate">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">{course.title}</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">{course.description}</p>

      <h2 className="mt-8 font-display text-xl font-medium text-ink">Chapters</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {(course.chapters ?? []).map((chapter) => (
          <div key={chapter.id} className="card flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-ink">
                {chapter.orderIndex + 1}. {chapter.title}
              </p>
              <p className="mt-1 text-xs text-slate">{chapter.topics.join(", ")}</p>
            </div>
            <button onClick={() => handleRemoveChapter(chapter.id)} className="btn-danger">
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddChapter} className="card mt-6 max-w-lg space-y-3">
        <p className="text-sm font-medium text-ink">Add a chapter</p>
        <input
          required
          placeholder="Chapter title"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          className="input"
        />
        <input
          placeholder="Topics (comma-separated)"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn-primary">
          Add chapter
        </button>
      </form>

      <h2 className="mt-10 font-display text-xl font-medium text-ink">Batches on this course</h2>
      <div className="mt-4 space-y-2">
        {(course.batches ?? []).length === 0 && <p className="text-sm text-slate">No batches yet.</p>}
        {(course.batches ?? []).map((batch) => (
          <div key={batch.id} className="card">
            <p className="text-sm text-ink">{batch.name}</p>
            <p className="mt-1 text-xs text-slate">{batch.status}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
