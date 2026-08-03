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
});
