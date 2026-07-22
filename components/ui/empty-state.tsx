import type { CSSProperties, ReactNode } from "react";

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "2.75rem 1rem", textAlign: "center" };
const chipStyle: CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: "var(--muted)", color: "var(--text-muted)", marginBottom: "0.125rem" };

// A composed empty state: a soft icon chip, a title, and an optional hint.
// Used inside table `<td colSpan>` cells and small panels so "no data" and
// "no matches" read as designed states, not as a stray line of gray text.
export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div style={wrapStyle}>
      <span aria-hidden="true" style={chipStyle}>
        {icon}
      </span>
      <p className="m-0 text-sm font-semibold text-[var(--text)]">{title}</p>
      {hint && <p className="m-0 max-w-96 text-[13px] leading-6 text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
