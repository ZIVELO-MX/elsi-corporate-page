import type { ReactNode } from "react";

// A composed empty state: a soft icon chip, a title, and an optional hint.
// Used inside table `<td colSpan>` cells and small panels so "no data" and
// "no matches" read as designed states, not as a stray line of gray text.
export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-11 text-center">
      <span
        aria-hidden="true"
        className="mb-0.5 inline-flex size-11 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-muted)]"
      >
        {icon}
      </span>
      <p className="m-0 text-sm font-semibold text-[var(--text)]">{title}</p>
      {hint && <p className="m-0 max-w-96 text-[13px] leading-6 text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
