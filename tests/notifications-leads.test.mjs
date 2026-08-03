import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("contact endpoint validates, rate-limits, verifies anti-spam and writes lead/outbox", async () => {
  const source = await read("app/api/contact/route.ts");
  assert.match(source, /MAX_REQUESTS/);
  assert.match(source, /website/);
  assert.match(source, /turnstile/);
  assert.match(source, /contact_leads/);
  assert.match(source, /outbox_events/);
  assert.match(source, /lead\.created/);
});

test("admin leads are protected and status transitions are constrained", async () => {
  const [list, update, form] = await Promise.all([read("app/api/admin/leads/route.ts"), read("app/api/admin/leads/[id]/route.ts"), read("components/public-contact-form.tsx")]);
  for (const source of [list, update]) {
    assert.match(source, /auth\.getUser/);
    assert.match(source, /profiles/);
    assert.match(source, /role.*admin/);
  }
  assert.match(update, /new.*contacted.*closed/);
  assert.match(form, /\/api\/contact/);
});

test("admin contact screen hydrates leads and persists attendance", async () => {
  const source = await read("app/admin/contacto/page.tsx");
  assert.match(source, /fetch\("\/api\/admin\/leads"\)/);
  assert.match(source, /\/api\/admin\/leads\/\$\{lead\.id\}/);
  assert.match(source, /persistedLeads \?\? leads/);
});

test("notification worker claims outbox events and retries Resend idempotently", async () => {
  const source = await read("app/api/internal/notifications/worker/route.ts");
  assert.match(source, /NOTIFICATIONS_WORKER_SECRET/);
  assert.match(source, /status.*processing/);
  assert.match(source, /status.*pending/);
  assert.match(source, /LOCK_TIMEOUT_MS/);
  assert.match(source, /MAX_ATTEMPTS/);
  assert.match(source, /https:\/\/api\.resend\.com\/emails/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /lead\.created\//);
  assert.match(source, /available_at/);
  const template = await read("lib/notifications/templates.ts");
  assert.match(template, /LEAD_NOTIFICATION_TEMPLATE_VERSION/);
  assert.match(template, /renderLeadNotification/);
  assert.match(source, /X-ELSI-Template-Version/);
  assert.match(source, /enrollment\.created/);
  assert.match(source, /certificate\.available/);
  assert.match(source, /getUserById/);
  assert.match(source, /ENROLLMENT_NOTIFICATION_TEMPLATE_VERSION/);
  assert.match(source, /CERTIFICATE_NOTIFICATION_TEMPLATE_VERSION/);
  const enrollment = await read("app/api/admin/enrollments/route.ts");
  const certificate = await read("app/api/admin/certificates/[id]/route.ts");
  assert.match(enrollment, /outbox_events/);
  assert.match(enrollment, /enrollment\.created/);
  assert.match(certificate, /certificate\.available/);
});

test("notification worker has a scheduled and manually triggerable delivery workflow", async () => {
  const workflow = await read(".github/workflows/process-notifications.yml");
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /cron:.*\*\/5/);
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /ELSI_APP_URL/);
  assert.match(workflow, /NOTIFICATIONS_WORKER_SECRET/);
  assert.match(workflow, /api\/internal\/notifications\/worker/);
  assert.match(workflow, /curl --fail-with-body/);
});

test("notification delivery stays hidden until explicitly enabled", async () => {
  const [worker, workflow, env] = await Promise.all([
    read("app/api/internal/notifications/worker/route.ts"),
    read(".github/workflows/process-notifications.yml"),
    read(".env.example"),
  ]);
  assert.match(worker, /NOTIFICATIONS_DELIVERY_ENABLED !== "true"/);
  assert.match(worker, /Entrega de notificaciones deshabilitada/);
  assert.match(workflow, /vars\.NOTIFICATIONS_DELIVERY_ENABLED == 'true'/);
  assert.match(env, /NOTIFICATIONS_DELIVERY_ENABLED=false/);
});
