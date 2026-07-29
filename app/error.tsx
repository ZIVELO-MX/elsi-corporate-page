"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PublicRecoveryState } from "@/components/public-recovery-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicRecoveryState icon={<AlertCircle size={27} />} title="No pudimos cargar esta página" actions={<><button type="button" onClick={reset}>Intentar de nuevo</button><Link href="/">Volver al inicio</Link></>}>
      Intenta nuevamente. Si el problema continúa, vuelve al inicio.
    </PublicRecoveryState>
  );
}
