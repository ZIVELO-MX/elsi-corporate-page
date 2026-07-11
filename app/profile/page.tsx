"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";

type Course = { id: string; title: string; status: string; url: string | null; progress: number };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile").then((r) => r.json()).then((d) => { setCourses(d.courses); setLoaded(true); });
  }, [user]);

  if (!user) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Perfil</h1>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>Inicia sesión para ver tu perfil.</p>
        <Link href="/login" style={{ display: "inline-block", padding: "0.625rem 1rem", background: "var(--primary)", color: "#fff", borderRadius: "var(--radius)", textDecoration: "none", fontWeight: 700 }}>Iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 2rem" }}>
      <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1.5rem" }}>Mi perfil</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", marginBottom: "2rem" }}>
        <div><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Nombre</span><p style={{ margin: "0.25rem 0 0" }}>{user.name}</p></div>
        <div><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Correo</span><p style={{ margin: "0.25rem 0 0" }}>{user.email}</p></div>
        <div><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Rol</span><p style={{ margin: "0.25rem 0 0", textTransform: "capitalize" }}>{user.role}</p></div>
      </div>

      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.125rem", fontWeight: 700, margin: "0 0 1rem" }}>Mis cursos</h2>

      {!loaded ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      ) : courses.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
          <p style={{ color: "var(--text-muted)", margin: "0 0 1rem" }}>Aún no tienes cursos asignados.</p>
          <Link href="/cursos" style={{ color: "var(--accent)", fontWeight: 600 }}>Explorar cursos</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {courses.map((course) => (
            <div key={course.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", gap: "1rem" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{course.title}</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: course.status === "active" ? "var(--leaf)" : "var(--text-muted)" }}>
                  {course.status === "active" ? "Activo" : "Inactivo"} {course.progress > 0 && `— ${course.progress}% completado`}
                </p>
              </div>
              {course.url ? (
                <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, padding: "0.5rem 0.75rem", background: "var(--accent)", color: "#fff", borderRadius: "var(--radius)", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 600 }}>
                  Entrar
                </a>
              ) : (
                <span style={{ flexShrink: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>Próximamente</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={logout} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", cursor: "pointer", fontSize: "0.875rem" }}>
          Cerrar sesión
        </button>
        {user.role === "admin" && (
          <Link href="/admin" style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "#fff", borderRadius: "var(--radius)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            Panel admin
          </Link>
        )}
      </div>
    </main>
  );
}
