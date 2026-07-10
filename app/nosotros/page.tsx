import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { siteImages } from "@/lib/image-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const timelineItems = [
  { num: "2019", style: "filled", label: "Bee Blue", desc: "Nace la iniciativa estudiantil enfocada en educación y concientización ambiental.", status: "Validar año exacto" },
  { num: "UG", style: "outlined", label: "Universidad de Guanajuato", desc: "El movimiento crece dentro de la comunidad universitaria.", status: "Validar hitos por campus" },
  { num: "+2.2k", style: "outlined", label: "Miles de estudiantes", desc: "Conferencias, talleres, cursos, congresos, eventos y dinámicas.", status: "Dato publicado" },
  { num: "ELSI", style: "filled", label: "Nace ELSI", desc: "La iniciativa se profesionaliza como instituto de aprendizaje y soluciones.", status: "Validar fecha" },
  { num: "B2B", style: "outlined", label: "Consultoría y capacitación", desc: "La oferta se extiende a empresas, instituciones y comunidades.", status: "Validar casos" },
  { num: "2026", style: "outlined", label: "Nueva web corporativa", desc: "Migración hacia una experiencia clara para cursos y contacto.", status: "En progreso" },
];

const researchItems = [
  "Años e hitos reales de Bee Blue y transición a ELSI.",
  "Logo vectorial, colores oficiales y usos permitidos de marca.",
  "Fotografías en alta resolución de talleres, eventos y equipo.",
  "Catálogo real de cursos, nombres, módulos, precios y disponibilidad.",
  "Confirmación de cifras adicionales antes de publicarlas como logros.",
];

const teamMembers = [
  {
    name: "Emmanuel Pimentel Cerrillos",
    role: "Asesor ELSI",
    stat: "+50 talleres impartidos",
    email: "e.pimentelcerrillos@ugto.mx",
    avatar: "https://elsyacademy.me/wp-content/uploads/2026/04/IMG_2639-1024x573.jpeg",
  },
  {
    name: "Aldo Espinoza Tapia",
    role: "Asesor ELSI",
    stat: "Especialista en cumplimiento ambiental",
    email: "a.espinozatapia@ugto.mx",
    avatar: "https://elsyacademy.me/wp-content/uploads/2026/04/5c69e245-42eb-4179-ac5c-6b6c9716e0ec.jpeg",
  },
];

export default function NosotrosPage() {
  return (
    <main>
      <div className="shell page-header about-header reveal">
        <span className="section-kicker">Quiénes somos</span>
        <h1>De una iniciativa estudiantil a un instituto con proyección internacional</h1>
        <p>ELSI nace de Bee Blue, un movimiento universitario que demostró que la educación ambiental puede transformar comunidades enteras.</p>
      </div>

      <section className="about-timeline-section" data-section-label="Nosotros / Línea de tiempo">
        <div className="shell">
          <div className="timeline-lg">
            {timelineItems.map((item) => (
              <div key={item.label} className="timeline-lg-item">
                <div className={`timeline-lg-num ${item.style}`}>{item.num}</div>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-research" data-section-label="Nosotros / Por investigar">
        <div className="shell about-research-grid">
          <div>
            <span className="section-kicker">Por investigar</span>
            <h2 className="section-title">La historia debe crecer con evidencia, no con relleno.</h2>
            <p className="section-lede">Estos puntos deben validarse antes de cerrar la versión aprobada de la web corporativa. Mientras tanto, la narrativa se mantiene clara y marcada como propuesta cuando corresponde.</p>
          </div>
          <ul className="research-list">
            {researchItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
                  <strong style={{ fontSize: 19, fontFamily: "'Sora',sans-serif" }}>{item.title}</strong>
                  <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section data-section-label="Nosotros / Equipo" style={{ padding: "64px 0" }}>
        <div className="shell">
          <span style={{ display: "block", marginBottom: 28, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--primary)" }}>Nuestro equipo</span>
          <div className="team-grid">
            {teamMembers.map((person) => (
              <Card key={person.name} className="team-card" style={{ boxShadow: "none" }}>
                <CardContent className="team-card-content" style={{ padding: 24 }}>
                  <div className="team-avatar">
                    <SafeImage src={person.avatar} alt={siteImages.team.alt} width={160} height={160} />
                  </div>
                  <div>
                    <div className="team-name">{person.name}</div>
                    <div className="team-role">{person.role}</div>
                    <div className="team-stat">{person.stat}</div>
                    <a className="team-email" href={`mailto:${person.email}`}>{person.email}</a>
                  </div>
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
