import { PublicContactForm } from "@/components/public-contact-form";
import { Mail, MapPin, Phone } from "lucide-react";
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
            <h1 className="contact-title">Conversemos sobre lo que necesitas resolver</h1>
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
          <aside className="contact-info" aria-label="Canales de contacto">
            <p className="contact-info-title">También puedes contactarnos por</p>
            <ul>
              <li><Phone aria-hidden="true" size={17} /><a href="tel:+523921104719"><span>Teléfono</span>392-110-4719</a></li>
              <li><Mail aria-hidden="true" size={17} /><a href="mailto:instituteelsi@gmail.com"><span>Correo</span>instituteelsi@gmail.com</a></li>
              <li><MapPin aria-hidden="true" size={17} /><p><span>Ubicación</span>Guanajuato, México</p></li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
