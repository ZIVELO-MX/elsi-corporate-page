import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutUnavailablePage() {
  return (
    <main className="unavailable-state">
      <div className="unavailable-state-card">
        <span className="section-kicker">Inscripción</span>
        <h1>La compra en línea aún no está disponible.</h1>
        <p>
          Puedes revisar el programa de cada curso y escribirnos para confirmar disponibilidad.
        </p>
        <div className="unavailable-state-actions">
          <Button asChild variant="primary">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contacto">Solicitar información <ArrowRight data-icon="inline-end" /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
