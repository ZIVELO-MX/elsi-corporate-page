import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("Nosotros uses typed provisional content with a production-safe fallback", () => {
  const content = read("lib/about.ts");
  const page = read("app/nosotros/page.tsx");

  assert.match(content, /contentStatus: "fixture"/);
  assert.match(content, /siteConfig\.previewMode \|\| isAboutContentVerified\(\)/);
  assert.equal(
    [...content.matchAll(/marker: "(?:2019|UG|Aula|ELSI)"/g)].length,
    4,
  );
  assert.match(page, /getPublicAboutContent\(\)/);
  assert.match(page, /La información institucional está en preparación/);
  assert.doesNotMatch(page, /<PrototypeDataNote>/);
  assert.match(page, /allowIndexing: indexable && isAboutContentVerified\(\)/);
});

test("Nosotros keeps a semantic editorial hierarchy and two direct exits", () => {
  const page = read("app/nosotros/page.tsx");

  assert.match(page, /<ol className="about-timeline">/);
  assert.match(page, /<dl className="about-principles-list">/);
  assert.match(page, /src=\{siteImages\.story\.src\}/);
  assert.match(page, /href="\/cursos"/);
  assert.match(page, /href="\/contacto"/);
  assert.match(page, /aria-labelledby="about-title"/);
  assert.match(page, /aria-labelledby="about-journey-title"/);
  assert.match(page, /aria-labelledby="about-principles-title"/);
});

test("Nosotros removes cloned cards and adapts its four-stage timeline", () => {
  const page = read("app/nosotros/page.tsx");
  const styles = read("app/globals.css");

  assert.doesNotMatch(page, /<Card|style=\{\{|timeline-lg|mvv-grid|repeat\(6/);
  assert.doesNotMatch(page, /[—–]/);
  assert.match(styles, /\.about-timeline \{[\s\S]*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(
    styles,
    /@media \(max-width: 800px\) \{[\s\S]*\.about-timeline \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 480px\) \{[\s\S]*\.about-timeline \{ grid-template-columns: minmax\(0, 1fr\)/,
  );
  assert.match(
    styles,
    /@media \(prefers-contrast: more\) \{[\s\S]*\.about-principles-list > div/,
  );
});

test("the public screenshot profile captures the redesigned first viewport", () => {
  const targets = read("tests/mission-screenshot-targets.ts");
  const screenshots = read("tests/mission-screenshots.spec.ts");

  assert.match(targets, /key: "about-hero"/);
  assert.match(targets, /section\("Nosotros \/ Historia"\)/);
  assert.match(screenshots, /captureProfiles\.public\)\.toHaveLength\(17\)/);
});
