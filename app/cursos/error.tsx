"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

// Error boundary for the /cursos segment: recover in place (reset) or exit.
export default function CoursesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <section style={{ padding: "72px 0" }}>
        <div className="shell">
          <div className="mx-auto max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <TriangleAlert className="mx-auto text-[var(--destructive)]" size={28} aria-hidden="true" />
            <h1 className="mt-3 font-heading text-[20px] font-bold text-[var(--text)]">Algo salió mal</h1>
            <p className="mt-1.5 text-[14px] leading-6 text-[var(--text-muted)]">No pudimos mostrar los cursos. Intenta de nuevo.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              <button type="button" onClick={reset} style={{ color: "#fff" }} className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--primary-hover)] px-5 text-[14px] font-extrabold transition-transform active:scale-[.97]">Reintentar</button>
              <Link href="/cursos" style={{ color: "var(--primary-hover)" }} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--primary)] px-5 text-[14px] font-extrabold">Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
