'use client';

/**
 * Bulk import dialog: upload → preview → importing → result.
 *
 * The shape is borrowed from the source project's importer; the 663-line
 * original is cut to its observable behaviour:
 *
 * - **Client-side preview for CSV only.** A CSV parses in microseconds with
 *   ~60 lines of code (`lib/entity/csv.ts`); XLSX needs a dependency the
 *   template refuses to carry for a preview. An `.xlsx` file skips straight
 *   to a "preview after upload" note and the server does the parsing — the
 *   backend must validate every row anyway, so the preview was never a
 *   contract, only a courtesy.
 * - **Per-row errors are the point of the result screen.** "3 of 10 failed"
 *   without which three and why teaches the user to re-upload blind. The
 *   `BulkImportResult` shape carries `errors: [{row, errors: {field: [msg]}}]`
 *   and the table renders exactly that.
 * - **The file is the payload.** No client-side mapping UI — column names
 *   must match the template downloadable from this dialog. A mapping step
 *   doubles the surface for the rare case of a hand-renamed header; renaming
 *   the header is easier than learning a mapping UI.
 */

import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState, type DragEvent } from 'react';

import { normalizeError } from '@/lib/api/errors';
import type { BulkImportResult } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { parseCsv } from '@/lib/entity/csv';

const MAX_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROWS = 6;

type Step = 'upload' | 'preview' | 'importing' | 'result';

interface EntityImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Singular display name, for copy: "Import Products". */
  entityName: string;
  /** Wire to `resource.useBulkImport().mutateAsync`. */
  onImport: (file: File) => Promise<BulkImportResult>;
  /** Wire to `resource.downloadImportTemplate`. */
  onDownloadTemplate?: () => void | Promise<void>;
}

export function EntityImport({
  open,
  onOpenChange,
  entityName,
  onImport,
  onDownloadTemplate,
}: EntityImportProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setDragActive(false);
  }

  function close(nextOpen: boolean) {
    // Mid-import the request is already on the wire; closing the dialog
    // would hide an outcome the user needs to see.
    if (step === 'importing') return;
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function accept(candidate: File) {
    setError(null);

    const name = candidate.name.toLowerCase();
    const isCsv = name.endsWith('.csv');
    if (!isCsv && !name.endsWith('.xlsx')) {
      setError('Only .csv and .xlsx files are supported.');
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError('File is larger than 10 MB. Split it and import in parts.');
      return;
    }

    setFile(candidate);
    if (isCsv) {
      const rows = parseCsv(await candidate.text());
      if (rows.length < 2) {
        setError('The file has a header but no data rows.');
        setFile(null);
        return;
      }
      setPreview(rows.slice(0, PREVIEW_ROWS + 1));
    } else {
      setPreview(null);
    }
    setStep('preview');
  }

  async function runImport() {
    if (!file) return;
    setStep('importing');
    setError(null);
    try {
      setResult(await onImport(file));
      setStep('result');
    } catch (importError) {
      // A transport or file-level failure (bad content type, oversized,
      // malformed beyond row errors). Row-level problems arrive as a normal
      // result and render in the result step instead.
      setError(normalizeError(importError).message);
      setStep('preview');
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) void accept(dropped);
  }

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-foreground/30" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-zoom-in rounded-lg border bg-popover p-5 text-popover-foreground shadow-lg"
          aria-describedby={undefined}
        >
          <Dialog.Title className="text-lg font-semibold">
            Import {entityName}s
          </Dialog.Title>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {step === 'upload' && (
            <div className="mt-4 animate-fade-in">
              {/* The zone is a real button, so keyboard users get the file
                  picker without needing drag-and-drop to be their input. */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={[
                  'flex w-full flex-col items-center gap-1 rounded-md border-2 border-dashed px-4 py-10 text-sm',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  dragActive
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-ring/60 hover:bg-muted/50',
                ].join(' ')}
              >
                <span className="font-medium">Drop a file here, or click to choose</span>
                <span className="text-muted-foreground">.csv or .xlsx, up to 10 MB</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const chosen = e.target.files?.[0];
                  if (chosen) void accept(chosen);
                  e.target.value = ''; // re-selecting the same file must re-fire
                }}
              />

              {onDownloadTemplate && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Column names must match the{' '}
                  <button
                    type="button"
                    onClick={() => onDownloadTemplate()}
                    className="underline underline-offset-2 transition-colors hover:text-primary"
                  >
                    import template
                  </button>
                  .
                </p>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="mt-4 animate-fade-in space-y-4">
              <p className="text-sm">
                <span className="font-medium">{file?.name}</span>{' '}
                <span className="text-muted-foreground">
                  ({Math.max(1, Math.round((file?.size ?? 0) / 1024))} KB)
                </span>
              </p>

              {preview ? (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Preview of the first rows</caption>
                    <thead className="border-b bg-muted/50 text-left">
                      <tr>
                        {preview[0].map((header, i) => (
                          <th key={i} scope="col" className="px-3 py-2 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, ri) => (
                        <tr key={ri} className="border-b last:border-0">
                          {preview[0].map((_, ci) => (
                            <td key={ci} className="px-3 py-2">
                              {row[ci] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Spreadsheet preview is not available for .xlsx — the rows are
                  validated by the server during import.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  Choose another file
                </Button>
                <Button size="sm" onClick={() => void runImport()}>
                  Import
                </Button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div
              className="mt-4 flex animate-fade-in flex-col items-center gap-3 py-8"
              role="status"
              aria-live="polite"
            >
              <div
                aria-hidden="true"
                className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              <p className="text-sm">Importing {file?.name}…</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="mt-4 animate-fade-in space-y-4">
              <p className="text-sm" role="status">
                Imported <span className="font-medium">{result.imported}</span> of{' '}
                <span className="font-medium">{result.total_rows}</span> rows
                {result.errors.length > 0 &&
                  ` — ${result.errors.length} row(s) failed and were skipped`}
                .
              </p>

              {result.errors.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Rows that failed to import</caption>
                    <thead className="border-b bg-muted/50 text-left">
                      <tr>
                        <th scope="col" className="w-16 px-3 py-2 font-medium">
                          Row
                        </th>
                        <th scope="col" className="px-3 py-2 font-medium">
                          Problem
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((rowError) => (
                        <tr key={rowError.row} className="border-b last:border-0 align-top">
                          <td className="px-3 py-2 font-mono" data-numeric>
                            {rowError.row}
                          </td>
                          <td className="px-3 py-2">
                            {Object.entries(rowError.errors).map(([field, messages]) => (
                              <p key={field}>
                                <span className="font-medium">{field}</span>:{' '}
                                {messages.join(' ')}
                              </p>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end">
                <Dialog.Close asChild>
                  <Button size="sm">Done</Button>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
