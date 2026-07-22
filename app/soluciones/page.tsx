import Link from "next/link";
import { ArrowDown, ArrowRight, Building2, GraduationCap, Sprout, type LucideIcon } from "lucide-react";
import { solutions, type Solution } from "@/lib/solutions";
import { solutionImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";

const solutionIcons: Record<Solution["slug"], LucideIcon> = {
  capacitacion: GraduationCap,
  "soluciones-ambientales": Building2,
  "educacion-universitaria": Sprout,
};

export default function SolucionesPage() {
  return (
    <main>
      <section className="solutions-editorial-hero" data-section-label="Soluciones / Introducción">
        <div className="shell solutions-editorial-hero-grid">
          <div>
            <p className="home-kicker">Soluciones ELSI</p>
            <h1>Tres formas de convertir el conocimiento ambiental en una ruta de trabajo.</h1>
          </div>
          <div className="solutions-editorial-lede">
            <p>
              Cada capítulo responde a un contexto distinto. Elige entre formación, acompañamiento técnico o experiencias para comunidades universitarias.
            </p>
            <a href="#indice-soluciones" className="home-text-link">Comparar las rutas <ArrowDown aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <nav id="indice-soluciones" className="solutions-editorial-index" aria-label="Índice de soluciones">
        <ol className="shell">
          {solutions.map((solution, index) => (
            <li key={solution.slug}>
              <a href={`#${solution.slug}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{solution.title}</strong>
                <small>{solution.audience}</small>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="solution-chapters">
        {solutions.map((solution, index) => {
          const Icon = solutionIcons[solution.slug];
          const image = solutionImages[solution.slug];
          const titleId = `${solution.slug}-title`;

          return (
            <section
              key={solution.slug}
              id={solution.slug}
              className="solution-chapter"
              data-layout={solution.layout}
              aria-labelledby={titleId}
              data-section-label={`Soluciones / ${solution.title}`}
            >
              <div className="shell solution-chapter-grid">
                <div className="solution-chapter-copy">
                  <div className="solution-chapter-heading">
                    <span className="solution-chapter-icon" aria-hidden="true"><Icon /></span>
                    <div>
                      <p className="solution-chapter-number">{String(index + 1).padStart(2, "0")} · {solution.eyebrow}</p>
                      <h2 id={titleId}>{solution.title}</h2>
                    </div>
                  </div>

                  <p className="solution-chapter-intro">{solution.intro}</p>

                  <dl className="solution-chapter-facts">
                    <div>
                      <dt>Para quién</dt>
                      <dd>{solution.audience}</dd>
                    </div>
                    <div>
                      <dt>Cómo se trabaja</dt>
                      <dd>{solution.approach}</dd>
                    </div>
                  </dl>

                  <div className="solution-chapter-scope">
                    <h3>Líneas de trabajo</h3>
                    <ul>
                      {solution.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="solution-chapter-note">{solution.delivery}</p>

                  <Button asChild variant={solution.layout === "technical" ? "inverse" : "primary"}>
                    <Link
                      href={`/soluciones/${solution.slug}`}
                      style={solution.layout === "technical" ? { color: "var(--primary-hover)" } : undefined}
                    >
                      Conocer {solution.title.toLocaleLowerCase("es-MX")} <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>

                <figure className="solution-chapter-media">
                  <SafeImage
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={700}
                    sizes="(max-width: 800px) 100vw, 52vw"
                  />
                  <figcaption>Archivo ELSI · {solution.imageCaption}</figcaption>
                </figure>
              </div>
            </section>
          );
        })}
      </div>

      <section className="solutions-editorial-contact" data-section-label="Soluciones / Contacto">
        <div className="shell">
          <p className="home-kicker">¿No sabes cuál elegir?</p>
          <h2>Describe el contexto y definamos el punto de partida.</h2>
          <p>La primera conversación sirve para orientar la ruta; no sustituye la definición de alcance de una propuesta.</p>
          <Button asChild size="lg">
            <Link href="/contacto">Solicitar información <ArrowRight data-icon="inline-end" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
