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

        <button
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--input)] bg-white px-4 text-[12px] font-extrabold text-[var(--text)] transition-colors pointer-fine:hover:bg-[var(--paper-warm)] disabled:cursor-wait disabled:opacity-60"
          type="button"
          onClick={handleGoogleRegistration}
          disabled={loading}
        >
          Crear cuenta con Google
        </button>
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
