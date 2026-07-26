import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("student portal exposes useful loading, empty, error and download states", () => {
  const page = read("app/profile/page.tsx");
  const profileApi = read("app/api/profile/route.ts");
  const wireframes = read("app/profile/wireframes/page.tsx");

  assert.match(page, /function ProfileSkeleton/);
  assert.match(page, /role="status"/);
  assert.match(page, /aria-busy="true"/);
  assert.match(page, /Aún no tienes cursos/);
  assert.match(page, /role="alert"/);
  assert.match(page, /Descargar<\/span>/);
  assert.match(page, /pointer-fine:hover/);
  assert.doesNotMatch(profileApi, /09:00[–—]13:00/);
  assert.doesNotMatch(profileApi, /17:00[–—]19:00/);
  assert.doesNotMatch(wireframes, /09:00[–—]13:00/);
});

test("student portal motion is specific, subtle and reduced-motion safe", () => {
  const styles = read("app/profile/profile.module.css");

  assert.match(styles, /animation: profile-enter 180ms/);
  assert.match(styles, /animation-delay: 40ms/);
  assert.match(styles, /animation-delay: 80ms/);
  assert.match(styles, /animation-delay: 120ms/);
  assert.match(styles, /transition: transform 120ms/);
  assert.match(styles, /transform: scale\(\.97\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /transition:\s*all|ease-in|scale\(0\)/i);
});
