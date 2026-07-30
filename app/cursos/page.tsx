import Link from "next/link";
import {
  CalendarDays,
  Clock,
  GraduationCap,
  Search,
  SearchX,
} from "lucide-react";
import {
  getPublicCourses,
  getVerifiedCourses,
  money,
  modalityLabel,
  publishState,
  stateMeta,
  type Course,
} from "@/lib/courses";
import { CourseMedia } from "@/components/course-media";
import { PrototypeDataNote } from "@/components/prototype-data-note";
import { StructuredData } from "@/components/structured-data";
import {
  buildCourseListJsonLd,
  buildMetadata,
  indexable,
} from "@/lib/seo";
import {
  buildCatalogPath,
  CATALOG_CATEGORIES,
  normalizeCatalogCategory,
  normalizeCatalogQuery,
} from "@/lib/agentic-navigation";

const catalogDescription =
  "Catálogo de cursos de ELSI: educación ambiental, normatividad y habilidades, en línea y presenciales.";

type CatalogSearchParams = Promise<{
  categoria?: string | string[];
  q?: string | string[];
}>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const params = await searchParams;
  const hasFilters = Boolean(first(params.categoria) || first(params.q));
  const hasVerifiedCatalog = getVerifiedCourses().some(
    (course) => publishState(course) !== "draft",
  );

  return buildMetadata({
    title: "Cursos",
    description: catalogDescription,
    path: "/cursos",
    allowIndexing: indexable && hasVerifiedCatalog && !hasFilters,
  });
}

const TONE: Record<string, string> = {
  teal: "bg-[var(--primary-light)] text-[var(--secondary-foreground)]",
  purple: "bg-[var(--accent-light)] text-[var(--accent)]",
  muted: "bg-[var(--muted)] text-[var(--text-muted)]",
};

