"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type RegistrationField, validateRegistrationField } from "@/lib/form-validation";

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

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <header>
          <p className="auth-eyebrow">Portal ELSI</p>
          <h1>Crear cuenta</h1>
          <p className="auth-lede">Regístrate para acceder a tus cursos.</p>
        </header>

        {formError ? <p className="auth-form-error" role="alert">{formError}</p> : null}

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

        <Button type="submit" disabled={loading} variant="primary" className="auth-submit">
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: "var(--accent)" }}>Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
