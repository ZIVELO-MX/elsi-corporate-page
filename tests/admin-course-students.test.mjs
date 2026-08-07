import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin courses expose enrollment counts", async () => {
  const [route, page] = await Promise.all([
    read("app/api/admin/courses/route.ts"),
    read("app/admin/cursos/page.tsx"),
  ]);
  assert.match(route, /from\("enrollments"\)/);
  assert.match(route, /studentCounts/);
  assert.match(route, /students: studentCounts\.get/);
  assert.match(page, /students: row\.students/);
});
