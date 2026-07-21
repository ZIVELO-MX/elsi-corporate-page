export type ContactField = "name" | "email" | "message";
export type RegistrationField = "name" | "email" | "phone" | "password";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactField(field: ContactField, value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return field === "email"
      ? "Ingresa tu correo electrónico."
      : field === "message"
        ? "Cuéntanos brevemente qué necesitas."
        : "Ingresa tu nombre.";
  }
  if (field === "email" && !emailPattern.test(normalized)) return "Usa un correo electrónico válido.";
  if (field === "message" && normalized.length < 10) return "Añade un poco más de detalle para poder orientarte.";
  return undefined;
}

export function validateRegistrationField(field: RegistrationField, value: string) {
  const normalized = value.trim();
  if (!normalized) {
    const labels: Record<RegistrationField, string> = {
      name: "Ingresa tu nombre.",
      email: "Ingresa tu correo electrónico.",
      phone: "Ingresa tu teléfono.",
      password: "Crea una contraseña.",
    };
    return labels[field];
  }
  if (field === "email" && !emailPattern.test(normalized)) return "Usa un correo electrónico válido.";
  if (field === "phone" && normalized.replace(/\D/g, "").length < 10) return "Usa un teléfono de al menos 10 dígitos.";
  if (field === "password" && value.length < 8) return "Usa al menos 8 caracteres.";
  return undefined;
}
