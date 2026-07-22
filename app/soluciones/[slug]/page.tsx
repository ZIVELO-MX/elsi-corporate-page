import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSolutionBySlug, solutions } from "@/lib/solutions";
import { solutionImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";

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

  const image = solutionImages[slug];

  return (
    <main>
      <section className="solution-article" data-section-label={`Soluciones / ${solution.title}`}>
        <div className="shell solution-article-shell">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Soluciones", href: "/soluciones" }, { label: solution.title }]} />
          <Link href="/soluciones" className="solution-back-link">
            <ArrowLeft aria-hidden="true" />
            Volver a soluciones
          </Link>

          <div className="solution-article-header">
            <Badge variant="outline" className="solution-article-badge">Solución ELSI</Badge>
            <h1>{solution.title}</h1>
            <p>{solution.intro}</p>
          </div>

          {image && (
            <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)", aspectRatio: "21 / 9", marginBottom: 40 }}>
              <SafeImage src={image.src} alt={image.alt} loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div className="solution-article-grid">
            <article className="solution-article-content">
              <h2>Una ruta clara para avanzar</h2>
              <p>{solution.approach}</p>

              <h2>Alcance transparente</h2>
              <p>{solution.delivery}</p>
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