function StateBadge({ course }: { course: Course }) {
  const meta = stateMeta(course);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[.06em] ${TONE[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}

function FeaturedCard({ course }: { course: Course }) {
  return (
    <article className="course-feature-card grid w-full min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)] md:grid-cols-[1.05fr_1fr]">
      <div className="course-feature-media relative min-w-0 aspect-[16/10] md:aspect-auto">
        <CourseMedia
          course={course}
          variant="feature"
          sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1440px) 52vw, 657px"
        />
      </div>
      <div className="course-feature-body flex min-w-0 flex-col p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--primary-hover)]">
            Curso destacado
          </span>
          <StateBadge course={course} />
        </div>
        <h2 className="font-heading text-[20px] font-bold leading-[1.15] text-[var(--text)]">
          {course.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-6 text-[var(--text-muted)]">
          {course.description}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <GraduationCap
              size={14}
              className="text-[var(--primary)]"
              aria-hidden="true"
            />
            {modalityLabel(course)}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock
              size={14}
              className="text-[var(--primary)]"
              aria-hidden="true"
            />
            {course.duration}
          </div>
          {course.schedule ? (
            <div className="col-span-2 flex items-center gap-1.5">
              <CalendarDays
                size={14}
                className="text-[var(--primary)]"
                aria-hidden="true"
              />
              {course.schedule.date} · {course.schedule.time}
            </div>
          ) : null}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <div>
            <span className="font-heading text-[18px] font-bold text-[var(--primary-hover)]">
              {money(course.price)}
            </span>
            {course.priceLabel && course.price > 0 ? (
              <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">
                {course.priceLabel}
              </span>
            ) : null}
          </div>
          <Link
            href={`/cursos/${course.slug}`}
            className="on-primary-link inline-flex min-h-10 items-center rounded-[8px] bg-[var(--primary-hover)] px-4 text-[13px] font-extrabold transition-transform active:scale-[.97]"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactRow({ course }: { course: Course }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="course-compact-row flex w-full min-w-0 items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3 transition-colors pointer-fine:hover:border-[var(--primary)] active:scale-[.99] motion-reduce:active:scale-100"
    >
      <div className="course-compact-thumb size-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--muted)]">
        <CourseMedia course={course} variant="thumbnail" sizes="64px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1">
          <StateBadge course={course} />
        </div>
        <h3 className="truncate text-[14px] font-bold text-[var(--text)]">
          {course.title}
        </h3>
        <p className="truncate text-[12px] text-[var(--text-muted)]">
          {modalityLabel(course)} · {course.duration}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <span className="text-[13px] font-bold text-[var(--primary-hover)]">
          {money(course.price)}
        </span>
        <span className="primary-link mt-0.5 block text-[11px] font-extrabold">
          Ver curso →
        </span>
      </div>
    </Link>
  );
}

export default async function CursosPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const params = await searchParams;
  const category = normalizeCatalogCategory(first(params.categoria));
  const query = normalizeCatalogQuery(first(params.q));
  const normalizedQuery = query.toLocaleLowerCase("es-MX");
  const allCourses = getPublicCourses();
  const visible = allCourses.filter(
    (course) =>
      publishState(course) !== "draft" &&
      (category === "todos" || course.cat === category) &&
      (!normalizedQuery ||
        course.title.toLocaleLowerCase("es-MX").includes(normalizedQuery) ||
        course.catLabel.toLocaleLowerCase("es-MX").includes(normalizedQuery) ||
        course.description
          .toLocaleLowerCase("es-MX")
          .includes(normalizedQuery)),
  );
  const featured =
    visible.find((course) => course.featured) ??
    visible.find((course) => publishState(course) === "upcoming") ??
    visible[0];
  const rest = visible.filter((course) => course !== featured);
  const verifiedCourses = getVerifiedCourses().filter(
    (course) => publishState(course) !== "draft",
  );

  return (
    <main>
      {indexable && verifiedCourses.length >= 3 ? (
        <StructuredData value={buildCourseListJsonLd(verifiedCourses)} />
      ) : null}
      <div className="shell page-header course-catalog-header">
        <span className="section-kicker">Oferta formativa</span>
        <h1>Catálogo de cursos</h1>
        <p>
          Encuentra el curso por tema, modalidad o disponibilidad. El acceso a
          los cursos en línea se envía por correo tras la inscripción.
        </p>
        <PrototypeDataNote>
          Cursos, fechas, precios e imágenes se sustituirán con la información
          validada por ELSI.
        </PrototypeDataNote>
      </div>

      <section
        aria-label="Catálogo de cursos"
        data-section-label="Cursos / Catálogo"
        className="course-catalog-section"
      >
        <div className="shell flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <form
              action="/cursos"
              className="flex max-w-2xl flex-col gap-2 sm:flex-row"
              method="get"
              role="search"
            >
              {category !== "todos" ? (
                <input type="hidden" name="categoria" value={category} />
              ) : null}
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Buscar cursos</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar por tema, modalidad o categoría"
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-[var(--paper)] pl-10 pr-3 text-[14px] text-[var(--text)]"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-5 text-[13px] font-extrabold text-white active:scale-[.98]"
              >
                Buscar
              </button>
            </form>
            <nav
              className="flex flex-wrap gap-2"
              aria-label="Filtrar cursos por categoría"
            >
              {CATALOG_CATEGORIES.map((item) => (
                <Link
                  key={item.key}
                  href={buildCatalogPath({
                    category: item.key,
                    query,
                  })}
                  className="course-filter"
                  aria-current={category === item.key ? "page" : undefined}
                  scroll={false}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <SearchX
                className="mx-auto text-[var(--text-muted)]"
                size={26}
                aria-hidden="true"
              />
              <p className="mt-3 text-[15px] font-bold text-[var(--text)]">
                {allCourses.length === 0
                  ? "Oferta en preparación"
                  : "Sin coincidencias"}
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                {allCourses.length === 0
                  ? "Los cursos aparecerán cuando ELSI valide su información."
                  : "Ningún curso coincide con tu búsqueda o filtro."}
              </p>
              {allCourses.length > 0 ? (
                <Link
                  href="/cursos"
                  className="primary-link mt-3 inline-flex min-h-10 items-center text-[13px] font-extrabold"
                >
                  Limpiar filtros
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {featured ? <FeaturedCard course={featured} /> : null}
              {rest.length > 0 ? (
                <div className="grid min-w-0 gap-2.5">
                  {rest.map((course) => (
                    <CompactRow key={course.id} course={course} />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
