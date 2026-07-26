import assert from "node:assert/strict";
import test from "node:test";
import {
  extractMissionDisplayId,
  extractScreenshotDecision,
  extractScreenshotProfiles,
  resolvePrMetadata,
} from "../scripts/screenshots/resolve-pr.mjs";

test("extracts only a structured ELSI mission field", () => {
  assert.equal(extractMissionDisplayId("Misión ID: ELS-0027"), "ELS-0027");
  assert.equal(extractMissionDisplayId("Mission ID: els-0027"), "ELS-0027");
  assert.equal(extractMissionDisplayId("Fixes ELS-0027\n\nMisión ID: ELS-XXXX"), null);
});

test("rejects multiple structured mission fields", () => {
  assert.throws(
    () => extractMissionDisplayId("Misión ID: ELS-0027\nMission ID: ELS-0028"),
    /exactly one mission ID/,
  );
});

test("uses exactly one screenshot checkbox as the source of truth", () => {
  assert.equal(extractScreenshotDecision("- [x] Requiere capturas"), true);
  assert.equal(extractScreenshotDecision("- [x] No requiere capturas"), false);
  assert.equal(extractScreenshotDecision("- [ ] Requiere capturas"), null);
  assert.throws(
    () => extractScreenshotDecision("- [x] Requiere capturas\n- [x] No requiere capturas"),
    /exactly one screenshot option/,
  );
});

test("parses and validates versioned profile names", () => {
  assert.deepEqual(
    extractScreenshotProfiles("Perfil(es) de capturas: public, account admin, public"),
    ["public", "account", "admin"],
  );
  assert.throws(
    () => extractScreenshotProfiles("Perfil(es) de capturas: public, tablet"),
    /Unknown screenshot profile\(s\): tablet/,
  );
  assert.throws(
    () => extractScreenshotProfiles(
      "Perfil(es) de capturas: public\nPerfil(es) de capturas: admin",
    ),
    /exactly one screenshot profile field/,
  );
});

test("skips expected non-screenshot scenarios", () => {
  assert.deepEqual(resolvePrMetadata(""), {
    skip: true,
    reason: "No completed mission or screenshot decision",
  });
  assert.deepEqual(
    resolvePrMetadata("Misión ID: ELS-0027\n- [x] No requiere capturas"),
    {
      skip: true,
      reason: "Screenshots explicitly marked as not required",
    },
  );
});

test("requires a mission, one decision, and at least one profile", () => {
  assert.throws(
    () => resolvePrMetadata("- [x] Requiere capturas\nPerfil(es) de capturas: public"),
    /does not include a mission ID/,
  );
  assert.throws(
    () => resolvePrMetadata("Misión ID: ELS-0027"),
    /exactly one screenshot option/,
  );
  assert.throws(
    () => resolvePrMetadata("Misión ID: ELS-0027\n- [x] Requiere capturas"),
    /does not include a screenshot profile/,
  );
});

test("returns normalized metadata for a valid screenshot request", () => {
  assert.deepEqual(
    resolvePrMetadata(
      "Misión ID: ELS-0027\n- [x] Requiere capturas\nPerfil(es) de capturas: public, admin",
    ),
    {
      skip: false,
      displayId: "ELS-0027",
      profiles: ["public", "admin"],
    },
  );
});

test("ignores HTML comments so template hints are not parsed as profiles", () => {
  // Reproduces the CI failure: a commented placeholder was read as "<!--".
  assert.deepEqual(
    extractScreenshotProfiles("Perfil(es) de capturas: <!-- public, account, admin -->"),
    [],
  );
  // A real value with the template's comment block below the field still parses.
  assert.deepEqual(
    extractScreenshotProfiles(
      "Perfil(es) de capturas: public\n<!--\n  hint: public, account, admin\n-->",
    ),
    ["public"],
  );
  // A dangling unclosed comment must not leak into the parsed value either.
  assert.deepEqual(extractScreenshotProfiles("Perfil(es) de capturas: <!-- public"), []);
});

test("resolves the unfilled PR template to a clean skip (no unknown-profile error)", () => {
  const template = [
    "## Misión de Zipform",
    "Misión ID: ELS-XXXX",
    "<!-- Completa el ID si el cambio pertenece a una misión. -->",
    "### Capturas",
    "- [ ] Requiere capturas",
    "- [ ] No requiere capturas",
    "Perfil(es) de capturas:",
    "<!--",
    "  Si requiere capturas, lista uno o más perfiles: public, account, admin.",
    "-->",
  ].join("\n");
  assert.deepEqual(resolvePrMetadata(template), {
    skip: true,
    reason: "No completed mission or screenshot decision",
  });
});
