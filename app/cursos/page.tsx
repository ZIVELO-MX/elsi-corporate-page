"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, GraduationCap, Search, SearchX } from "lucide-react";
import { getAllCourses, money, modalityLabel, publishState, stateMeta, type Course } from "@/lib/courses";
import { courseImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";

const allCourses = getAllCourses();
const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "sost", label: "Sostenibilidad" },
  { key: "norm", label: "Normatividad" },
  { key: "hab", label: "Habilidades" },
];

const TONE: Record<string, string> = {
  teal: "bg-[var(--primary-light)] text-[var(--secondary-foreground)]",
  purple: "bg-[var(--accent-light)] text-[var(--accent)]",
  muted: "bg-[var(--muted)] text-[var(--text-muted)]",
  green: "bg-[#edf3e8] text-[var(--moss)]",
};

function StateBadge({ course }: { course: Course }) {
  const m = stateMeta(course);
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[.06em] ${TONE[m.tone]}`}>{m.label}</span>;
}

function CourseMedia({ course }: { course: Course }) {
  const img = courseImages[course.slug];
  if (img) return <SafeImage src={img.src} alt={img.alt} width={900} height={600} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  return <div className="size-full bg-gradient-to-br from-[var(--accent-light)] via-[var(--primary-light)] to-[var(--muted)]" aria-hidden="true" />;
}

function FeaturedCard({ course }: { course: Course }) {
  const m = stateMeta(course);
  return (
    <article className="grid overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)] md:grid-cols-[1.05fr_1fr]">
      <div className="relative aspect-[16/10] md:aspect-auto"><CourseMedia course={course} /></div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--primary-hover)]">Curso destacado</span>
          <StateBadge course={course} />
        </div>
        <h2 className="font-heading text-[20px] font-bold leading-[1.15] text-[var(--text)]">{course.title}</h2>
        <p className="mt-1.5 text-[13px] leading-6 text-[var(--text-muted)]">{course.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5"><GraduationCap size={14} className="text-[var(--primary)]" aria-hidden="true" />{modalityLabel(course)}</div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-[var(--primary)]" aria-hidden="true" />{course.duration}</div>
          {course.schedule && <div className="col-span-2 flex items-center gap-1.5"><CalendarDays size={14} className="text-[var(--primary)]" aria-hidden="true" />{course.schedule.date} · {course.schedule.time}</div>}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <div>
            <span className="font-heading text-[18px] font-bold text-[var(--primary-hover)]">{money(course.price)}</span>
            {course.priceLabel && course.price > 0 && <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">{course.priceLabel}</span>}
          </div>
          <Link href={`/cursos/${course.slug}`} style={{ color: "#fff" }} className="inline-flex min-h-10 items-center rounded-[8px] bg-[var(--primary-hover)] px-4 text-[13px] font-extrabold transition-transform active:scale-[.97]">{m.cta}</Link>
        </div>
      </div>
    </article>
  );
}

function CompactRow({ course }: { course: Course }) {
  return (
    <Link href={`/cursos/${course.slug}`} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 transition-colors hover:border-[var(--primary)]">
      <div className="size-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--muted)]"><CourseMedia course={course} /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1"><StateBadge course={course} /></div>
        <h3 className="truncate text-[14px] font-bold text-[var(--text)]">{course.title}</h3>
        <p className="truncate text-[12px] text-[var(--text-muted)]">{modalityLabel(course)} · {course.duration}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <span className="text-[13px] font-bold text-[var(--primary-hover)]">{money(course.price)}</span>
        <span style={{ color: "var(--primary-hover)" }} className="mt-0.5 block text-[11px] font-extrabold">Ver curso →</span>
      </div>
    </Link>
  );
}

export default function CursosPage() {
  const [cat, setCat] = useState("todos");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter((c) => publishState(c) !== "draft")
      .filter((c) => cat === "todos" || c.cat === cat)
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.catLabel.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [cat, query]);

  const featured = visible.find((c) => c.featured) ?? visible.find((c) => publishState(c) === "upcoming") ?? visible[0];
  const rest = visible.filter((c) => c !== featured);

  return (
    <main>
      <div className="shell page-header" style={{ paddingBottom: 0 }}>
        <span className="section-kicker">Oferta formativa</span>
        <h1>Catálogo de cursos</h1>
        <p>Encuentra el curso por tema, modalidad o disponibilidad. El acceso a los cursos en línea se envía por correo tras la inscripción.</p>
      </div>

      <section data-section-label="Cursos / Catálogo" style={{ padding: "28px 0 72px" }}>
        <div className="shell flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative max-w-xl">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por tema, modalidad o categoría…"
                aria-label="Buscar cursos"
                className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-[var(--paper)] pl-10 pr-3 text-[14px] text-[var(--text)]"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              {CATEGORIES.map(({ key, label }) => (
                <button key={key} type="button" className="course-filter" aria-pressed={cat === key} onClick={() => setCat(key)}>{label}</button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <SearchX className="mx-auto text-[var(--text-muted)]" size={26} aria-hidden="true" />
              <p className="mt-3 text-[15px] font-bold text-[var(--text)]">Sin coincidencias</p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">Ningún curso coincide con tu búsqueda o filtro.</p>
              <button type="button" onClick={() => { setCat("todos"); setQuery(""); }} style={{ color: "var(--primary-hover)" }} className="mt-3 text-[13px] font-extrabold">Limpiar filtros</button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {featured && <FeaturedCard course={featured} />}
              {rest.length > 0 && (
                <div className="grid gap-2.5">
                  {rest.map((c) => <CompactRow key={c.id} course={c} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
