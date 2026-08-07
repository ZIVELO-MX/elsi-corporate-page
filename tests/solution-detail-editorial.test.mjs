import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("solution details render three editorial variants from the shared model", () => {
  const page = read("app/soluciones/[slug]/page.tsx");
  const solutions = read("lib/solutions.ts");

  assert.match(page, /className="solution-detail-hero"[\s\S]*data-layout=\{solution\.layout\}/);
  assert.match(page, /className="solution-detail-body"[\s\S]*data-layout=\{solution\.layout\}/);
  assert.match(solutions, /layout:\s*"learning"/);
  assert.match(solutions, /layout:\s*"technical"/);
  assert.match(solutions, /layout:\s*"campus"/);
});

test("solution details preserve semantic, provisional, and contextual content", () => {
  const page = read("app/soluciones/[slug]/page.tsx");

  assert.match(page, /<Breadcrumbs/);
  assert.doesNotMatch(page, /<PrototypeDataNote>/);
  assert.match(page, /<dl className="solution-detail-facts">/);
  assert.match(page, /<ol>/);
  assert.match(page, /solution\.audience/);
  assert.match(page, /solution\.delivery/);
  assert.match(page, /solution\.items\.map/);
  assert.match(page, /buildContactPath\(\{ solution: solution\.slug \}\)/);
  assert.doesNotMatch(page, /solution-back-link|solution-article-aside|<Badge/);
  assert.doesNotMatch(page, /[—–]/);
});

test("solution imagery remains optimized and free of inline presentation styles", () => {
  const page = read("app/soluciones/[slug]/page.tsx");

  assert.match(page, /solutionImages\[slug\]/);
  assert.match(page, /alt=\{image\.alt\}/);
  assert.match(page, /width=\{image\.width\}/);
  assert.match(page, /height=\{image\.height\}/);
  assert.match(page, /preload/);
  assert.doesNotMatch(page, /style=\{\{/);
});

test("editorial variants collapse to a single mobile reading order", () => {
  const styles = read("app/globals.css");

  for (const layout of ["learning", "technical", "campus"]) {
    assert.match(styles, new RegExp(`solution-detail-hero\\[data-layout="${layout}"\\]`));
  }
  assert.match(
    styles,
    /@media \(max-width: 800px\)[\s\S]*solution-detail-hero\[data-layout="learning"\][\s\S]*grid-template-areas: "copy" "media"/,
  );
  assert.match(
    styles,
    /@media \(max-width: 240px\)[\s\S]*solution-detail-facts \{ grid-template-columns: minmax\(0, 1fr\)/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /solution-article|solution-back-link/);
});

test("public screenshot coverage includes every solution layout", () => {
  const targets = read("tests/mission-screenshot-targets.ts");

  assert.match(targets, /solution-detail-learning/);
  assert.match(targets, /solution-detail-environmental/);
  assert.match(targets, /solution-detail-campus/);
});
