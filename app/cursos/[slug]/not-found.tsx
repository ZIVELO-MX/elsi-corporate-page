import Link from "next/link";
import { SearchX } from "lucide-react";
import { PublicRecoveryState } from "@/components/public-recovery-state";

// Shown when getCourseBySlug() → notFound() for an unknown/removed course slug.
export default function CourseNotFound() {
  return (
    <PublicRecoveryState
      icon={<SearchX size={27} />}
      title="Curso no encontrado"
      actionsLabel="Rutas para continuar"
      actions={<Link href="/cursos">Ver todos los cursos</Link>}
    >
      El curso que buscas no existe o ya no está disponible.
    </PublicRecoveryState>
  );
}
