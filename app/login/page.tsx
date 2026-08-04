"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-context";
import { AuthShell } from "@/components/auth-shell";

type LoginField = "email" | "password";
type LoginErrors = Partial<Record<LoginField, string>>;
const SUPPORT_EMAIL = "instituteelsi@gmail.com";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginField(field: LoginField, value: string) {
  if (!value.trim()) {
    return field === "email" ? "Ingresa tu correo electrónico." : "Ingresa tu contraseña.";
  }

  if (field === "email" && !emailPattern.test(value)) {
    return "Usa un correo electrónico válido.";
  }

  return undefined;
}

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");

  const updateFieldError = (field: LoginField, value: string) => {
    setErrors((current) => ({ ...current, [field]: validateLoginField(field, value) }));
  };

  const clearFieldError = (field: LoginField) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = {
      email: validateLoginField("email", email),
      password: validateLoginField("password", password),
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    try {
      const user = await login(email, password);
      router.push(user.role === "admin" ? "/admin" : "/profile");
    } catch {
      setFormError("No pudimos iniciar sesión. Revisa tu correo y contraseña.");
    }
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Consulta tus inscripciones y constancias.">
      <form className="w-full" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        {formError ? (
          <p className="mb-4 rounded-[var(--radius-sm)] border border-[#E9C8C8] bg-[#FDF2F2] px-3 py-2.5 text-[12px] font-semibold text-[var(--destructive)]" role="alert">
            {formError} Si necesitas ayuda, <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>contacta a ELSI</a>.
          </p>
        ) : null}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text)]" htmlFor="email">Correo electrónico</label>
            <input
              className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-white px-3 text-[13px] outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] placeholder:text-[var(--text-light)]"
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              onBlur={(event) => updateFieldError("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
            />
            {errors.email ? <p className="mt-1.5 text-[11px] font-semibold text-[var(--destructive)]" id="email-error">{errors.email}</p> : null}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text)]" htmlFor="password">Contraseña</label>
            <input
              className="mt-1 block min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--input)] bg-white px-3 text-[13px] outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] placeholder:text-[var(--text-light)]"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              onBlur={(event) => updateFieldError("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              required
            />
            {errors.password ? <p className="mt-1.5 text-[11px] font-semibold text-[var(--destructive)]" id="password-error">{errors.password}</p> : null}
          </div>
        </div>

        <button
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--primary-hover)] bg-[var(--primary-hover)] px-4 text-[12px] font-extrabold text-white transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)] pointer-fine:hover:border-[var(--accent)] pointer-fine:hover:bg-[var(--accent)] pointer-fine:hover:text-white active:scale-[.98] disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Iniciando sesión…" : "Entrar"}
        </button>

      </form>

      <p className="mt-6 text-center text-[12px] text-[var(--text-muted)]">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="accent-link font-bold pointer-fine:hover:underline">
          Crear cuenta
        </Link>
      </p>
    </AuthShell>
  );
}
