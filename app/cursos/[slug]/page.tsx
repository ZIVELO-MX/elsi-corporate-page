import Link from "next/link";
import { notFound } from "next/navigation";
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
      <section style={{ padding: "56px 0" }}>
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
                    <div className="curso-detail-check">✓</div>
                    {mod}
                  </div>
                ))}
              </div>
            </div>
            <Card className="curso-sidebar" style={{ boxShadow: "none" }}>
              <CardContent style={{ padding: 28 }}>
                <strong style={{ fontFamily: "'Sora',sans-serif", fontSize: 30, color: "var(--primary)", display: "block", marginBottom: 6 }}>{money(course.price)}</strong>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{course.modules} módulos · certificado incluido</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                  <Button variant="outline" style={{ width: "100%", borderColor: "var(--primary)", color: "var(--primary)" }}>Agregar al carrito</Button>
                  <Button style={{ width: "100%", background: "var(--primary)" }}>Comprar ahora</Button>
                </div>
                <p style={{ margin: "16px 0 0", fontSize: 11.5, color: "var(--text-light)", lineHeight: 1.5 }}>Necesitas una cuenta ELSI para inscribirte y ver tu progreso.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
