import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("privacy notice keeps legal copy while exposing semantic reading landmarks", () => {
  const page = read("app/aviso-de-privacidad/page.tsx");
  const styles = read("app/globals.css");
  for (const phrase of ["Datos que recopilamos", "Finalidad del tratamiento", "Transferencia de datos", "Derechos ARCO", "Cambios al aviso", "Última actualización: julio 2026."]) assert.match(page, new RegExp(phrase));
  assert.match(page, /<article className="privacy-content">/);
  assert.match(page, /<section><h2>Datos que recopilamos/);
  assert.match(page, /href="mailto:instituteelsi@gmail\.com"/);
  assert.doesNotMatch(page, /style=\{\{/);
  assert.match(styles, /\.privacy-content section \{ max-width: 42rem;/);
  assert.match(styles, /\.privacy-back:focus-visible/);
});
