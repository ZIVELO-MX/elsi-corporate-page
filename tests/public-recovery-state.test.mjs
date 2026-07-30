import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("los estados públicos comparten una estructura accesible sin cambiar sus salidas", async () => {
  const [sharedState, notFound, courseNotFound, coursesError, errorState] = await Promise.all([
    read("components/public-recovery-state.tsx"),
    read("app/not-found.tsx"),
    read("app/cursos/[slug]/not-found.tsx"),
    read("app/cursos/error.tsx"),
    read("app/error.tsx"),
  ]);

  assert.match(sharedState, /<main className="public-recovery">/);
  assert.match(sharedState, /aria-labelledby="public-recovery-title"/);
  assert.match(sharedState, /<h1 id="public-recovery-title">/);
  assert.match(sharedState, /actionsLabel \? \(/);
  assert.match(notFound, /actionsLabel="Rutas para continuar"/);
  assert.match(notFound, /href="\/cursos"/);
  assert.match(notFound, /href="\/soluciones"/);
  assert.match(courseNotFound, /PublicRecoveryState/);
  assert.match(courseNotFound, /href="\/cursos"/);
  assert.match(coursesError, /PublicRecoveryState/);
  assert.match(coursesError, /onClick=\{reset\}/);
  assert.match(coursesError, /href="\/cursos"/);
  assert.match(errorState, /onClick=\{reset\}/);
  assert.match(errorState, /href="\/"/);
});
