import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, GraduationCap, MapPin, QrCode, UserRound } from "lucide-react";
import { getCourseBySlug, getAllCourses, money, modalityLabel, stateMeta, publishState, certType } from "@/lib/courses";
import { SafeImage } from "@/components/safe-image";
import { courseImages } from "@/lib/image-assets";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ slug: course.slug }));
}

const TONE: Record<string, string> = {
  teal: "bg-[var(--primary-light)] text-[var(--secondary-foreground)]",
  purple: "bg-[var(--accent-light)] text-[var(--accent)]",
  muted: "bg-[var(--muted)] text-[var(--text-muted)]",
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 shrink-0 text-[var(--primary)]">{icon}</span>
      <div><dt className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--text-muted)]">{label}</dt><dd className="text-[13px] text-[var(--text)]">{value}</dd></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-6"><h2 className="mb-2.5 font-heading text-[15px] font-bold text-[var(--text)]">{title}</h2>{children}</section>;
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const img = courseImages[course.slug];
  const m = stateMeta(course);
  const online = course.modality !== "presencial";

  return (
    <main>
      <section data-section-label="Detalle curso / Contenido" style={{ padding: "48px 0 72px" }}>
        <div className="shell">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Cursos", href: "/cursos" }, { label: course.title }]} />
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* main */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[.06em] ${TONE[m.tone]}`}>{m.label}</span>
                {course.certificateType && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--accent)]"><GraduationCap size={11} aria-hidden="true" />Constancia {certType(course)}</span>}
              </div>
              <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.08] text-[var(--text)]">{course.title}</h1>
              <p className="mt-2.5 text-[14px] leading-7 text-[var(--text-muted)] max-w-[65ch]">{course.description}</p>

              <div className="mt-4 aspect-[16/8] overflow-hidden rounded-[var(--radius-md)] bg-[var(--muted)]">
                {img ? <SafeImage src={img.src} alt={img.alt} width={1200} height={600} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="size-full bg-gradient-to-br from-[var(--accent-light)] via-[var(--primary-light)] to-[var(--muted)]" aria-hidden="true" />}
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4 sm:grid-cols-2">
                <InfoRow icon={<GraduationCap size={16} aria-hidden="true" />} label="Modalidad" value={modalityLabel(course)} />
                <InfoRow icon={<Clock size={16} aria-hidden="true" />} label="Duración" value={course.duration} />
                {course.schedule && <InfoRow icon={<CalendarDays size={16} aria-hidden="true" />} label="Fecha y hora" value={`${course.schedule.date} · ${course.schedule.time}`} />}
                {online
                  ? <InfoRow icon={<MapPin size={16} aria-hidden="true" />} label="Acceso" value="La liga del curso llega por correo" />
                  : course.place && <InfoRow icon={<MapPin size={16} aria-hidden="true" />} label="Lugar" value={course.place} />}
              </dl>

              <Section title={course.durationType === "modules" ? "Temario" : "Contenido"}>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <ol className="grid gap-2.5">
                    {course.curriculum.map((t, i) => (
                      <li key={t.tema} className="text-[13px] text-[var(--text)]">
                        <div className="flex items-baseline gap-2"><span className="font-heading text-[11px] font-bold text-[var(--primary-hover)]">{String(i + 1).padStart(2, "0")}</span><span className="font-semibold">{t.tema}</span></div>
                        {t.subtemas && t.subtemas.length > 0 && (
                          <ul className="mt-1 ml-6 grid gap-1">
                            {t.subtemas.map((s) => (
                              <li key={s} className="text-[12px] leading-5 text-[var(--text-muted)]">– {s}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="grid gap-1.5 sm:grid-cols-2">
                    {course.moduleList.map((t, i) => (
                      <li key={t} className="flex items-baseline gap-2 text-[13px] text-[var(--text)]"><span className="font-heading text-[11px] font-bold text-[var(--primary-hover)]">{String(i + 1).padStart(2, "0")}</span>{t}</li>
                    ))}
                  </ol>
                )}
              </Section>

              {course.objectives && course.objectives.length > 0 && (
                <Section title="Objetivos"><ul className="grid gap-1.5">{course.objectives.map((o) => <li key={o} className="text-[13px] leading-6 text-[var(--text-muted)]">• {o}</li>)}</ul></Section>
              )}

              {course.targetAudience && course.targetAudience.length > 0 && (
                <Section title="Dirigido a"><ul className="flex flex-wrap gap-1.5">{course.targetAudience.map((a) => <li key={a} className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[12px] text-[var(--text-muted)]">{a}</li>)}</ul></Section>
              )}

              {course.requirements && course.requirements.length > 0 && (
                <Section title="Requisitos"><ul className="grid gap-1.5">{course.requirements.map((r) => <li key={r} className="text-[13px] leading-6 text-[var(--text-muted)]">• {r}</li>)}</ul></Section>
              )}

              {course.instructor && (
                <Section title="Instructor">
                  <div className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-3.5">
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--primary-light)] text-[var(--secondary-foreground)]"><UserRound size={20} aria-hidden="true" /></div>
                    <div><p className="text-[14px] font-bold text-[var(--text)]">{course.instructor.name}</p>{course.instructor.bio && <p className="mt-0.5 text-[12px] leading-5 text-[var(--text-muted)]">{course.instructor.bio}</p>}</div>
                  </div>
                </Section>
              )}
            </div>

            {/* purchase card */}
            <aside className="h-fit rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-6">
              <p className="font-heading text-[28px] font-bold text-[var(--primary-hover)]">{money(course.price)}</p>
              {course.priceLabel && course.price > 0 && <p className="text-[12px] text-[var(--text-muted)]">{course.priceLabel}</p>}
              {publishState(course) === "closed" ? (
                <Link href={`/contacto?curso=${course.slug}`} style={{ color: "var(--primary-hover)" }} className="mt-3 flex h-11 w-full items-center justify-center rounded-[8px] border border-[var(--primary)] text-[14px] font-extrabold transition-transform active:scale-[.98]">{m.cta}</Link>
              ) : (
                <Link href={`/contacto?curso=${course.slug}`} style={{ color: "#fff" }} className="mt-3 flex h-11 w-full items-center justify-center rounded-[8px] bg-[var(--primary-hover)] text-[14px] font-extrabold transition-transform active:scale-[.98]">{m.cta}</Link>
              )}
              <div className="mt-3 flex items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--paper)] p-2.5">
                <QrCode size={30} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">Inscripción rápida por código QR (te lo compartimos al confirmar).</p>
              </div>
              {course.certificateType && <p className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-[var(--moss)]"><GraduationCap size={14} aria-hidden="true" /> Incluye constancia {certType(course)}</p>}
              <Link href="/cursos" style={{ color: "var(--primary-hover)" }} className="mt-4 block text-center text-[12px] font-extrabold">← Volver al catálogo</Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
