import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("public content omits placeholders and simulated trust", () => {
  const publicSources = [
    "app/page.tsx",
    "app/nosotros/page.tsx",
    "app/soluciones/[slug]/page.tsx",
    "app/contacto/page.tsx",
    "app/cursos/page.tsx",
    "lib/image-assets.ts",
  ].map(read).join("\n");

  for (const forbidden of [
    /lorem ipsum/i,
    /nombre apellido/i,
    /service [1-3]/i,
    /unsplash/i,
    /pinimg/i,
    /test mode/i,
    /por investigar/i,
  ]) {
    assert.doesNotMatch(publicSources, forbidden);
  }
});

test("prototype state is centralized and can be disabled", () => {
  const config = read("lib/site-config.ts");
  const layout = read("app/layout.tsx");
  const footer = read("components/footer.tsx");

  assert.match(config, /NEXT_PUBLIC_PROTOTYPE_MODE/);
  assert.match(config, /prototypeMode/);
  assert.doesNotMatch(layout, /PrototypeNotice/);
  assert.doesNotMatch(footer, /Prototipo de validación/);
});

test("every curated content image is local and versioned", () => {
  const assets = read("lib/image-assets.ts");
  const sources = [...assets.matchAll(/src: "([^"]+)"/g)].map((match) => match[1]);

  assert.ok(sources.length > 0);
  assert.equal(new Set(sources).size, sources.length);
  for (const source of sources) {
    assert.match(source, /^\/(?:images\/)?.+\.(?:jpe?g|png|webp|avif)$/);
    assert.ok(existsSync(resolve(process.cwd(), "public", source.slice(1))), `${source} is missing`);
  }
});

test("legacy public routes resolve to one canonical experience", () => {
  const nextConfig = read("next.config.ts");

  for (const [source, destination] of [
    ["/shop", "/cursos"],
    ["/tienda", "/cursos"],
    ["/finalizar-compra", "/checkout"],
    ["/account", "/profile"],
    ["/mi-cuenta", "/profile"],
  ]) {
    assert.match(nextConfig, new RegExp(`source: "${source}".+destination: "${destination}"`));
  }
});

test("broken images expose an explicit accessible state", () => {
  const safeImage = read("components/safe-image.tsx");

  assert.match(safeImage, /role="img"/);
  assert.match(safeImage, /Imagen no disponible/);
  assert.doesNotMatch(safeImage, /aria-hidden="true"/);
});
