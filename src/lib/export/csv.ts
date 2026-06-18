/** Serialise rows to CSV and trigger a browser download (client-only). */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const content = [headers, ...rows]
    .map((r) => r.map(esc).join(","))
    .join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
