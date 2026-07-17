"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    try {
      const user = await login(email, password);
      router.push(user.role === "admin" ? "/admin" : "/profile");
    } catch {
      setError("Credenciales inválidas");
    }
  };

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Iniciar sesión</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Accede a tu panel ELSI</p>
        </div>

        {error && (
          <div id="login-error" role="alert" style={{ background: "#FDF2F2", color: "#9F2F32", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="email" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            name="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            required
            style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }}
            autoComplete="email"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label htmlFor="password" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            name="password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            required
            style={{ minHeight: 44, padding: "0.625rem 0.875rem", border: "1px solid var(--input)", borderRadius: "var(--radius)", fontSize: "0.9375rem", background: "var(--card)" }}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Crear cuenta</Link>
        </p>
      </form>
    </main>
  );
}
