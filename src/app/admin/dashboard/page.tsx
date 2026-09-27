"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Teacher Applications", href: "/admin/teachers" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Batches", href: "/admin/batches" },
];

const LINKS = [
  { label: "Review teacher applications", href: "/admin/teachers" },
  { label: "Manage courses", href: "/admin/courses" },
  { label: "Manage batches", href: "/admin/batches" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardShell navItems={NAV}>
      <h1 className="font-display text-2xl font-medium text-ink">Admin dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="card block transition-colors hover:bg-paper">
            <p className="text-sm font-medium text-ink">{link.label}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
