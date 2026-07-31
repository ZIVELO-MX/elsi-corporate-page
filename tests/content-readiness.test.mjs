import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

const { courseImages, getCourseImage } = await import(
  "../lib/image-assets.ts"
);

test("course media distinguishes available fixtures from client-pending imagery", () => {
  for (const asset of Object.values(courseImages)) {
    assert.equal(asset.status, "available");
    assert.equal(asset.source, "fixture");
    assert.ok(
      existsSync(resolve(process.cwd(), "public", asset.src.slice(1))),
      `${asset.src} is missing`,
    );
  }

  assert.deepEqual(
    getCourseImage(
      "manejo-integral-de-residuos",
      "Manejo Integral de Residuos",
    ),
    {
      status: "pending",
      alt: "Imagen pendiente para el curso Manejo Integral de Residuos",
    },
  );
});

test("course surfaces share one accessible pending-media treatment", () => {
  const media = read("components/course-media.tsx");
  const safeImage = read("components/safe-image.tsx");
  const catalog = read("app/cursos/page.tsx");
  const detail = read("app/cursos/[slug]/page.tsx");
  const home = read("app/page.tsx");

  assert.match(media, /Imagen pendiente/);
  assert.match(media, /cuando ELSI entregue el recurso final/);
  assert.match(media, /role="img"/);
  assert.match(media, /fallback=\{fallback\}/);
  assert.match(safeImage, /fallback\?: ReactNode/);

  for (const surface of [catalog, detail, home]) {
    assert.match(surface, /<CourseMedia/);
    assert.doesNotMatch(
      surface,
      /bg-gradient-to-br from-\[var\(--accent-light\)\]/,
    );
  }
});

test("prototype course data stays visibly provisional until client handoff", () => {
  const note = read("components/prototype-data-note.tsx");
  const catalog = read("app/cursos/page.tsx");
  const detail = read("app/cursos/[slug]/page.tsx");
  const checkout = read("components/checkout/checkout-experience.tsx");

  assert.match(note, /siteConfig\.previewMode/);
  assert.match(note, /Contenido de demostración/);
  assert.match(catalog, /información\s+validada por ELSI/);
  assert.match(detail, /ficha aprobada por ELSI/);
  assert.match(checkout, /no se\s+realizan cargos ni inscripciones reales/);
});

test("mission checkout capture selects a fixture course explicitly", () => {
  const targets = read("tests/mission-screenshot-targets.ts");

  assert.match(
    targets,
    /path: "\/checkout\?curso=manejo-integral-de-residuos"/,
  );
  assert.match(targets, /selector: section\("Pago \/ Checkout Stripe"\)/);
});
