import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Live classes", href: "/#features" },
      { label: "Tests & rank", href: "/#features" },
      { label: "Notes & DPPs", href: "/#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/support" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper-dim">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg font-semibold text-ink">LGIONRISE</p>
            <p className="mt-3 max-w-xs text-sm text-slate">
              Live classes, doubt support and rank-tracking tests for JEE, NEET and Board exam aspirants across India.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-slate">
          © {new Date().getFullYear()} LGIONRISE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
