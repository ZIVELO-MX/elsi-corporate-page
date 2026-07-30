import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { extname, join, resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

function sourceFiles(directory) {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return [".css", ".ts", ".tsx"].includes(extname(entry.name))
        ? [path]
        : [];
    },
  );
}

const files = sourceFiles("app").concat(sourceFiles("components"));
const source = files.map((path) => read(path)).join("\n");
const utilitySource = files
  .filter((path) => [".ts", ".tsx"].includes(extname(path)))
  .map((path) => read(path))
  .join("\n");

test("available image fixtures declare stable intrinsic dimensions", async () => {
  const { courseImages, siteImages, solutionImages } = await import(
    "../lib/image-assets.ts"
  );

  const assets = [
    ...Object.values(courseImages),
    ...Object.values(siteImages),
    ...Object.values(solutionImages),
  ];

  for (const asset of assets) {
    assert.equal(asset.status, "available");
    assert.equal(asset.source, "fixture");
    assert.ok(asset.width > 0, `${asset.src} needs an intrinsic width`);
    assert.ok(asset.height > 0, `${asset.src} needs an intrinsic height`);
  }
});

test("the one LCP candidate uses Next preload without competing hints", () => {
  const safeImage = read("components/safe-image.tsx");
  const home = read("app/page.tsx");

  assert.match(safeImage, /width: number/);
  assert.match(safeImage, /height: number/);
  assert.match(safeImage, /preload\?: boolean/);
  assert.match(safeImage, /preload=\{preload\}/);
  assert.doesNotMatch(safeImage, /width = 1600|height = 900/);

  assert.match(home, /src=\{siteImages\.hero\.src\}/);
  assert.match(home, /width=\{siteImages\.hero\.width\}/);
  assert.match(home, /height=\{siteImages\.hero\.height\}/);
  assert.match(home, /\n\s+preload\n/);
  assert.doesNotMatch(home, /fetchPriority="high"/);
  assert.doesNotMatch(home, /src="\/hero-bg\.jpg"/);
});

test("responsive editorial images expose sizes and asset dimensions", () => {
  const pages = [
    "app/page.tsx",
    "app/soluciones/page.tsx",
    "app/soluciones/[slug]/page.tsx",
    "app/nosotros/page.tsx",
  ].map(read);
  const courseMedia = read("components/course-media.tsx");

  for (const page of pages) {
    assert.match(page, /sizes="/);
  }
  assert.match(courseMedia, /width=\{asset\.width\}/);
  assert.match(courseMedia, /height=\{asset\.height\}/);
});

test("motion avoids forbidden shortcuts and ungated utility hover", () => {
  assert.doesNotMatch(source, /transition(?:-property)?\s*:\s*all/i);
  assert.doesNotMatch(source, /\btransition-all\b/);
  assert.doesNotMatch(source, /\bease-in(?!-out)\b/);
  assert.doesNotMatch(source, /\bscale\(0\)/);

  const hoverUtilities =
    utilitySource.match(/[^\s"'`<>]+hover:[^\s"'`<>]+/g) ?? [];
  for (const utility of hoverUtilities) {
    assert.match(
      utility,
      /pointer-fine:/,
      `Hover utility is not pointer-gated: ${utility}`,
    );
  }
});

test("every CSS hover rule is scoped to a precise pointer", () => {
  for (const path of sourceFiles("app").concat(sourceFiles("components"))) {
    if (extname(path) !== ".css") continue;

    const stack = [];
    const stylesWithoutComments = read(path).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const line of stylesWithoutComments.split("\n")) {
      const selectorHasHover = line.includes(":hover");

      if (selectorHasHover) {
        assert.ok(
          stack.some(Boolean),
          `${path} has an ungated hover rule: ${line.trim()}`,
        );
      }

      const opens = (line.match(/{/g) ?? []).length;
      const closes = (line.match(/}/g) ?? []).length;
      const insideHoverMedia = stack.some(Boolean);
      const opensHoverMedia =
        line.includes("@media") &&
        line.includes("hover: hover") &&
        line.includes("pointer: fine");

      for (let index = 0; index < opens; index += 1) {
        stack.push(insideHoverMedia || opensHoverMedia);
      }
      for (let index = 0; index < closes; index += 1) {
        stack.pop();
      }
    }
  }
});

test("static surfaces stay still and loaders retain accessible status", () => {
  const styles = read("app/globals.css");
  const courseLoading = read("app/cursos/loading.tsx");
  const skeleton = read("components/ui/skeleton.tsx");

  for (const selector of [
    ".stat-card:hover",
    ".timeline-lg-item:hover",
    ".research-list li:hover",
    ".beneficio-card:hover",
    ".team-card:hover",
  ]) {
    assert.doesNotMatch(styles, new RegExp(selector.replace(".", "\\.")));
  }

  assert.doesNotMatch(styles, /admin-skeleton-shimmer/);
  assert.match(courseLoading, /aria-busy="true"/);
  assert.match(courseLoading, /Cargando cursos\./);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.public-loading-heading,[\s\S]*animation: none/);
  assert.match(skeleton, /role="status"/);
  assert.match(skeleton, /aria-label="Cargando datos"/);
});

test("motion and surface roles preserve system preferences", () => {
  const styles = read("app/globals.css");
  const checkoutStyles = read("components/checkout/checkout.module.css");
  const dialog = read("components/ui/dialog.tsx");

  assert.match(styles, /--surface-base:/);
  assert.match(styles, /--surface-editorial:/);
  assert.match(styles, /--surface-interactive:/);
  assert.match(styles, /--motion-enter: 200ms/);
  assert.match(styles, /--motion-exit: 140ms/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(prefers-reduced-transparency: reduce\)/);
  assert.match(styles, /@media \(prefers-contrast: more\)/);
  assert.match(checkoutStyles, /translateY\(0\.25rem\)/);
  assert.equal(
    dialog.match(
      /duration-\[var\(--motion-exit\)\] data-\[state=open\]:duration-\[var\(--motion-med\)\]/g,
    )?.length,
    2,
  );
});
