import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("course detail presents a semantic editorial sequence without duplicate navigation", () => {
  const page = read("app/cursos/[slug]/page.tsx");

  assert.match(page, /className="course-detail-hero"/);
  assert.match(page, /<Breadcrumbs/);
  assert.match(page, /<PrototypeDataNote>/);
  assert.match(page, /<figure className="course-detail-media">/);
  assert.match(page, /<dl className="course-detail-facts">/);
  assert.match(page, /<aside className="course-detail-decision"/);
  assert.match(page, /<section className="course-detail-content">/);
  assert.doesNotMatch(page, /Volver al catálogo|curso-sidebar|rounded-full|style=\{\{/);
});

test("course detail keeps state-aware manual contact actions and optional data guarded", () => {
  const page = read("app/cursos/[slug]/page.tsx");

  for (const state of ["published", "upcoming", "closed", "pending"]) {
    assert.match(page, new RegExp(`${state}:`));
  }
  assert.match(page, /publishState\(course\)/);
  assert.match(page, /stateMeta\(course\)\.label/);
  assert.match(page, /buildContactPath\(\{ course: course\.slug \}\)/);
  assert.match(page, /course\.curriculum && course\.curriculum\.length > 0/);
  assert.match(page, /course\.objectives && course\.objectives\.length > 0/);
  assert.match(page, /course\.targetAudience && course\.targetAudience\.length > 0/);
  assert.match(page, /course\.requirements && course\.requirements\.length > 0/);
  assert.match(page, /course\.instructor \?/);
});

test("course detail styling has a mobile reading order and accessible interaction states", () => {
  const styles = read("app/globals.css");

  assert.match(styles, /\.course-detail-hero-grid \{ display: grid/);
  assert.match(styles, /\.course-detail-action:focus-visible/);
  assert.match(styles, /\.course-detail-action:active/);
  assert.match(styles, /@media \(max-width: 1024px\)[\s\S]*course-detail-overview-grid, \.course-detail-content-grid \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*course-detail-facts \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(styles, /@media \(max-width: 240px\)[\s\S]*course-detail-module-list \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.doesNotMatch(styles, /\.curso-detail-grid|\.curso-sidebar/);
});
