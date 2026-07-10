import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSolutionBySlug, solutions } from "@/lib/solutions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SolutionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return solutions.map((solution) => ({
    slug: solution.slug,
  }));
}

export async function generateMetadata({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    return {
      title: "Solución no encontrada | ELSI",
    };
  }

  return {
    title: `${solution.title} | ELSI`,
    description: solution.description,
  };
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  return (
    <main>
      <section className="solution-article" data-section-label={`Soluciones / ${solution.title}`}>
        <div className="shell solution-article-shell">
          <Link href="/soluciones" className="solution-back-link">
            <ArrowLeft aria-hidden="true" />
            Volver a soluciones
          </Link>

          <div className="solution-article-header">
            <Badge variant="outline" className="solution-article-badge">Solución ELSI</Badge>
            <h1>{solution.title}</h1>
            <p>{solution.intro}</p>
          </div>

          <div className="solution-article-grid">
            <article className="solution-article-content">
              <h2>Una ruta clara para avanzar</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis, justo sed
                dictum finibus, sem nisl facilisis risus, vitae viverra neque erat sed justo.
              </p>
              <p>
                Donec consequat, nibh vitae luctus tincidunt, magna lacus viverra arcu, sed rhoncus
                mi justo at erat. La propuesta se adapta al contexto de cada organización y prioriza
                acciones comprensibles, medibles y sostenibles.
              </p>

              <h2>Cómo trabajamos</h2>
              <p>
                Praesent sed justo nec arcu varius volutpat. Aenean sed sem eget augue luctus
                hendrerit. Cada proyecto se plantea con objetivos concretos, sesiones de seguimiento
                y materiales que facilitan la implementación.
              </p>
            </article>

            <aside className="solution-article-aside">
              <h2>Qué incluye</h2>
              <ul>
                {solution.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button asChild variant="primary" className="solution-article-button">
                <Link href="/contacto">Solicitar información <ArrowRight data-icon="inline-end" /></Link>
              </Button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
