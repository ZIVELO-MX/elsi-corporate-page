import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("runtime versions are pinned across manifests and CI", async () => {
  const [packageJson, nodeVersion, lockfile, workflows] = await Promise.all([
    read("package.json").then(JSON.parse),
    read(".node-version"),
    read("pnpm-lock.yaml"),
    Promise.all(
      [
        ".github/workflows/ci.yml",
        ".github/workflows/deploy-cloudflare-main-preview.yml",
        ".github/workflows/publish-mission-screenshots.yml",
        ".github/workflows/seo.yml",
      ].map(read),
    ),
  ]);

  assert.equal(nodeVersion.trim(), "22.14.0");
  assert.equal(packageJson.packageManager, "pnpm@10.12.1");
  assert.equal(packageJson.dependencies.next, "16.2.7");
  assert.deepEqual(packageJson.engines, {
    node: ">=22.14.0 <25",
    pnpm: "10.12.1",
  });

  const directDependencies = [
    ...Object.values(packageJson.dependencies),
    ...Object.values(packageJson.devDependencies),
  ];
  assert.ok(directDependencies.every((version) => version !== "latest"));
  assert.ok(directDependencies.every((version) => !/[~^*]/.test(version)));
  assert.doesNotMatch(lockfile, /specifier: (latest|[~^*])/);
  assert.doesNotMatch(lockfile, /specifier: \^/);

  for (const workflow of workflows) {
    assert.match(workflow, /node-version-file: \.node-version/);
    assert.match(workflow, /pnpm install --frozen-lockfile/);
  }
});
