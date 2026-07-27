import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Cloudflare preview remains CI-gated and isolated from production", async () => {
  const [workflow, wrangler, packageJson] = await Promise.all([
    read(".github/workflows/deploy-cloudflare-main-preview.yml"),
    read("wrangler.jsonc"),
    read("package.json").then(JSON.parse),
  ]);

  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows: \["CI"\]/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /github\.event\.workflow_run\.event == 'push'/);
  assert.match(workflow, /github\.event\.workflow_run\.head_branch == 'main'/);
  assert.match(workflow, /ref: \$\{\{ env\.SOURCE_REVISION \}\}/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.doesNotMatch(workflow, /pull_request:/);

  assert.match(wrangler, /"name": "elsi-main-preview"/);
  assert.match(wrangler, /"workers_dev": true/);
  assert.match(wrangler, /"preview_urls": true/);
  assert.match(wrangler, /"binding": "IMAGES"/);
  assert.doesNotMatch(wrangler, /"routes"|"r2_buckets"|"d1_databases"/);

  assert.equal(
    packageJson.scripts["cloudflare:build"],
    "opennextjs-cloudflare build",
  );
  assert.equal(packageJson.dependencies["@opennextjs/cloudflare"], "1.20.1");
  assert.equal(packageJson.devDependencies.wrangler, "^4.114.0");
});

test("ELSI preview stays public, non-indexable, and smoke-testable", async () => {
  const config = (
    await import("../.zivelo/cloudflare-preview.config.mjs")
  ).default;
  assert.equal(config.workerName, "elsi-main-preview");
  assert.deepEqual(config.buildEnvironment, {
    NEXT_PUBLIC_PROTOTYPE_MODE: "1",
    NEXT_PUBLIC_CONTENT_STATUS: "fixture",
    NEXT_PUBLIC_SECTION_LABELS: "0",
  });
  assert.deepEqual(
    config.healthChecks.map((check) => check.path),
    [
      "/",
      "/api/auth/session",
      "/robots.txt",
      "/_next/image?url=%2Fhero-bg.jpg&w=640&q=75",
    ],
  );
  assert.ok(config.healthChecks.every((check) => check.status === 200));
});
