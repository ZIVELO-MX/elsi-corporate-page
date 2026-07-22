import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

test("provider and shared UI avoid unstable values and index keys", () => {
  const auth = read("components/auth-context.tsx");
  const carousel = read("components/ui/carousel.tsx");
  const field = read("components/ui/field.tsx");

  assert.match(auth, /const value = useMemo/);
  assert.match(auth, /<AuthContext\.Provider value=\{value\}>/);
  assert.match(carousel, /const contextValue = React\.useMemo/);
  assert.match(carousel, /<CarouselContext\.Provider value=\{contextValue\}>/);
  assert.doesNotMatch(carousel, /setApi/);
  assert.match(field, /key=\{error\.message\}/);
  assert.doesNotMatch(field, /key=\{index\}/);
});

test("public forms and images use framework-native behavior", () => {
  const contactForm = read("components/public-contact-form.tsx");
  const image = read("components/safe-image.tsx");

  assert.match(contactForm, /action=\{handleSubmit\}/);
  assert.doesNotMatch(contactForm, /preventDefault/);
  assert.match(image, /import Image from "next\/image"/);
  assert.match(image, /<Image/);
  assert.doesNotMatch(image, /<img/);
});

test("fonts are self-hosted by Next and pnpm policy is hardened", () => {
  const layout = read("app/layout.tsx");
  const workspace = read("pnpm-workspace.yaml");

  assert.match(layout, /from "next\/font\/google"/);
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
  assert.match(workspace, /minimumReleaseAge: 10080/);
  assert.match(workspace, /trustPolicy: no-downgrade/);
});

test("generated Design Canvas runtime and unused components stay out of source", () => {
  const gitignore = read(".gitignore");

  assert.match(gitignore, /^\/import\/$/m);
  assert.equal(existsSync(resolve(process.cwd(), "import/support.js")), false);
  assert.equal(existsSync(resolve(process.cwd(), "components/section-label-toggle.tsx")), false);
  assert.equal(existsSync(resolve(process.cwd(), "components/ui/accordion.tsx")), false);
});
