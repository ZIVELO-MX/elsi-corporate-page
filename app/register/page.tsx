"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type RegistrationField, validateRegistrationField } from "@/lib/form-validation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RegistrationValues = Record<RegistrationField, string>;
type RegistrationErrors = Partial<Record<RegistrationField, string>>;

const fields: RegistrationField[] = ["name", "email", "phone", "password"];

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState<RegistrationValues>({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateValue = (field: RegistrationField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validateField = (field: RegistrationField, value: string) => {
    setErrors((current) => ({ ...current, [field]: validateRegistrationField(field, value) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = Object.fromEntries(
      fields.map((field) => [field, validateRegistrationField(field, values[field])]),
    ) as RegistrationErrors;
    setErrors(nextErrors);

    const firstInvalid = fields.find((field) => nextErrors[field]);
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Registration failed");
      router.push("/login");
    } catch {
      setFormError("No pudimos crear tu cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegistration = async () => {
    setFormError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setFormError("El registro con Google no está configurado.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (error) setFormError("No pudimos crear tu cuenta con Google. Intenta de nuevo.");
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Regístrate para acceder a tus cursos.">
      <form className="w-full" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        {formError ? (
          <p className="mb-4 rounded-[var(--radius-sm)] border border-[#E9C8C8] bg-[#FDF2F2] px-3 py-2.5 text-[12px] font-semibold text-[var(--destructive)]" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="space-y-4">
          <Field data-invalid={Boolean(errors.name)}>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" autoComplete="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} onBlur={(event) => validateField("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} required />
            <FieldError id="name-error">{errors.name}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} onBlur={(event) => validateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} required />
            <FieldError id="email-error">{errors.email}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.phone)}>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} onBlur={(event) => validateField("phone", event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} required />
            <FieldError id="phone-error">{errors.phone}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={(event) => updateValue("password", event.target.value)} onBlur={(event) => validateField("password", event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} required />
            <FieldError id="password-error">{errors.password}</FieldError>
          </Field>
        </div>

        <Button type="submit" disabled={loading} variant="primary" className="mt-6 w-full">
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]" aria-hidden="true">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span>o</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleRegistration} disabled={loading}>
          <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Crear cuenta con Google
        </Button>
      </form>

      <p className="mt-6 text-center text-[12px] text-[var(--text-muted)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="accent-link font-bold pointer-fine:hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
