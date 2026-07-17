import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getCourseBySlug, getAllCourses, money } from "@/lib/courses";
import { SafeImage } from "@/components/safe-image";
import { courseImages } from "@/lib/image-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ slug: course.slug }));
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) notFound();
  const image = courseImages[course.slug];

  return (
    <main>
      <section data-section-label="Detalle curso / Contenido" style={{ padding: "56px 0" }}>
        <div className="shell">
          <div className="breadcrumb">
            <Link href="/cursos">Cursos</Link> / {course.title}
          </div>
          <div className="curso-detail-grid">
            <div>
              <div className="curso-detail-hero">
                <SafeImage src={image.src} alt={image.alt} width={1200} height={800} />
              </div>
              <Badge variant="outline" style={{ borderColor: "var(--primary)", color: "var(--primary)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{course.catLabel}</Badge>
              <h1 className="curso-detail-h1">{course.title}</h1>
              <p className="curso-detail-desc">{course.description}</p>
              <strong style={{ fontSize: 15, display: "block", marginBottom: 14 }}>Contenido del curso</strong>
              <div className="curso-detail-modules">
                {course.moduleList.map((mod) => (
                  <div key={mod} className="curso-detail-module">
                    <div className="curso-detail-check"><Check size={13} strokeWidth={2.5} aria-hidden="true" /></div>
                    {mod}
                  </div>
                ))}
              </div>
            </div>
            <Card className="curso-sidebar" style={{ boxShadow: "none" }}>
              <CardContent style={{ padding: 28 }}>
                <strong style={{ fontFamily: "'Sora',sans-serif", fontSize: 30, color: "var(--primary)", display: "block", marginBottom: 6 }}>{money(course.price)}</strong>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{course.modules} módulos · programa propuesto</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                  <Button asChild variant="primary" style={{ width: "100%" }}>
                    <Link href={`/contacto?curso=${course.slug}`}>Solicitar información</Link>
                  </Button>
                  <Button asChild variant="outline" style={{ width: "100%" }}>
                    <Link href="/cursos">Volver al catálogo</Link>
                  </Button>
                </div>
                <p style={{ margin: "16px 0 0", fontSize: 11.5, color: "var(--text-light)", lineHeight: 1.5 }}>La inscripción automatizada y el checkout no forman parte de esta fase corporativa.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
