import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const MISSION_LINE =
  /^\s*(?:Misión\s+ID|Mision\s+ID|Mission\s+ID):\s*(ELS-[0-9]{4})\s*$/gimu;
const SCREENSHOTS_REQUIRED = /^\s*-\s*\[x\]\s+Requiere capturas\s*$/gimu;
const SCREENSHOTS_NOT_REQUIRED = /^\s*-\s*\[x\]\s+No requiere capturas\s*$/gimu;
const PROFILE_LINE =
  /^[ \t]*(?:Perfil(?:es)?|Perfil\(es\)) de capturas:[ \t]*([^\r\n]*)[ \t]*$/gimu;
const KNOWN_PROFILES = new Set(["public", "account", "admin"]);

// HTML comments in the PR template (field hints, placeholders) are guidance, not
// content — they must never be parsed as a mission id, a checkbox or a profile.
// Strip closed comments, and also drop a dangling unclosed `<!--` to end of body
// (in HTML/Markdown everything after an unclosed comment is commented out anyway).
function normalizeBody(body) {
  return String(body || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!--[\s\S]*$/g, "");
}

export function extractMissionDisplayId(body) {
  const matches = [...normalizeBody(body).matchAll(MISSION_LINE)]
    .map((match) => match[1].toUpperCase());
  const uniqueMatches = [...new Set(matches)];

  if (uniqueMatches.length === 0) return null;
  if (uniqueMatches.length > 1) {
    throw new Error("PR description must contain exactly one mission ID");
  }
  return uniqueMatches[0];
}

export function extractScreenshotDecision(body) {
  const text = normalizeBody(body);
  const required = [...text.matchAll(SCREENSHOTS_REQUIRED)].length;
  const notRequired = [...text.matchAll(SCREENSHOTS_NOT_REQUIRED)].length;

  if (required > 1 || notRequired > 1 || (required && notRequired)) {
    throw new Error("PR description must select exactly one screenshot option");
  }
  if (required) return true;
  if (notRequired) return false;
  return null;
}

export function extractScreenshotProfiles(body) {
  const matches = [...normalizeBody(body).matchAll(PROFILE_LINE)];
  if (matches.length > 1) {
    throw new Error("PR description must contain exactly one screenshot profile field");
  }
  if (matches.length === 0 || !matches[0][1].trim()) return [];

  const profiles = matches[0][1]
    .split(/[\s,]+/)
    .map((profile) => profile.trim().toLowerCase())
    .filter(Boolean);
  const uniqueProfiles = [...new Set(profiles)];
  const unknown = uniqueProfiles.filter((profile) => !KNOWN_PROFILES.has(profile));
  if (unknown.length) {
    throw new Error(`Unknown screenshot profile(s): ${unknown.join(", ")}`);
  }
  return uniqueProfiles;
}

export function resolvePrMetadata(body) {
  const displayId = extractMissionDisplayId(body);
  const screenshotsRequired = extractScreenshotDecision(body);
  const profiles = extractScreenshotProfiles(body);

  if (screenshotsRequired === false) {
    return { skip: true, reason: "Screenshots explicitly marked as not required" };
  }
  if (!displayId && screenshotsRequired === null) {
    return { skip: true, reason: "No completed mission or screenshot decision" };
  }
  if (!displayId && screenshotsRequired === true) {
    throw new Error("PR requests screenshots but does not include a mission ID");
  }
  if (displayId && screenshotsRequired === null) {
    throw new Error("PR description must select exactly one screenshot option");
  }
  if (screenshotsRequired === true && profiles.length === 0) {
    throw new Error("PR requests screenshots but does not include a screenshot profile");
  }

  return { skip: false, displayId, profiles };
}

async function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) throw new Error("GITHUB_OUTPUT is not set");
  await appendFile(outputPath, `${name}=${value}\n`, "utf8");
}

async function main() {
  const metadata = resolvePrMetadata(process.env.PR_BODY);
  await writeOutput("skip", String(metadata.skip));

  if (metadata.skip) {
    console.log(`${metadata.reason}; skipping screenshots`);
    return;
  }

  await writeOutput("display_id", metadata.displayId);
  await writeOutput("profile", metadata.profiles.join(","));
  console.log(
    `Screenshots requested for ${metadata.displayId}: ${metadata.profiles.join(", ")}`,
  );
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntrypoint) {
  main().catch((error) => {
    console.error(
      `PR metadata resolution failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  });
}
