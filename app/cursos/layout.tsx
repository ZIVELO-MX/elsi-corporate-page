import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

// The catalog page is a client component, so its metadata lives here. Course
// detail pages override this via their own generateMetadata.
export const metadata = buildMetadata({
  title: "Cursos",
  description: "Catálogo de cursos de ELSI: educación ambiental, normatividad y habilidades, en línea y presenciales.",
  path: "/cursos",
});

export default function CursosLayout({ children }: { children: ReactNode }) {
  return children;
}
