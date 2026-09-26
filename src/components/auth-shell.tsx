import Link from "next/link";
import { ReactNode } from "react";

export function AuthShell({
  eyebrowQuote,
  title,
  subtitle,
  children,
}: {
  eyebrowQuote?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-paper md:flex">
        <Link href="/" className="font-display text-xl font-semibold">
          LGIONRISE
        </Link>
        <div>
          <p className="font-display text-2xl italic leading-relaxed">
            {eyebrowQuote ??
              "\u201cI stopped comparing myself to toppers on YouTube and started comparing myself to my own last test.\u201d"}
          </p>
          <p className="mt-4 text-sm text-paper/60">Ananya Sharma — NEET aspirant, Lucknow</p>
        </div>
        <p className="text-xs text-paper/40">© {new Date().getFullYear()} LGIONRISE</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-xl font-semibold text-ink md:hidden">
            LGIONRISE
          </Link>
          <h1 className="mt-6 font-display text-3xl font-medium text-ink md:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-slate">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
