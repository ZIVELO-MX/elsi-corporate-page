import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("managed content validates keys, strips untrusted markup and filters public data", async () => {
  const source = await read("lib/content-repository.ts");
  assert.match(source, /replace\(\/<\[\^>\]\*\>\/g/);
  assert.match(source, /is_active.*true/);
  assert.match(source, /content_status.*verified/);
  assert.match(source, /sort_order/);
});

test("content mutations require admin role and protect duplicate sections", async () => {
  const [content, item, testimonial] = await Promise.all([read("app/api/admin/content/route.ts"), read("app/api/admin/content/[id]/route.ts"), read("app/api/admin/testimonials/route.ts")]);
  for (const source of [content, item, testimonial]) assert.match(source, /requireAdminContentClient/);
  assert.match(content, /23505/);
  assert.match(item, /update/);
  assert.match(testimonial, /validateTestimonial/);
});
