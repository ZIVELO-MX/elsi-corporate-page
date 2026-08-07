import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  certType,
  getPublicCourseBySlug,
  getPublicCourses,
  isCourseVerified,
  modalityLabel,
  money,
  publishState,
  stateMeta,
  type PublishState,
} from "@/lib/courses";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CourseMedia } from "@/components/course-media";
import { PrototypeDataNote } from "@/components/prototype-data-note";
import { StructuredData } from "@/components/structured-data";
import {
  buildCourseJsonLd,
  buildMetadata,
  buildPrivateMetadata,
  indexable,
} from "@/lib/seo";
import { buildContactPath } from "@/lib/agentic-navigation";
import { getPublicCourse, listPublicCourses } from "@/lib/courses-repository";
import { currentUserHasEnrollment } from "@/lib/enrollments-repository";
import { getCardPaymentsEnabled } from "@/lib/payment-settings";

export async function generateStaticParams() {
  const persisted = await listPublicCourses();
  return (persisted === null ? getPublicCourses() : persisted).map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const persisted = await getPublicCourse(slug);
  const course = persisted === null ? getPublicCourseBySlug(slug) : persisted;
  if (!course) {
    return buildPrivateMetadata({
      title: "Curso no encontrado",
      path: `/cursos/${slug}`,
    });
  }
  return buildMetadata({
    title: course.title,
    description: course.description,
    path: `/cursos/${course.slug}`,
    allowIndexing: indexable && isCourseVerified(course),
  });
}

const inquiryLabels: Record<PublishState, string> = {
  published: "Solicitar inscripción",
  upcoming: "Solicitar información",
  closed: "Avísame si reabre",
  pending: "Solicitar información",
  draft: "Consultar disponibilidad",
};

function CourseFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="course-detail-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="course-detail-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const persisted = await getPublicCourse(slug);
  const course = persisted === null ? getPublicCourseBySlug(slug) : persisted;
  if (!course) notFound();

  const state = publishState(course);
  const availability = stateMeta(course).label;
  const alreadyEnrolled = await currentUserHasEnrollment(course.id);
  const cardPaymentsEnabled = await getCardPaymentsEnabled();
  const online = course.modality !== "presencial";
  const checkoutAvailable = state === "published"
    && course.price > 0
    && !alreadyEnrolled;
  const actionHref = alreadyEnrolled
    ? "/profile"
    : checkoutAvailable
    ? `/checkout?curso=${encodeURIComponent(course.slug)}`
    : buildContactPath({ course: course.slug });

  return (
    <main>
      {indexable && isCourseVerified(course) ? (
        <StructuredData value={buildCourseJsonLd(course)} />
      ) : null}

      <section className="course-detail-hero" data-section-label="Detalle curso / Contenido">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Cursos", href: "/cursos" }, { label: course.title, href: `/cursos/${course.slug}` }]} />
          <div className="course-detail-hero-grid">
            <header className="course-detail-intro">
              <p className="course-detail-kicker">Curso {modalityLabel(course).toLowerCase()}</p>
              <h1>{course.title}</h1>
              <p className="course-detail-description">{course.description}</p>
              {persisted === null || course.contentStatus === "fixture" ? <PrototypeDataNote>
                Mostrando la ficha de referencia mientras se configura el catálogo validado de ELSI.
              </PrototypeDataNote> : null}
            </header>
            <figure className="course-detail-media">
              <CourseMedia
                course={course}
                variant="detail"
                loading="eager"
                sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) 46vw, 660px"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="course-detail-overview">
        <div className="shell course-detail-overview-grid">
          <dl className="course-detail-facts">
            <CourseFact label="Modalidad" value={modalityLabel(course)} />
            <CourseFact label="Duración" value={course.duration} />
            {course.schedule ? <CourseFact label="Fecha y hora" value={`${course.schedule.date} · ${course.schedule.time}`} /> : null}
            {online ? <CourseFact label="Acceso" value="La liga del curso llega por correo" /> : null}
            {!online && course.place ? <CourseFact label="Lugar" value={course.place} /> : null}
          </dl>

          <aside className="course-detail-decision" aria-labelledby="course-decision-title">
            <p className="course-detail-price">{money(course.price)}</p>
            {course.priceLabel && course.price > 0 ? <p className="course-detail-price-note">{course.priceLabel}</p> : null}
            <p id="course-decision-title" className="course-detail-availability">Disponibilidad: {availability}</p>
            {alreadyEnrolled ? <span className="course-enrollment-badge">Ya inscrito</span> : null}
            {course.certificateType ? <p className="course-detail-certificate">Incluye constancia {certType(course)}</p> : null}
            <Link className={`course-detail-action${state === "closed" ? " is-secondary" : ""}`} href={actionHref}>
              {alreadyEnrolled ? "Ver mi perfil" : checkoutAvailable ? "Inscribirme y pagar" : inquiryLabels[state]}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <p className="course-detail-action-note">
              {alreadyEnrolled ? "Ya tienes una inscripción activa para este curso." : checkoutAvailable && cardPaymentsEnabled ? "Completa tus datos para continuar al pago seguro con Stripe." : checkoutAvailable ? "Completa tus datos para enviar una solicitud a ELSI." : "ELSI confirmará disponibilidad y los siguientes pasos por correo."}
            </p>
          </aside>
        </div>
      </section>

      <section className="course-detail-content">
        <div className="shell course-detail-content-grid">
          <DetailSection title={course.durationType === "modules" ? "Temario" : "Contenido"}>
            {course.curriculum && course.curriculum.length > 0 ? (
              <ol className="course-detail-curriculum">
                {course.curriculum.map((topic, index) => (
                  <li key={topic.tema}>
                    <div><span>{String(index + 1).padStart(2, "0")}</span><strong>{topic.tema}</strong></div>
                    {topic.subtemas && topic.subtemas.length > 0 ? (
                      <ul>{topic.subtemas.map((subtopic) => <li key={subtopic}>{subtopic}</li>)}</ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="course-detail-module-list">
                {course.moduleList.map((module, index) => (
                  <li key={module}><span>{String(index + 1).padStart(2, "0")}</span>{module}</li>
                ))}
              </ol>
            )}
          </DetailSection>

          {(course.objectives?.length || course.targetAudience?.length || course.requirements?.length || course.instructor) ? (
            <div className="course-detail-support">
              {course.objectives && course.objectives.length > 0 ? (
                <DetailSection title="Objetivos"><ul className="course-detail-list">{course.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></DetailSection>
              ) : null}
              {course.targetAudience && course.targetAudience.length > 0 ? (
                <DetailSection title="Dirigido a"><ul className="course-detail-list">{course.targetAudience.map((audience) => <li key={audience}>{audience}</li>)}</ul></DetailSection>
              ) : null}
              {course.requirements && course.requirements.length > 0 ? (
                <DetailSection title="Requisitos"><ul className="course-detail-list">{course.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></DetailSection>
              ) : null}
              {course.instructor ? (
                <DetailSection title="Instructor">
                  <div className="course-detail-instructor">
                    <p>{course.instructor.name}</p>
                    {course.instructor.bio ? <p>{course.instructor.bio}</p> : null}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
