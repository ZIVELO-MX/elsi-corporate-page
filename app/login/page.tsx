"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "oauth_callback") {
      setFormError("No pudimos completar el inicio de sesión con Google. Intenta de nuevo.");
    }
  }, []);

  const updateFieldError = (field: LoginField, value: string) => {
    setErrors((current) => ({ ...current, [field]: validateLoginField(field, value) }));
  };

  const clearFieldError = (field: LoginField) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
    setInvalidCredentials(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setInvalidCredentials(false);

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
    } catch (error) {
      setFormError("No pudimos iniciar sesión. Revisa tu correo y contraseña.");
      setInvalidCredentials((error as { status?: number }).status === 401);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError("");
    setInvalidCredentials(false);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setFormError("El inicio de sesión con Google no está configurado.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (error) setFormError("No pudimos iniciar sesión con Google. Intenta de nuevo.");
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Consulta tus inscripciones y constancias.">
      <form className="w-full" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        {formError ? (
          <p className="mb-4 rounded-[var(--radius-sm)] border border-[#E9C8C8] bg-[#FDF2F2] px-3 py-2.5 text-[12px] font-semibold text-[var(--destructive)]" role="alert">
            {formError}
            {invalidCredentials ? <> ¿Olvidaste tu contraseña? <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>Contacta a ELSI</a>.</> : null}
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

        <Button
          className="mt-6 w-full"
          type="submit"
          variant="default"
          size="default"
          disabled={loading}
        >
          {loading ? "Iniciando sesión…" : "Entrar"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]" aria-hidden="true">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span>o</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Button
          className="w-full"
          type="button"
          variant="secondary"
          size="default"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </Button>

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
