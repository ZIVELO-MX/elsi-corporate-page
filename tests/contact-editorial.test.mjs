import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("contact keeps its manual form contract inside an editorial layout", () => {
  const page = read("app/contacto/page.tsx");
  const styles = read("app/globals.css");

  assert.match(page, /<PublicContactForm/);
  assert.match(page, /context=\{context\}/);
  assert.match(page, /defaultMessage=\{defaultMessage\}/);
  assert.match(page, /className="contact-info"/);
  assert.match(page, /href="tel:\+523921104719"/);
  assert.match(page, /href="mailto:instituteelsi@gmail\.com"/);
  assert.match(styles, /\.contact-form \{ grid-area: form; padding: 0; background: transparent; border: 0;/);
  assert.match(styles, /\.contact-info ul \{ display: grid;/);
  assert.match(styles, /\.contact-grid \{ grid-template-columns: minmax\(0, 1fr\); grid-template-areas: "intro" "form" "info";/);
});
