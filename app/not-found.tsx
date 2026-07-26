import Link from "next/link";
import { SearchX } from "lucide-react";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Página no encontrada",
  description: "La página solicitada no está disponible.",
  path: "/404",
});

export default function NotFound() {
  return (
    <main className="grid min-h-[55dvh] place-items-center px-5 py-16">
      <section className="w-full max-w-xl text-center" aria-labelledby="not-found-title">
        <SearchX
          className="mx-auto text-[var(--primary-hover)]"
          size={32}
          aria-hidden="true"
        />
        <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--primary-hover)]">
          Error 404
        </p>
        <h1
          id="not-found-title"
          className="mt-2 font-heading text-2xl font-bold text-[var(--text)]"
        >
          No encontramos esta página
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-[var(--text-muted)]">
          Revisa la dirección o continúa desde una de las rutas principales.
        </p>
        <nav
          className="mt-6 flex flex-wrap justify-center gap-2"
          aria-label="Rutas para continuar"
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-4 text-[13px] font-extrabold text-white"
          >
            Ir al inicio
          </Link>
          <Link
            href="/cursos"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-4 text-[13px] font-extrabold text-[var(--text)]"
          >
            Ver cursos
          </Link>
          <Link
            href="/soluciones"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-4 text-[13px] font-extrabold text-[var(--text)]"
          >
            Ver soluciones
          </Link>
        </nav>
      </section>
    </main>
  );
}
