import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";

const routes = [
  "/",
  "/contacto",
  "/cursos",
  "/soluciones",
  "/nosotros",
  "/aviso-de-privacidad",
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
  const jsonLd = [...markup.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  return {
    route,
    title: value(markup, /<title>([^<]*)<\/title>/),
    description: value(markup, /<meta name="description" content="([^"]*)"\/?>/),
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
    hasLlmsAlternate: /<link(?=[^>]*rel="alternate")(?=[^>]*type="text\/plain")(?=[^>]*href="[^"]*\/llms\.txt")[^>]*>/.test(markup),
    hasAgentNavigationAlternate: /<link(?=[^>]*rel="alternate")(?=[^>]*type="application\/json")(?=[^>]*href="[^"]*\/api\/navigation")[^>]*>/.test(markup),
    jsonLd,
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
let discovery;

try {
  [results, discovery] = await Promise.all([
    Promise.all(routes.map(auditRoute)),
    Promise.all([
      fetch(`${baseUrl}/llms.txt`),
      fetch(`${baseUrl}/api/navigation`),
      fetch(`${baseUrl}/robots.txt`),
      fetch(`${baseUrl}/sitemap.xml`),
    ]),
  ]);
} finally {
  server.kill("SIGTERM");
  await once(server, "exit");
}

const byRoute = Object.fromEntries(results.map((result) => [result.route, result]));
const [llmsResponse, navigationResponse, robotsResponse, sitemapResponse] = discovery;
const [llms, navigation, robots, sitemap] = await Promise.all([
  llmsResponse.text(),
  navigationResponse.json(),
  robotsResponse.text(),
  sitemapResponse.text(),
]);

for (const route of [
  "/",
  "/contacto",
  "/cursos",
  "/soluciones",
  "/nosotros",
  "/aviso-de-privacidad",
  "/soluciones/capacitacion",
  "/cursos/fundamentos-de-educacion-ambiental",
]) {
  const result = byRoute[route];
  assert.ok(result.title, `${route} must have a title`);
  assert.ok(result.description, `${route} must have a meta description`);
  assert.equal(result.h1Count, 1, `${route} must render one initial H1`);
  assert.ok(result.hasOgImage, `${route} must provide an Open Graph image`);
  assert.equal(result.hasLlmsAlternate, true, `${route} must advertise llms.txt`);
  assert.equal(result.hasAgentNavigationAlternate, true, `${route} must advertise the agent manifest`);
}

const canonicalOrigin = byRoute["/"].canonical;
const canonicalUrl = new URL(canonicalOrigin);
assert.equal(canonicalUrl.protocol, "https:");
assert.equal(canonicalUrl.pathname, "/");
assert.equal(
  byRoute["/contacto"].canonical,
  `${canonicalOrigin}/contacto`,
);
assert.equal(
  byRoute["/soluciones/capacitacion"].canonical,
  `${canonicalOrigin}/soluciones/capacitacion`,
);
assert.equal(
  byRoute["/cursos/fundamentos-de-educacion-ambiental"].canonical,
  `${canonicalOrigin}/cursos/fundamentos-de-educacion-ambiental`,
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

assert.equal(llmsResponse.status, 200);
assert.match(llmsResponse.headers.get("content-type") ?? "", /^text\/plain/);
assert.match(llms, /^# ELSI\n> /);
assert.match(llms, /\/api\/navigation/);
assert.doesNotMatch(llms, /\/admin|\/profile|\/checkout|\/login|\/register/);
assert.equal(navigationResponse.status, 200);
assert.match(navigationResponse.headers.get("content-type") ?? "", /^application\/json/);
assert.match(navigationResponse.headers.get("x-robots-tag") ?? "", /noindex/);
assert.equal(navigation.schemaVersion, "1.0");
assert.equal(navigation.contentStatus, "preview");
assert.equal(new URL(navigation.baseUrl).origin, canonicalOrigin);
assert.deepEqual(navigation.resources, { courses: [], solutions: [] });
assert.ok(navigation.actions.every((action) => action.method === "GET" && action.readOnly));
assert.doesNotMatch(JSON.stringify(navigation), /\/admin|\/profile|\/checkout|\/login|\/register/);
assert.equal(robotsResponse.status, 200);
assert.match(robots, /Disallow: \/$/m);
assert.equal(sitemapResponse.status, 200);
assert.doesNotMatch(sitemap, /<url>/);

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

console.log(JSON.stringify({ pages: results, discovery: { llms: llmsResponse.status, navigation: navigationResponse.status, robots: robotsResponse.status, sitemap: sitemapResponse.status } }, null, 2));
