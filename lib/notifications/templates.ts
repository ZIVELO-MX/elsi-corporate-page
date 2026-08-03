export const LEAD_NOTIFICATION_TEMPLATE_VERSION = "lead-notification-v1";

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
