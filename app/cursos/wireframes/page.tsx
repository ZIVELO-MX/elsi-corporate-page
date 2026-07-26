"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle, CalendarDays, Clock, GraduationCap, LoaderCircle, MapPin,
  QrCode, Search, SearchX, SlidersHorizontal, UserRound,
} from "lucide-react";

/* ELS-0019 · Wireframes de referencia de la experiencia pública de cursos.
   Demostrativos sobre el modelo canónico (ELS-0013): no conectan backend, pagos
   ni correo. Curso destacado real = DC-3 "Manejo Integral de Residuos". */

type Screen = { id: string; label: string; description: string };
const screens: Screen[] = [
  { id: "catalog", label: "01 Catálogo", description: "Búsqueda, filtros frecuentes, curso destacado y módulos compactos." },
  { id: "detail", label: "02 Detalle", description: "Toda la información del curso: modalidad, horario, temario, instructor, constancia." },
  { id: "states", label: "03 Estados y CTA", description: "Publicado, próximo, cerrado (avísame), gratuito e información pendiente." },
  { id: "feedback", label: "04 Carga · vacío · error", description: "Estados no bloqueantes con salida clara." },
];

const DC3 = {
  title: "Manejo Integral de Residuos",
  category: "Habilidades",
  synopsis: "Marco legal, clasificación, economía circular y elaboración de planes de manejo, con constancia oficial DC-3.",
  modality: "En línea (en vivo)",
  date: "29 de julio",
  time: "12:00 - 16:00",
  durationText: "4 horas",
  priceAmount: 550,
  priceLabel: "Recuperación",
  certificate: "DC-3",
  topics: ["Marco Legal", "Distribución de Competencias", "Clasificación de los Residuos", "Manejo Integral de los Residuos", "Plan de Manejo", "Economía Circular", "Sanciones"],
  audience: ["Ingeniería Ambiental", "Ingeniería Química", "Ingeniería Civil", "Estudiantes de posgrado", "Carreras afines"],
  instructor: { name: "Q.F.B. Gabriela Núñez Torres", bio: "Inspectora y subdelegada de auditoría ambiental en PROFEPA; consultora ambiental; agente capacitador por STPS." },
};

/* ---- state badge ---- */
type State = "published" | "upcoming" | "closed" | "free" | "pending";
const STATE_META: Record<State, { label: string; tone: string }> = {
  published: { label: "Disponible", tone: "bg-[var(--primary-light)] text-[var(--secondary-foreground)]" },
  upcoming: { label: "Próximo", tone: "bg-[var(--accent-light)] text-[var(--accent)]" },
  closed: { label: "Cupo lleno", tone: "bg-[#f1efe7] text-[var(--text-muted)]" },
  free: { label: "Gratis", tone: "bg-[#edf3e8] text-[var(--moss)]" },
  pending: { label: "Fecha por confirmar", tone: "bg-[#f7efe3] text-[var(--earth)]" },
};
function StateBadge({ state }: { state: State }) {
  const m = STATE_META[state];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[.06em] ${m.tone}`}>{m.label}</span>;
}

/* ---- catalog pieces ---- */
function SearchAndFilters() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <div className="flex h-10 items-center rounded-[var(--radius-sm)] border border-[var(--input)] bg-[var(--paper)] pl-9 text-[13px] text-[var(--text-muted)]">Buscar por tema, modalidad o categoría…</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {["Todos", "Sostenibilidad", "Normatividad", "Habilidades"].map((c, i) => (
          <span key={c} className={`inline-flex min-h-8 items-center rounded-full px-3 text-[12px] font-bold ${i === 0 ? "bg-[var(--primary-hover)] text-white" : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]"}`}>{c}</span>
        ))}
        <span className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[12px] font-bold text-[var(--text-muted)]">
          <SlidersHorizontal size={13} aria-hidden="true" /> Más filtros
        </span>
      </div>
    </div>
  );
}

function FeaturedCard() {
  return (
    <article className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] @md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="aspect-[16/10] rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--accent-light)] via-[var(--primary-light)] to-[var(--muted)]" aria-hidden="true" />
      <div className="flex min-w-0 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--primary-hover)]">Curso destacado</span>
          <StateBadge state="upcoming" />
        </div>
        <h3 className="font-heading text-[18px] font-bold text-[var(--text)]">{DC3.title}</h3>
        <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">{DC3.synopsis}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5"><GraduationCap size={13} className="text-[var(--primary)]" aria-hidden="true" />{DC3.modality}</div>
          <div className="flex items-center gap-1.5"><Clock size={13} className="text-[var(--primary)]" aria-hidden="true" />{DC3.durationText}</div>
          <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-[var(--primary)]" aria-hidden="true" />{DC3.date} · {DC3.time}</div>
          <div className="flex items-center gap-1.5 font-bold text-[var(--text)]">${DC3.priceAmount} MXN · {DC3.priceLabel}</div>
        </dl>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="inline-flex min-h-9 items-center rounded-[var(--radius-sm)] bg-[var(--primary-hover)] px-4 text-[12px] font-extrabold text-white">Inscribirme</span>
          <span style={{ color: "var(--primary-hover)" }} className="inline-flex min-h-9 items-center rounded-[var(--radius-sm)] border border-[var(--primary)] px-3 text-[12px] font-bold">Ver curso</span>
        </div>
      </div>
    </article>
  );
}

