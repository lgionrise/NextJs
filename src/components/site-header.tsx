import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          LGIONRISE
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate md:flex">
          <Link href="/#how-it-works" className="hover:text-ink">How it works</Link>
          <Link href="/#exams" className="hover:text-ink">Exams</Link>
          <Link href="/#features" className="hover:text-ink">Features</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink hover:text-slate">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
