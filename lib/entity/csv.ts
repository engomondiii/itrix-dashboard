/**
 * A small CSV parser, hand-rolled on purpose.
 *
 * It exists for two callers with modest needs: the import dialog's instant
 * preview, and the demo backend's import handler. Both want "rows of
 * strings", not a streaming parser for gigabyte files — the import cap is
 * 10 MB. A dependency would bring options neither caller uses.
 *
 * What it does handle, because real spreadsheet exports contain all of it:
 * quoted fields, commas inside quotes, `""` as an escaped quote, newlines
 * inside quoted fields, CRLF line endings, and a UTF-8 BOM.
 */

export function parseCsv(text: string): string[][] {
  // Excel on Windows prefixes UTF-8 files with a BOM; left in place it
  // becomes part of the first header name and no column ever matches.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1; // consume the escape's second quote
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1; // CRLF
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  // Final field/row when the file does not end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Trailing blank lines parse as [''] — drop them rather than making every
  // consumer special-case an "empty row" that was never data.
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** First row as headers, rest as records keyed by header name. */
export function parseCsvRecords(text: string): {
  headers: string[];
  records: Array<Record<string, string>>;
} {
  const rows = parseCsv(text);
  if (rows.length === 0) return { headers: [], records: [] };

  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ''])),
  );
  return { headers, records };
}
