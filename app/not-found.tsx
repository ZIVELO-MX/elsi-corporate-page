import Link from "next/link";
import { SearchX } from "lucide-react";
import { buildPrivateMetadata } from "@/lib/seo";
import { PublicRecoveryState } from "@/components/public-recovery-state";

export const metadata = buildPrivateMetadata({
  title: "Página no encontrada",
  description: "La página solicitada no está disponible.",
  path: "/404",
});

export default function NotFound() {
  return (
    <PublicRecoveryState icon={<SearchX size={27} />} eyebrow="Error 404" title="No encontramos esta página" actions={<><Link href="/">Ir al inicio</Link><Link href="/cursos">Ver cursos</Link><Link href="/soluciones">Ver soluciones</Link></>}>
      Revisa la dirección o continúa desde una de las rutas principales.
    </PublicRecoveryState>
  );
}