function CompactCard({ title, meta, state }: { title: string; meta: string; state: State }) {
  return (
    <article className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="size-12 shrink-0 rounded-[var(--radius-sm)] bg-[var(--muted)]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5"><StateBadge state={state} /></div>
        <h4 className="truncate text-[13px] font-bold text-[var(--text)]">{title}</h4>
        <p className="truncate text-[11px] text-[var(--text-muted)]">{meta}</p>
      </div>
      <span style={{ color: "var(--primary-hover)" }} className="shrink-0 text-[11px] font-extrabold">Ver curso →</span>
    </article>
  );
}

/* ---- detail ---- */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 shrink-0 text-[var(--primary)]">{icon}</span>
      <div><dt className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--text-muted)]">{label}</dt><dd className="text-[12px] text-[var(--text)]">{value}</dd></div>
    </div>
  );
}

function DetailView() {
  return (
    <div className="grid gap-5 @md:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <p className="text-[11px] text-[var(--text-muted)]"><span style={{ color: "var(--primary-hover)" }} className="font-bold">Cursos</span> / {DC3.category}</p>
        <div className="mt-2 flex items-center gap-2"><StateBadge state="upcoming" /><span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--accent)]">Constancia {DC3.certificate}</span></div>
        <h1 className="mt-2 font-heading text-[24px] font-bold leading-[1.1] text-[var(--text)]">{DC3.title}</h1>
        <p className="mt-2 text-[13px] leading-6 text-[var(--text-muted)]">{DC3.synopsis}</p>

        <div className="mt-4 aspect-[16/8] rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent-light)] via-[var(--primary-light)] to-[var(--muted)]" aria-hidden="true" />

        <dl className="mt-4 grid grid-cols-1 gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4 @sm:grid-cols-2">
          <InfoRow icon={<GraduationCap size={15} aria-hidden="true" />} label="Modalidad" value={DC3.modality} />
          <InfoRow icon={<Clock size={15} aria-hidden="true" />} label="Duración" value={DC3.durationText} />
          <InfoRow icon={<CalendarDays size={15} aria-hidden="true" />} label="Fecha y hora" value={`${DC3.date} · ${DC3.time}`} />
          <InfoRow icon={<MapPin size={15} aria-hidden="true" />} label="Acceso" value="La liga llega por correo" />
        </dl>

        <Section title="Temario">
          <ol className="grid gap-1.5 @sm:grid-cols-2">
            {DC3.topics.map((t, i) => (
              <li key={t} className="flex items-baseline gap-2 text-[12px] text-[var(--text)]"><span className="font-heading text-[11px] font-bold text-[var(--primary-hover)]">{String(i + 1).padStart(2, "0")}</span>{t}</li>
            ))}
          </ol>
        </Section>

        <Section title="Dirigido a">
          <ul className="flex flex-wrap gap-1.5">
            {DC3.audience.map((a) => <li key={a} className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">{a}</li>)}
          </ul>
        </Section>

        <Section title="Instructor">
          <div className="flex gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary-light)] text-[var(--secondary-foreground)]"><UserRound size={18} aria-hidden="true" /></div>
            <div><p className="text-[13px] font-bold text-[var(--text)]">{DC3.instructor.name}</p><p className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">{DC3.instructor.bio}</p></div>
          </div>
        </Section>
      </div>

      {/* sticky purchase card */}
      <aside className="h-fit rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-4">
        <p className="font-heading text-[26px] font-bold text-[var(--primary-hover)]">${DC3.priceAmount} <span className="text-[13px] font-bold text-[var(--text-muted)]">MXN</span></p>
        <p className="text-[11px] text-[var(--text-muted)]">{DC3.priceLabel}</p>
        <button type="button" className="mt-3 h-10 w-full rounded-[var(--radius-sm)] bg-[var(--primary-hover)] text-[13px] font-extrabold text-white transition-transform active:scale-[.98]">Inscribirme</button>
        <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--paper)] p-2.5">
          <QrCode size={28} className="text-[var(--accent)]" aria-hidden="true" />
          <p className="text-[10px] leading-4 text-[var(--text-muted)]">Inscripción rápida por código QR</p>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[var(--moss)]"><GraduationCap size={13} aria-hidden="true" /> Incluye constancia {DC3.certificate}</p>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-5"><h2 className="mb-2 font-heading text-[14px] font-bold text-[var(--text)]">{title}</h2>{children}</section>;
}

/* ---- states ---- */
const stateRows: { state: State; cta: string; note: string }[] = [
  { state: "published", cta: "Inscribirme", note: "Disponible y con cupo." },
  { state: "upcoming", cta: "Reservar lugar", note: "Publicado con fecha futura." },
  { state: "closed", cta: "Avísame si reabre", note: "Cupo lleno: captura de interés." },
  { state: "free", cta: "Inscribirme gratis", note: "price = 0." },
  { state: "pending", cta: "Más información", note: "Fecha u otro dato por confirmar." },
];

