import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("catalog and course detail expose an enrolled state", async () => {
  const [catalog, detail, repository] = await Promise.all([
    read("app/cursos/page.tsx"),
    read("app/cursos/[slug]/page.tsx"),
    read("lib/enrollments-repository.ts"),
  ]);

  assert.match(repository, /eq\("user_id", auth\.user\.id\)/);
  assert.match(repository, /course_id/);
  assert.match(catalog, /Ya inscrito/);
  assert.match(catalog, /enrolledCourseIds/);
  assert.match(detail, /currentUserHasEnrollment/);
  assert.match(detail, /href=\{actionHref\}/);
  assert.match(detail, /alreadyEnrolled \? "Ver mi perfil"/);
  assert.match(detail, /course-enrollment-badge/);
});

test("duplicate enrollment is blocked at the checkout boundary", async () => {
  const route = await read("app/api/payments/checkout/route.ts");
  assert.match(route, /eq\("course_id", course\.id\)/);
  assert.match(route, /enrollmentStatus/);
  assert.match(route, /status: 409/);
});

test("success toast uses a defined surface color", async () => {
  const toaster = await read("components/ui/sonner.tsx");
  assert.match(toaster, /"--normal-bg": "var\(--card\)"/);
  assert.match(toaster, /"--normal-text": "var\(--text\)"/);
  const styles = await read("app/globals.css");
  assert.match(styles, /\[data-description\]\s*\{ color: #000; \}/);
});
