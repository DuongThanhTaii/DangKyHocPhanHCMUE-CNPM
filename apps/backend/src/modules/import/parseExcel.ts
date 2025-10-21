import * as XLSX from "xlsx";

export type Row = Record<string, any>;

export function readFirstSheetRows(buf: Buffer): Row[] {
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null, raw: true });
  // Chuẩn hoá key: trim -> snake_case đơn giản
  return json.map(normalizeKeys);
}

function normalizeKeys(obj: Row): Row {
  const out: Row = {};
  Object.keys(obj).forEach((k) => {
    const nk = String(k).trim().toLowerCase().replace(/\s+/g, "_");
    out[nk] = obj[k];
  });
  return out;
}
