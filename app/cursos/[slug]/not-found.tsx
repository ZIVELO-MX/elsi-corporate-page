import Link from "next/link";
import { SearchX } from "lucide-react";

// Shown when getCourseBySlug() → notFound() for an unknown/removed course slug.
export default function CourseNotFound() {
  return (
    <main>
      <section style={{ padding: "72px 0" }}>
        <div className="shell">
          <div className="mx-auto max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <SearchX className="mx-auto text-[var(--text-muted)]" size={28} aria-hidden="true" />
            <h1 className="mt-3 font-heading text-[20px] font-bold text-[var(--text)]">Curso no encontrado</h1>
            <p className="mt-1.5 text-[14px] leading-6 text-[var(--text-muted)]">El curso que buscas no existe o ya no está disponible.</p>
            <Link href="/cursos" style={{ color: "#fff" }} className="mt-4 inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--primary-hover)] px-5 text-[14px] font-extrabold transition-transform active:scale-[.97]">Ver todos los cursos</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
