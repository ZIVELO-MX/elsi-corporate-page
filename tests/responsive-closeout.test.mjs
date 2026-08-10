import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("public wayfinding shares stable labels and active-page semantics", () => {
  const navigation = read("lib/navigation.ts");
  const header = read("components/header.tsx");
  const footer = read("components/footer.tsx");
  const breadcrumbs = read("components/breadcrumbs.tsx");

  for (const label of ["Inicio", "Soluciones", "Cursos", "Nosotros", "Contacto"]) {
    assert.match(navigation, new RegExp(`label: "${label}"`));
  }
  assert.match(header, /aria-current=\{isNavigationItemActive/);
  assert.match(footer, /navigation\.map/);
  assert.match(footer, /aria-current=\{isNavigationItemActive/);
  assert.match(breadcrumbs, /<nav className="breadcrumb" aria-label="Migas de pan">/);
  assert.match(breadcrumbs, /<ol>/);
  assert.match(breadcrumbs, /aria-current=\{current \? "page"/);
});

test("public forms expose field-specific errors and focus the first invalid control", () => {
  const contactForm = read("components/public-contact-form.tsx");
  const register = read("app/register/page.tsx");
  const validation = read("lib/form-validation.ts");

  for (const source of [contactForm, register]) {
    assert.match(source, /noValidate/);
    assert.match(source, /aria-invalid=/);
    assert.match(source, /aria-describedby=/);
    assert.match(source, /FieldError/);
    assert.match(source, /elements\.namedItem\(firstInvalid\)/);
  }
  assert.match(validation, /Usa un correo electrónico válido/);
  assert.match(validation, /Usa al menos 8 caracteres/);
  assert.match(contactForm, /role="status"/);
});

test("mobile layouts preserve a clear decision point before course supporting detail", () => {
  const styles = read("app/globals.css");
  const course = read("app/cursos/[slug]/page.tsx");
  const contact = read("app/contacto/page.tsx");

  assert.match(styles, /grid-template-areas: "intro form" "info form"/);
  assert.match(styles, /grid-template-areas: "intro" "form" "info"/);
  assert.match(styles, /course-detail-overview-grid, \.course-detail-content-grid \{ grid-template-columns: minmax\(0, 1fr\); gap: 40px; \}/);
  assert.match(course, /course-detail-facts[\s\S]*course-detail-decision[\s\S]*course-detail-content/);
  assert.match(contact, /contact-intro[\s\S]*PublicContactForm[\s\S]*contact-info/);
});

test("responsive audit supports 200 percent zoom and narrow reflow fixes", () => {
  const audit = read("scripts/audit-responsive.mjs");
  const styles = read("app/globals.css");

  assert.match(audit, /AUDIT_ZOOM/);
  assert.match(audit, /Math\.round\(width \/ zoom\)/);
  assert.match(styles, /@media \(max-width: 240px\)/);
  assert.match(styles, /\.home-course-row \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(styles, /\.skip-link \{ max-width: calc\(100vw - 16px\)/);
});

test("public typography exposes size-specific type roles", () => {
  const styles = read("app/globals.css");

  for (const token of [
    "--type-display-size",
    "--type-display-leading",
    "--type-display-tracking",
    "--type-body-size",
    "--type-body-leading",
    "--type-meta-size",
    "--type-meta-tracking",
  ]) {
    assert.match(styles, new RegExp(token));
  }
  assert.match(styles, /font-optical-sizing: auto/);
});
