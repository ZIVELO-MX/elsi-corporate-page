"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ContactField, validateContactField } from "@/lib/form-validation";

type ContactValues = Record<ContactField, string>;
type ContactErrors = Partial<Record<ContactField, string>>;

type PublicContactFormProps = {
  className: string;
  buttonClassName?: string;
  buttonLabel: string;
  defaultMessage?: string;
  idPrefix: string;
  statusClassName: string;
  context?: {
    type: "course" | "solution";
    id: string;
    label: string;
  };
};

const fields: ContactField[] = ["name", "email", "message"];

export function PublicContactForm({
  className,
  buttonClassName,
  buttonLabel,
  defaultMessage = "",
  idPrefix,
  statusClassName,
  context,
}: PublicContactFormProps) {
  const [values, setValues] = useState<ContactValues>({ name: "", email: "", message: defaultMessage });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const updateValue = (field: ContactField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateField = (field: ContactField, value: string) => {
    setErrors((current) => ({ ...current, [field]: validateContactField(field, value) }));
  };

  const handleSubmit = async () => {
    const nextErrors = Object.fromEntries(
      fields.map((field) => [field, validateContactField(field, values[field])]),
    ) as ContactErrors;
    setErrors(nextErrors);

    const firstInvalid = fields.find((field) => nextErrors[field]);
    if (firstInvalid) {
      (formRef.current?.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }
    setSubmitError(null);
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: values.name, email: values.email, message: values.message, source: context ? `${context.type}:${context.id}` : "contact" }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSubmitError(result.error || "No fue posible enviar el mensaje.");
      return;
    }
    setSent(true);
  };

  return (
    <form ref={formRef} className={className} action={handleSubmit} noValidate aria-label="Solicitud de información">
      {context ? (
        <>
          <input type="hidden" name="resourceType" value={context.type} />
          <input type="hidden" name="resourceId" value={context.id} />
          <input type="hidden" name="resourceLabel" value={context.label} />
        </>
      ) : null}
      <Field data-invalid={Boolean(errors.name)}>
        <Label htmlFor={`${idPrefix}-name`}>Nombre</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          value={values.name}
          onChange={(event) => updateValue("name", event.target.value)}
          onBlur={(event) => validateField("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
          required
        />
        <FieldError id={`${idPrefix}-name-error`}>{errors.name}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.email)}>
        <Label htmlFor={`${idPrefix}-email`}>Correo electrónico</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
          onBlur={(event) => validateField("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          required
        />
        <FieldError id={`${idPrefix}-email-error`}>{errors.email}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors.message)}>
        <Label htmlFor={`${idPrefix}-message`}>Mensaje</Label>
        <Textarea
          id={`${idPrefix}-message`}
          name="message"
          placeholder="¿En qué podemos ayudarte?"
          rows={4}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          onBlur={(event) => validateField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined}
          required
        />
        <FieldError id={`${idPrefix}-message-error`}>{errors.message}</FieldError>
      </Field>
      {sent ? (
        <div className={statusClassName} role="status">
          Vista previa completada. El envío se habilitará al conectar el canal de contacto.
        </div>
      ) : null}
      {submitError ? <p role="alert" className="text-sm text-red-700">{submitError}</p> : null}
      <Button type="submit" disabled={sent} variant="primary" className={buttonClassName}>
        {sent ? "Solicitud registrada" : buttonLabel}
      </Button>
    </form>
  );
}
