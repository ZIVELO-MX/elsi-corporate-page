import type { ReactNode } from "react";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Wireframes de cursos",
  description: "Referencia interna de la experiencia pública de cursos.",
  path: "/cursos/wireframes",
});

export default function CourseWireframesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
