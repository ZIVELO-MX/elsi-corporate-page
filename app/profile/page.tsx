"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Perfil</h1>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>Inicia sesión para ver tu perfil.</p>
        <Button asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 2rem" }}>
      <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1.5rem" }}>Mi perfil</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Nombre</span>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1rem" }}>{user.name}</p>
        </div>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Correo</span>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1rem" }}>{user.email}</p>
        </div>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rol</span>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1rem", textTransform: "capitalize" }}>{user.role}</p>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
        <Button asChild variant="primary">
          <Link href="/admin">Panel de administración</Link>
        </Button>
      </div>
    </main>
  );
}
