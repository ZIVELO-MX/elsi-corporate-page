import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("Home follows one progressive editorial journey without a service carousel", () => {
  const home = read("app/page.tsx");

  for (const section of [
    "Home / Hero editorial",
    "Home / Índice de soluciones",
    "Home / Historia documental",
    "Home / Cursos destacados",
    "Home / Preguntas frecuentes",
    "Home / Contacto integrado",
  ]) {
    assert.match(home, new RegExp(section.replaceAll("/", "\\/")));
  }

  assert.doesNotMatch(home, /Carousel|servicios\.map|timeline-grid/);
  assert.match(home, /<Link href="\/cursos">\s*Ver cursos\{" "\}/);
  assert.match(home, /<Link href="\/soluciones" className="home-text-link">\s*Ver soluciones/);
  assert.doesNotMatch(home, /Explorar soluciones|Solicitar información/);
  assert.match(home, /Archivo ELSI · Bee Blue/);
});

test("solutions use typed content and three explicit chapter compositions", () => {
  const data = read("lib/solutions.ts");
  const page = read("app/soluciones/page.tsx");

  assert.match(data, /satisfies readonly SolutionDefinition\[\]/);
  for (const layout of ["learning", "technical", "campus"]) {
    assert.match(data, new RegExp(`layout: "${layout}"`));
  }
  assert.match(page, /data-layout=\{solution\.layout\}/);
  assert.match(page, /aria-labelledby=\{titleId\}/);
  assert.match(page, /<dl className="solution-chapter-facts">/);
  assert.doesNotMatch(page, /<Card|solution-card|"use client"/);
});

test("editorial interactions stay device-aware and preserve system preferences", () => {
  const styles = read("app/globals.css");
  const button = read("components/ui/button.tsx");

  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*\.home-solution-index-item/);
  assert.match(styles, /@media \(prefers-reduced-transparency: reduce\)/);
  assert.match(styles, /@media \(prefers-contrast: more\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(button, /pointer-fine:hover/);
  assert.doesNotMatch(styles, /transition:\s*all/);
});

test("mission screenshot targets follow the editorial section contracts", () => {
  const targets = read("tests/mission-screenshot-targets.ts");

  for (const section of [
    "Home / Hero editorial",
    "Home / Historia documental",
    "Home / Índice de soluciones",
    "Home / Contacto integrado",
    "Soluciones / Introducción",
  ]) {
    assert.match(targets, new RegExp(section.replaceAll("/", "\\/")));
  }
});

test("the retired carousel does not leave dead code or a runtime dependency", () => {
  const packageJson = read("package.json");

  assert.doesNotMatch(packageJson, /embla-carousel-react/);
});