function StatesView() {
  return (
    <div className="grid gap-2">
      {stateRows.map((r) => (
        <div key={r.state} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="min-w-0"><StateBadge state={r.state} /><p className="mt-1 text-[11px] text-[var(--text-muted)]">{r.note}</p></div>
          <span className={`shrink-0 rounded-[var(--radius-sm)] px-3 py-1.5 text-[11px] font-extrabold ${r.state === "closed" || r.state === "pending" ? "border border-[var(--primary)] text-[var(--primary-hover)]" : "bg-[var(--primary-hover)] text-white"}`} style={r.state === "closed" || r.state === "pending" ? { color: "var(--primary-hover)" } : undefined}>{r.cta}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- feedback ---- */
function FeedbackView() {
  return (
    <div className="grid gap-3">
      <div role="status" className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
        <LoaderCircle className="animate-spin text-[var(--primary)] motion-reduce:animate-none" size={18} aria-hidden="true" />
        <p className="text-[12px] font-bold text-[var(--text)]">Cargando el catálogo…</p>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-5 text-center">
        <SearchX className="mx-auto text-[var(--text-muted)]" size={22} aria-hidden="true" />
        <p className="mt-2 text-[13px] font-bold text-[var(--text)]">Sin coincidencias</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">Ningún curso coincide con los filtros.</p>
        <span className="mt-3 inline-flex text-[11px] font-extrabold" style={{ color: "var(--primary-hover)" }}>Limpiar filtros</span>
      </div>
      <div role="alert" className="rounded-[var(--radius-md)] border border-[var(--destructive)] bg-[#fdf2f2] p-4">
        <div className="flex gap-3"><AlertCircle className="shrink-0 text-[var(--destructive)]" size={18} aria-hidden="true" /><div><p className="text-[12px] font-bold text-[var(--destructive)]">No pudimos cargar los cursos</p><button type="button" className="mt-2 rounded-[var(--radius-sm)] border border-[var(--destructive)] px-3 py-1 text-[11px] font-extrabold text-[var(--destructive)]">Reintentar</button></div></div>
      </div>
    </div>
  );
}

function ScreenContent({ id }: { id: string }) {
  if (id === "catalog") return (
    <div className="flex flex-col gap-4">
      <SearchAndFilters />
      <FeaturedCard />
      <div className="grid gap-2">
        <CompactCard title="Cumplimiento Ambiental para Empresas" meta="En línea · 6 módulos" state="published" />
        <CompactCard title="Liderazgo Ambiental Universitario" meta="Presencial · Campus Central" state="upcoming" />
        <CompactCard title="Fundamentos de Educación Ambiental" meta="En línea · 6 módulos" state="free" />
      </div>
    </div>
  );
  if (id === "detail") return <DetailView />;
  if (id === "states") return <StatesView />;
  return <FeedbackView />;
}

function Artboard({ label, mobile, children }: { label: string; mobile?: boolean; children: React.ReactNode }) {
  return (
    <section data-viewport={mobile ? "mobile" : "desktop"} className={`overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--paper-warm)] p-3 ${mobile ? "mx-auto w-full max-w-[390px]" : "w-full"}`} aria-label={`${label} del wireframe`}>
      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--text-muted)]">{label}</p>
      <div className="@container rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-4">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <span className="font-heading text-[14px] font-bold text-[var(--accent)]">ELSI</span>
          <span className="text-[11px] font-bold text-[var(--text-muted)]">Catálogo de cursos</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function CursosWireframesPage() {
  const [screenId, setScreenId] = useState("catalog");
  const screen = screens.find((s) => s.id === screenId) ?? screens[0];
  return (
    <main className="bg-[var(--bg)] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link href="/cursos" style={{ color: "var(--accent)" }} className="text-[12px] font-extrabold">← Cursos (live)</Link>
        <div className="mt-4 max-w-3xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--primary)]">ELS-0019 · Referencia de wireframes</p>
          <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Experiencia pública de cursos</h1>
          <p className="mt-3 text-[13px] leading-6 text-[var(--text-muted)]">Catálogo y detalle sobre el modelo canónico (ELS-0013). Demostrativos: no conectan backend, pagos ni correo. Curso destacado real: constancia DC-3.</p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label="Pantallas del wireframe" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {screens.map((s) => (
              <button key={s.id} type="button" onClick={() => setScreenId(s.id)} aria-current={s.id === screenId ? "page" : undefined}
                className={`shrink-0 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-[11px] font-bold transition-colors ${s.id === screenId ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--secondary-foreground)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]"}`}>
                {s.label}
              </button>
            ))}
          </nav>
          <div>
            <section className="mb-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
              <h2 className="font-heading text-[16px] font-bold">{screen.label}</h2>
              <p className="mt-1 text-[12px] text-[var(--text-muted)]">{screen.description}</p>
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <Artboard label="Desktop · 1440 px"><ScreenContent id={screenId} /></Artboard>
              <Artboard label="Mobile · 390 px" mobile><ScreenContent id={screenId} /></Artboard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
