import { Badge } from "./badge";

export function ProfileHeroCard({
  name,
  identifier,
  handle,
  role,
  isVerified,
  extraBadge,
}: {
  name: string;
  identifier: string;
  handle?: string;
  role: string;
  isVerified: boolean;
  extraBadge?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "L";

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-ink-soft p-6 text-paper">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber/40 bg-ink-soft font-display text-2xl font-semibold">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl font-medium leading-tight">{name}</p>
          <p className="mt-1 truncate text-sm text-paper/70">{identifier}</p>
          {handle && <p className="mt-0.5 text-xs text-paper/50">@{handle}</p>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge label={role} icon="🎓" tone="accent" />
        <Badge
          label={isVerified ? "Verified" : "Not verified"}
          icon={isVerified ? "✓" : "!"}
          tone={isVerified ? "success" : "warning"}
        />
        {extraBadge && <Badge label={extraBadge} icon="📍" tone="neutral" />}
      </div>
    </div>
  );
}
