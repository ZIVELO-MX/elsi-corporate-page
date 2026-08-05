export const LEAD_NOTIFICATION_TEMPLATE_VERSION = "lead-notification-v1";
export const ENROLLMENT_NOTIFICATION_TEMPLATE_VERSION = "enrollment-notification-v1";
export const CERTIFICATE_NOTIFICATION_TEMPLATE_VERSION = "certificate-notification-v1";

export type LeadNotificationData = {
  full_name: string;
  email: string;
  company: string | null;
  message: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function renderLeadNotification(lead: LeadNotificationData) {
  return `<h1>Nuevo contacto</h1><p><strong>Nombre:</strong> ${escapeHtml(lead.full_name)}</p><p><strong>Email:</strong> ${escapeHtml(lead.email)}</p><p><strong>Empresa:</strong> ${escapeHtml(lead.company ?? "No indicada")}</p><p>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>`;
}

export type EnrollmentNotificationData = {
  recipientName: string;
  courseTitle: string;
};

export function renderEnrollmentNotification(data: EnrollmentNotificationData) {
  return `<h1>Inscripción confirmada</h1><p>Hola ${escapeHtml(data.recipientName)},</p><p>Tu inscripción a <strong>${escapeHtml(data.courseTitle)}</strong> fue confirmada.</p><p>Recibirás por este medio la información de acceso cuando esté disponible.</p>`;
}

export type CertificateNotificationData = {
  recipientName: string;
  courseTitle: string;
};

export function renderCertificateNotification(data: CertificateNotificationData) {
  return `<h1>Tu constancia está disponible</h1><p>Hola ${escapeHtml(data.recipientName)},</p><p>La constancia de <strong>${escapeHtml(data.courseTitle)}</strong> ya está disponible en tu perfil.</p>`;
}
