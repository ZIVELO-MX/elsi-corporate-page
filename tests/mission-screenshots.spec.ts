import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import sharp from "sharp";
import {
  captureKey,
  captureProfileNames,
  captureProfiles,
  getCaptureProfiles,
  getCaptureTargets,
  MAX_CAPTURE_COUNT,
  prepareCapture,
} from "./mission-screenshot-targets";

const API_ORIGIN = "https://zipform.zivelo.dev";
const SCREENSHOT_GROUP_KEY = "Screenshots";
const MAX_FILE_SIZE = 6_291_456;

type LocalCapture = {
  key: string;
  title: string;
  fileName: string;
  contentType: "image/png";
  sizeBytes: number;
  width: number;
  height: number;
  bytes: Buffer;
};

type PreparedBatch = {
  uploadBatchId: string;
  generation: number;
  groupKey: string;
  sourceRevision: string;
  status: "prepared" | "finalized";
  uploads: Array<{ key: string; uploadUrl: string }>;
};

type AttachmentGroup = {
  groupKey: string;
  sourceRevision: string;
  generation: number;
  attachments: Array<{ externalKey: string }>;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function zipformRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => null) as {
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok) {
    const code = payload?.error?.code ?? "UNKNOWN_ERROR";
    const message = payload?.error?.message ?? "Zipform request failed";
    throw new Error(`Zipform ${response.status} ${code}: ${message}`);
  }
  if (!payload?.data) throw new Error(`Zipform ${response.status}: response did not contain data`);
  return payload.data;
}

async function resolveMissionId(token: string): Promise<string> {
  const displayId = requiredEnv("MISSION_DISPLAY_ID");
  const detail = await zipformRequest<{ id: string }>(
    `/api/v1/missions/${encodeURIComponent(displayId)}`,
    token,
  );
  console.log(`Resolved ${displayId} → ${detail.id}`);
  return detail.id;
}

async function publishCaptures(files: LocalCapture[]) {
  const token = requiredEnv("ZIPFORM_TOKEN");
  const missionId = await resolveMissionId(token);
  const sourceRevision = requiredEnv("SOURCE_REVISION");

  if (!/^[0-9a-fA-F]{40}$/.test(sourceRevision)) {
    throw new Error("SOURCE_REVISION must be the full 40-character commit SHA");
  }

  const groupKey = SCREENSHOT_GROUP_KEY;
  const endpoint = `/api/v1/missions/${encodeURIComponent(missionId)}/attachments`;
  const prepared = await zipformRequest<PreparedBatch>(endpoint, token, {
    method: "POST",
    body: JSON.stringify({
      groupKey,
      sourceRevision,
      files: files.map((file) => ({
        key: file.key,
        title: file.title,
        fileName: file.fileName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        width: file.width,
        height: file.height,
      })),
    }),
  });

  if (prepared.groupKey !== groupKey || prepared.sourceRevision !== sourceRevision) {
    throw new Error("Prepared batch did not match the requested group and revision");
  }

  if (prepared.status === "prepared") {
    if (prepared.uploads.length !== files.length) {
      throw new Error(`Prepared batch returned ${prepared.uploads.length} uploads; expected ${files.length}`);
    }

    const uploadsByKey = new Map(prepared.uploads.map((upload) => [upload.key, upload]));
    for (const file of files) {
      const upload = uploadsByKey.get(file.key);
      if (!upload) throw new Error(`Prepared batch omitted upload key: ${file.key}`);
      const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.contentType },
        body: new Uint8Array(file.bytes),
      });
      if (!response.ok) {
        throw new Error(`Screenshot upload failed for ${file.key} with HTTP ${response.status}`);
      }
      console.log(`Uploaded ${file.key} (${file.sizeBytes} bytes)`);
    }

    await zipformRequest(endpoint, token, {
      method: "PUT",
      body: JSON.stringify({ uploadBatchId: prepared.uploadBatchId }),
    });
  }

  const groups = await zipformRequest<AttachmentGroup[]>(endpoint, token);
  const active = groups.find((group) => group.groupKey === groupKey);
  if (!active) throw new Error(`Verification did not find attachment group ${groupKey}`);
  if (active.sourceRevision !== sourceRevision) {
    throw new Error(`Verification found a different source revision for ${groupKey}`);
  }
  if (active.generation !== prepared.generation) {
    throw new Error(`Verification found generation ${active.generation}; expected ${prepared.generation}`);
  }

  const expectedKeys = files.map((file) => file.key).sort();
  const activeKeys = active.attachments.map((attachment) => attachment.externalKey).sort();
  if (activeKeys.length !== expectedKeys.length || activeKeys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error(`Verification found ${activeKeys.length} attachment keys; expected the complete ${expectedKeys.length}-file snapshot`);
  }

  console.log(`Verified ${groupKey} at generation ${active.generation} with ${activeKeys.length} screenshots`);
}

test("capture and optionally publish the TLOZ mission screenshot snapshot", async ({ page }, testInfo) => {
  expect(captureProfiles.public).toHaveLength(15);
  expect(captureProfiles.account).toHaveLength(2);
  expect(captureProfiles.admin).toHaveLength(1);

  const profiles = getCaptureProfiles(process.env.SCREENSHOT_PROFILE);
  const captureTargets = getCaptureTargets(profiles);
  const expectedCaptureCount = profiles.reduce(
    (count, profile) => count + captureProfiles[profile].length,
    0,
  );
  const keys = captureTargets.map(captureKey);

  expect(captureProfileNames).toEqual(["public", "account", "admin"]);
  expect(captureTargets).toHaveLength(expectedCaptureCount);
  expect(captureTargets.length).toBeLessThanOrEqual(MAX_CAPTURE_COUNT);
  expect(new Set(keys).size).toBe(expectedCaptureCount);

  const outputDirectory = testInfo.outputPath("screenshots");
  await mkdir(outputDirectory, { recursive: true });
  const files: LocalCapture[] = [];

  for (const target of captureTargets) {
    const locator = await prepareCapture(page, target);
    const bytes = await locator.screenshot({ type: "png", animations: "disabled" });
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Unable to determine dimensions for ${target.key}`);
    }
    if (bytes.byteLength > MAX_FILE_SIZE) {
      throw new Error(`${target.key} is ${bytes.byteLength} bytes; maximum is ${MAX_FILE_SIZE}`);
    }
    if (metadata.width > 10_000 || metadata.height > 10_000) {
      throw new Error(`${target.key} dimensions exceed 10,000 pixels`);
    }

    const key = captureKey(target);
    const fileName = `${key}.png`;
    await writeFile(`${outputDirectory}/${fileName}`, bytes);
    files.push({
      key,
      title: target.title,
      fileName,
      contentType: "image/png",
      sizeBytes: bytes.byteLength,
      width: metadata.width,
      height: metadata.height,
      bytes,
    });
    console.log(`Captured ${key} (${metadata.width}×${metadata.height}, ${bytes.byteLength} bytes)`);
  }

  if (process.env.PUBLISH_MISSION_SCREENSHOTS === "1") {
    await publishCaptures(files);
  } else {
    console.log(`Capture-only run complete: ${files.length} screenshots`);
  }
});
