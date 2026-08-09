export const CSV_BOM = "\uFEFF";
export const EXPORT_BATCH_SIZE = 500;

export type CsvValue = string | number | boolean | null | undefined;
export type CsvColumn<Row> = { header: string; value: (row: Row) => CsvValue };

export function encodeCsvCell(value: CsvValue) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]|^\s|\s$/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createCsv<Row>(columns: CsvColumn<Row>[], rows: Row[]) {
  const lines = [
    columns.map((column) => encodeCsvCell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => encodeCsvCell(column.value(row))).join(",")),
  ];
  return `${CSV_BOM}${lines.join("\r\n")}\r\n`;
}

export async function fetchAllPages<Row>(loadPage: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: { message?: string } | null }>) {
  const rows: Row[] = [];
  for (let from = 0; ; from += EXPORT_BATCH_SIZE) {
    const result = await loadPage(from, from + EXPORT_BATCH_SIZE - 1);
    if (result.error) throw new Error(result.error.message ?? "No fue posible consultar la exportación");
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < EXPORT_BATCH_SIZE) return rows;
  }
}
