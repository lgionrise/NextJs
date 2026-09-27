"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";

interface NavItem {
  label: string;
  href: string;
}

export function DashboardShell({
  navItems,
  children,
}: {
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tokens, clearSession } = useAuth();

  async function handleLogout() {
    if (tokens) {
      try {
        await authApi.logout(tokens.accessToken, tokens.refreshToken);
      } catch {
        // clear locally regardless
      }
    }
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-rule bg-ink px-5 py-8 text-paper md:flex md:flex-col md:justify-between">
        <div>
          <Link href="/" className="font-display text-xl font-semibold">
            LGIONRISE
          </Link>
          <nav className="mt-10 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-ink-soft text-paper" : "text-paper/70 hover:bg-ink-soft hover:text-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div>
          <p className="text-xs text-paper/50">{user?.email ?? user?.username ?? user?.phone}</p>
          <p className="mt-1 text-xs text-amber-soft">{user?.role}</p>
        </div>
      </aside>

      <div>
        <header className="flex items-center justify-between border-b border-rule px-6 py-4 md:hidden">
          <p className="font-display text-lg font-semibold text-ink">LGIONRISE</p>
          <button onClick={handleLogout} className="btn-secondary">
            Log out
          </button>
        </header>
        <header className="hidden items-center justify-end border-b border-rule px-8 py-4 md:flex">
          <button onClick={handleLogout} className="btn-secondary">
            Log out
          </button>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
