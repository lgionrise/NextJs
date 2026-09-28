export function Badge({
  label,
  icon,
  tone = "neutral",
}: {
  label: string;
  icon?: string;
  tone?: "neutral" | "success" | "warning" | "accent";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-white/15 text-paper",
    success: "bg-teal/20 text-paper",
    warning: "bg-amber/20 text-paper",
    accent: "bg-amber text-ink",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ${toneClasses[tone]}`}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
