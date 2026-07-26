import { PublicContactForm } from "@/components/public-contact-form";
import { getPublicCourseBySlug } from "@/lib/courses";
import { getPublicSolutionBySlug } from "@/lib/solutions";

type ContactSearchParams = Promise<{
  curso?: string | string[];
  solucion?: string | string[];
}>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: ContactSearchParams;
}) {
  const params = await searchParams;
  const course = getPublicCourseBySlug(first(params.curso) ?? "");
  const solution = getPublicSolutionBySlug(first(params.solucion) ?? "");
  const context = course
    ? { type: "course" as const, id: course.slug, label: course.title }
    : solution
      ? {
          type: "solution" as const,
          id: solution.slug,
          label: solution.title,
        }
      : undefined;
  const defaultMessage = course
    ? `Me interesa recibir información sobre el curso ${course.title}.`
    : solution
      ? `Me interesa recibir información sobre ${solution.title}.`
      : "";

  return (
    <main>
      <section
        className="contact-section"
        data-section-label="Contacto / Formulario"
      >
        <div className="contact-grid">
          <header className="contact-intro">
            <span className="section-kicker">Contacto</span>
            <h1 className="contact-title">
              Escríbenos y compártenos qué necesitas aprender o resolver
            </h1>
            <p className="contact-lede">
              Cuéntanos el contexto. ELSI podrá orientar el curso, la solución o
              el programa adecuado.
            </p>
            {context ? (
              <p className="contact-context">
                Consulta seleccionada: <strong>{context.label}</strong>
              </p>
            ) : null}
          </header>
          <PublicContactForm
            className="contact-form"
            buttonClassName="contact-submit"
            buttonLabel="Enviar mensaje"
            context={context}
            defaultMessage={defaultMessage}
            idPrefix="contact"
            statusClassName="contact-sent"
          />
          <div className="contact-info" aria-label="Canales de contacto">
            <div>
              <strong>Teléfono:</strong>{" "}
              <a href="tel:+523921104719">392-110-4719</a>
            </div>
            <div>
              <strong>Correo:</strong>{" "}
              <a href="mailto:instituteelsi@gmail.com">
                instituteelsi@gmail.com
              </a>
            </div>
            <div>
              <strong>Ubicación:</strong> Guanajuato, México
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
