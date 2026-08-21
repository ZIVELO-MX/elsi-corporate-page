import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <AuthShell title="No pudimos iniciar sesión" subtitle="La sesión con Google no se pudo completar.">
      <div className="space-y-5 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Intenta de nuevo. Si el problema continúa, contacta a ELSI.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Volver a iniciar sesión</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
