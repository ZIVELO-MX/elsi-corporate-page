"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[55dvh] place-items-center px-5 py-16">
      <section className="w-full max-w-xl text-center" aria-labelledby="error-title">
        <AlertCircle
          className="mx-auto text-[var(--destructive)]"
          size={32}
          aria-hidden="true"
        />
        <h1
          id="error-title"
          className="mt-4 font-heading text-2xl font-bold text-[var(--text)]"
        >
          No pudimos cargar esta página
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-[var(--text-muted)]">
          Intenta nuevamente. Si el problema continúa, vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-4 text-[13px] font-extrabold text-white"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-4 text-[13px] font-extrabold text-[var(--text)]"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
