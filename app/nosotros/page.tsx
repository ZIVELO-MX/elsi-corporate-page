import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { siteImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Nosotros",
  description: "La historia de ELSI: de la iniciativa estudiantil Bee Blue a un instituto de educación y soluciones ambientales.",
  path: "/nosotros",
});

const timelineItems = [
  { num: "2019", style: "filled", label: "Bee Blue", desc: "Nace la iniciativa estudiantil enfocada en educación y concientización ambiental." },
  { num: "UG", style: "outlined", label: "Comunidad universitaria", desc: "El movimiento crea actividades de aprendizaje ambiental en Guanajuato." },
  { num: "Aula", style: "outlined", label: "Experiencias formativas", desc: "Conferencias, talleres y actividades acercan el aprendizaje a la práctica." },
  { num: "ELSI", style: "filled", label: "Evolución del proyecto", desc: "La iniciativa amplía su trabajo hacia capacitación y soluciones ambientales." },
];

export default function NosotrosPage() {
  return (
    <main>
      <div className="shell page-header about-header reveal">
        <span className="section-kicker">Quiénes somos</span>
        <h1>De una iniciativa estudiantil a un instituto con proyección internacional</h1>
        <p>ELSI nace de Bee Blue, un movimiento universitario que demostró que la educación ambiental puede transformar comunidades enteras.</p>
      </div>

      <div className="shell" style={{ marginBottom: 48 }}>
        <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)", aspectRatio: "21 / 9" }}>
          <SafeImage
            src={siteImages.story.src}
            alt={siteImages.story.alt}
            width={siteImages.story.width}
            height={siteImages.story.height}
            loading="eager"
            sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1440px) calc(100vw - 96px), 1264px"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      <section className="about-timeline-section" data-section-label="Nosotros / Línea de tiempo">
        <div className="shell">
          <div className="timeline-lg">
            {timelineItems.map((item) => (
              <div key={item.label} className="timeline-lg-item">
                <div className={`timeline-lg-num ${item.style}`}>{item.num}</div>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section-label="Nosotros / Misión visión valores" style={{ background: "#EFEDE4", padding: "56px 0" }}>
        <div className="shell">
          <div className="mvv-grid">
            {[
              { title: "Misión", text: "Compartir conocimiento desde los valores éticos y pedagógicos que requiere esta labor, siempre apegados a nuestra responsabilidad como seres humanos de cuidar nuestro planeta." },
              { title: "Visión", text: "Ser la institución líder en consultoría ambiental a nivel internacional, reconocida por transformar la gestión de los recursos naturales mediante la innovación educativa y soluciones sostenibles que garanticen el bienestar del planeta." },
              { title: "Valores", text: "Compromiso, innovación, cercanía, integridad y pasión por el impacto real." },
            ].map((item) => (
              <Card key={item.title} style={{ boxShadow: "none", border: "none", background: "transparent", borderTop: "3px solid var(--primary)", borderRadius: 0, paddingTop: 20 }}>
                <CardContent style={{ padding: 0 }}>
                  <strong style={{ fontSize: 19, fontFamily: "var(--font-sora), sans-serif" }}>{item.title}</strong>
                  <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section data-section-label="Nosotros / CTA cursos" style={{ background: "#EFEDE4", padding: "64px 0", textAlign: "center" }}>
        <div className="shell about-cta">
          <h2>Conoce la oferta formativa de ELSI</h2>
          <p>El siguiente paso natural después de la historia es explorar los cursos propuestos o solicitar orientación para elegir un programa.</p>
          <div className="about-cta-actions">
            <Button asChild size="lg" variant="primary">
              <Link href="/cursos">Explora nuestros cursos</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contacto">Solicitar información</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
