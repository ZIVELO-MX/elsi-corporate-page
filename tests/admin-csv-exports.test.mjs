import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CSV_BOM, createCsv, encodeCsvCell, fetchAllPages } from "../lib/csv.ts";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("CSV uses a UTF-8 BOM, CRLF, escaping, and formula neutralization", () => {
  const csv = createCsv([
    { header: "nombre", value: (row) => row.name },
    { header: "notas", value: (row) => row.notes },
  ], [
    { name: "María, José", notes: "Línea 1\nLínea \"2\"" },
    { name: "=HYPERLINK(\"x\")", notes: " áéí " },
  ]);
  assert.ok(csv.startsWith(CSV_BOM));
  assert.match(csv, /^\uFEFFnombre,notas\r\n/);
  assert.match(csv, /"María, José","Línea 1\nLínea ""2"""\r\n/);
  assert.match(csv, /'\=HYPERLINK/);
  assert.equal(encodeCsvCell("+SUM(A1:A2)"), "'+SUM(A1:A2)");
  assert.ok(csv.endsWith("\r\n"));
});

test("complete exports continue beyond the first 500 rows", async () => {
  const source = Array.from({ length: 1_203 }, (_, id) => ({ id }));
  const ranges = [];
  const rows = await fetchAllPages(async (from, to) => {
    ranges.push([from, to]);
    return { data: source.slice(from, to + 1), error: null };
  });
  assert.equal(rows.length, 1_203);
  assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]]);
});

test("all five admin sections expose protected, filtered exports", async () => {
  const entities = ["users", "courses", "enrollments", "orders", "leads"];
  for (const entity of entities) {
    const route = await read(`app/api/admin/${entity}/export/route.ts`);
    assert.match(route, /createAdminCsvExport/);
    assert.match(route, /parseAdminQuery/);
  }
  const helper = await read("lib/admin-csv.ts");
  assert.match(helper, /requireAdminClient/);
  assert.match(helper, /x-elsi-export-confirmed/);
  assert.match(helper, /audit_events/);
  assert.match(helper, /entity, filters: exportFilters\(request\), count/);
  assert.match(helper, /status: "processed"/);
  assert.doesNotMatch(helper, /rows.*metadata|content.*metadata/);
});

test("admin screens send their active filters to export controls", async () => {
  const screens = await Promise.all([
    "usuarios", "cursos", "inscripciones", "ventas", "contacto",
  ].map((section) => read(`app/admin/${section}/page.tsx`)));
  for (const screen of screens) {
    assert.match(screen, /AdminExportButton/);
    assert.match(screen, /params=/);
  }
});
