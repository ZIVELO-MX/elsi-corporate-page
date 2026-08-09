import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CERTIFICATE_UPLOAD_CONCURRENCY,
  certificateFileFingerprint,
  hasPdfSignature,
  runWithConcurrency,
  validateCertificateFileMetadata,
} from "../lib/certificate-files.ts";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("certificate validation rejects empty, oversized, wrong-type, and forged files", () => {
  assert.match(validateCertificateFileMetadata({ name: "empty.pdf", type: "application/pdf", size: 0 }), /vacío/);
  assert.match(validateCertificateFileMetadata({ name: "large.pdf", type: "application/pdf", size: 11 * 1024 * 1024 }), /10 MB/);
  assert.match(validateCertificateFileMetadata({ name: "image.png", type: "image/png", size: 20 }), /PDF/);
  assert.equal(validateCertificateFileMetadata({ name: "valid.pdf", type: "application/pdf", size: 20 }), null);
  assert.equal(hasPdfSignature(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d])), true);
  assert.equal(hasPdfSignature(Uint8Array.from([0x25, 0x50, 0x4e, 0x47, 0x2d])), false);
  assert.equal(certificateFileFingerprint({ name: " constancia.PDF ", type: "application/pdf", size: 20, lastModified: 7 }), "constancia.pdf:20:7");
});

test("certificate uploads never exceed the configured concurrency", async () => {
  let active = 0;
  let maximum = 0;
  const completed = [];
  await runWithConcurrency(Array.from({ length: 11 }, (_, index) => index), CERTIFICATE_UPLOAD_CONCURRENCY, async (item) => {
    active += 1;
    maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 3));
    completed.push(item);
    active -= 1;
  });
  assert.equal(maximum, CERTIFICATE_UPLOAD_CONCURRENCY);
  assert.deepEqual(completed.toSorted((a, b) => a - b), Array.from({ length: 11 }, (_, index) => index));
});

test("remote pickers expose identity, course operations, and bounded server searches", async () => {
  const pickers = await read("components/admin/enrollment-pickers.tsx");
  assert.match(pickers, /function UserPicker/);
  assert.match(pickers, /AvatarImage/);
  assert.match(pickers, /user\.name[\s\S]*user\.email/);
  assert.match(pickers, /\/api\/admin\/users\?/);
  assert.match(pickers, /role: "student"/);
  assert.match(pickers, /function CoursePicker/);
  assert.match(pickers, /course\.modality[\s\S]*course\.students/);
  assert.match(pickers, /course\.is_active/);
  assert.match(pickers, /pageSize: "8"/);
  assert.match(pickers, /aria-live="polite"/);
});

test("enrollment workspace persists filters in the URL and groups rows by course", async () => {
  const [screen, route] = await Promise.all([
    read("app/admin/inscripciones/page.tsx"),
    read("app/api/admin/enrollments/route.ts"),
  ]);
  assert.match(screen, /useSearchParams/);
  assert.match(screen, /history\.replaceState/);
  assert.match(screen, /courseId/);
  assert.match(screen, /certificateFilter/);
  assert.match(screen, /groups\.get\(enrollment\.courseId\)/);
  assert.match(screen, /grouped\.map/);
  assert.match(route, /certificateJoin/);
  assert.match(route, /certificates\.status/);
  assert.match(route, /certificate === "none"/);
});

test("every PDF is mapped by enrollment id with per-item status and retry", async () => {
  const [dialog, route] = await Promise.all([
    read("components/admin/certificate-upload-dialog.tsx"),
    read("app/api/admin/enrollments/[id]/certificate/route.ts"),
  ]);
  assert.match(dialog, /initialEntries\(enrollments\)/);
  assert.match(dialog, /entry\.enrollment\.id/);
  assert.match(dialog, /certificateFileFingerprint/);
  assert.match(dialog, /validateCertificateFile/);
  assert.match(dialog, /CERTIFICATE_UPLOAD_CONCURRENCY/);
  assert.match(dialog, /Reintentar/);
  assert.match(dialog, /status: result\.ok \? "success" : "error"/);
  assert.doesNotMatch(dialog, /files\[index\]|certificateTarget\.map\(\(.*index/);
  assert.match(route, /42703[\s\S]*PGRST204/);
});
