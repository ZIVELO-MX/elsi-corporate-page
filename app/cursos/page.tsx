"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllCourses, money } from "@/lib/courses";
import { courseImages } from "@/lib/image-assets";
import { SafeImage } from "@/components/safe-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const allCourses = getAllCourses();

export default function CursosPage() {
  const [cat, setCat] = useState("todos");

  const visible = cat === "todos" ? allCourses : allCourses.filter((c) => c.cat === cat);

  return (
    <main>
      <div className="shell page-header" style={{ paddingBottom: 0 }}>
        <span className="section-kicker">Catálogo propuesto</span>
        <h1>Catálogo de cursos</h1>
        <p>Explora la oferta formativa propuesta para la nueva web corporativa. La inscripción y compra automatizada quedan fuera de esta fase.</p>
      </div>

      <section style={{ padding: "28px 0 72px" }}>
        <div className="shell">
          <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            {[
              { key: "todos", label: "Todos" },
              { key: "sost", label: "Sostenibilidad" },
              { key: "norm", label: "Normatividad" },
              { key: "hab", label: "Habilidades" },
            ].map(({ key, label }) => {
              return (
                <button
                  key={key}
                  type="button"
                  className="course-filter"
                  aria-pressed={cat === key}
                  onClick={() => setCat(key)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="cursos-catalogo-grid">
            {visible.map((course) => (
              <Link key={course.id} href={`/cursos/${course.slug}`} className="catalog-course-link">
                <Card className="catalog-course-card">
                  <div className="catalog-course-media">
                    <SafeImage
                      src={courseImages[course.slug].src}
                      alt={courseImages[course.slug].alt}
                      width={900}
                      height={600}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <CardHeader>
                    <div className="catalog-course-meta">
                      <Badge variant="outline" style={{ borderColor: "var(--primary)", color: "var(--primary)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".07em" }}>{course.catLabel}</Badge>
                      <span>{course.status === "Publicado" ? "Propuesta" : "Por validar"}</span>
                    </div>
                    <CardTitle style={{ fontSize: 14, lineHeight: 1.3 }}>{course.title}</CardTitle>
                    <CardDescription style={{ fontSize: 11.5 }}>{course.modules} módulos</CardDescription>
                  </CardHeader>
                  <CardContent style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14.5, color: "var(--primary)" }}>{money(course.price)}</span>
                    <span className="catalog-course-cta">Ver curso</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
