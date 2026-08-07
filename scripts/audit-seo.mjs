import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const routes = [
  "/",
  "/contacto",
  "/cursos",
  "/soluciones",
  "/soluciones/capacitacion",
  "/cursos/fundamentos-de-educacion-ambiental",
  "/login",
  "/register",
  "/profile",
  "/admin",
];
const port = Number(process.env.SEO_AUDIT_PORT ?? 3147);
const baseUrl = `http://127.0.0.1:${port}`;

function value(markup, pattern) {
  return markup.match(pattern)?.[1] ?? "";
}

async function auditRoute(route) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.status, 200, `${route} must respond with 200`);
  const markup = await response.text();
  return {
    route,
    title: value(markup, /<title>([^<]*)<\/title>/),
    canonical: value(
      markup,
      /<link rel="canonical" href="([^"]*)"\/?>/,
    ),
    robots: value(markup, /<meta name="robots" content="([^"]*)"\/?>/),
    h1Count: (markup.match(/<h1(?:\s|>)/g) ?? []).length,
    hasOgImage: /<meta property="og:image" content="[^"]+"/.test(markup),
    hasManifest: /<link rel="manifest" href="[^"]+manifest\.webmanifest"/.test(
      markup,
    ),
    hasIcon: /<link rel="icon" href="[^"]+"/.test(markup),
  };
}

async function startServer() {
  const nextBin = resolve(process.cwd(), "node_modules/next/dist/bin/next");
  const server = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk;
  });
  server.stderr.on("data", (chunk) => {
    output += chunk;
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next exited before the audit started.\n${output}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return server;
    } catch {
      // The server is still warming up.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }

  server.kill("SIGTERM");
  throw new Error(`Next did not become ready for the SEO audit.\n${output}`);
}

const server = await startServer();
let results;

try {
  results = await Promise.all(routes.map(auditRoute));
} finally {
  server.kill("SIGTERM");
  await once(server, "exit");
}

const byRoute = Object.fromEntries(results.map((result) => [result.route, result]));

for (const route of [
  "/",
  "/contacto",
  "/cursos",
  "/soluciones",
  "/soluciones/capacitacion",
  "/cursos/fundamentos-de-educacion-ambiental",
]) {
  const result = byRoute[route];
  assert.ok(result.title, `${route} must have a title`);
  assert.equal(result.h1Count, 1, `${route} must render one initial H1`);
  assert.ok(result.hasOgImage, `${route} must provide an Open Graph image`);
}

assert.equal(byRoute["/"].canonical, "https://elsi.example.com");
assert.equal(
  byRoute["/contacto"].canonical,
  "https://elsi.example.com/contacto",
);
assert.equal(
  byRoute["/soluciones/capacitacion"].canonical,
  "https://elsi.example.com/soluciones/capacitacion",
);
assert.equal(
  byRoute["/cursos/fundamentos-de-educacion-ambiental"].canonical,
  "https://elsi.example.com/cursos/fundamentos-de-educacion-ambiental",
);
assert.doesNotMatch(
  byRoute["/soluciones/capacitacion"].title,
  /ELSI.*ELSI/,
);
assert.match(
  byRoute["/cursos/fundamentos-de-educacion-ambiental"].title,
  /· ELSI$/,
);
assert.equal(byRoute["/"].hasManifest, true);
assert.equal(byRoute["/"].hasIcon, true);

for (const route of [
  "/login",
  "/register",
  "/profile",
  "/admin",
]) {
  const result = byRoute[route];
  assert.match(result.robots, /noindex/, `${route} must be noindex`);
  assert.notEqual(
    result.canonical,
    "https://elsi.example.com",
    `${route} must not canonicalize to home`,
  );
}

console.log(JSON.stringify(results, null, 2));
