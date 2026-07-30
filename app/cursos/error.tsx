"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { PublicRecoveryState } from "@/components/public-recovery-state";

// Error boundary for the /cursos segment: recover in place (reset) or exit.
export default function CoursesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PublicRecoveryState
      icon={<TriangleAlert size={27} />}
      title="No pudimos mostrar los cursos"
      actions={(
        <>
          <button type="button" onClick={reset}>Reintentar</button>
          <Link href="/cursos">Volver al catálogo</Link>
        </>
      )}
    >
      Intenta de nuevo o vuelve al catálogo para continuar.
    </PublicRecoveryState>
  );
}
