"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password) {
      setError("Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (!res.ok) throw new Error("Error al registrarse");
      router.push("/login");
    } catch {
      setError("Error al registrarse. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Crear cuenta</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Regístrate para acceder a tus cursos</p>
        </div>

        {error && (
          <div id="register-error" role="alert" style={{ background: "#FDF2F2", color: "#9F2F32", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem" }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="name" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Nombre</label>
          <input id="name" name="name" autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined} required value={name} onChange={(e) => setName(e.target.value)} style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="email" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined} required value={email} onChange={(e) => setEmail(e.target.value)} style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="phone" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Teléfono</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined} required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="password" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }} />
        </div>

        <button type="submit" disabled={loading} style={{ minHeight: 44, padding: "0.625rem 1rem", background: "var(--primary)", color: "var(--text)", border: "none", borderRadius: "var(--radius)", fontSize: "0.9375rem", fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
