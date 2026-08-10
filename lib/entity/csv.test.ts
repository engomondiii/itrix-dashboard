import { describe, expect, it } from 'vitest';

import { parseCsv, parseCsvRecords } from './csv';

describe('parseCsv', () => {
  it('parses plain rows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with commas and newlines', () => {
    expect(parseCsv('name,note\n"Desk, oak","line one\nline two"')).toEqual([
      ['name', 'note'],
      ['Desk, oak', 'line one\nline two'],
    ]);
  });

  it('unescapes doubled quotes', () => {
    expect(parseCsv('title\n"the ""big"" one"')).toEqual([['title'], ['the "big" one']]);
  });

  it('handles CRLF and a missing trailing newline', () => {
    expect(parseCsv('a,b\r\n1,2\r\n3,4')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('strips a UTF-8 BOM so the first header matches', () => {
    expect(parseCsv('﻿sku,name\nX,Y')).toEqual([
      ['sku', 'name'],
      ['X', 'Y'],
    ]);
  });

  it('drops trailing blank lines', () => {
    expect(parseCsv('a\n1\n\n')).toEqual([['a'], ['1']]);
  });
});

describe('parseCsvRecords', () => {
  it('keys records by trimmed header and fills short rows with empty strings', () => {
    const { headers, records } = parseCsvRecords(' sku ,name\nA1,Desk\nB2');
    expect(headers).toEqual(['sku', 'name']);
    expect(records).toEqual([
      { sku: 'A1', name: 'Desk' },
      { sku: 'B2', name: '' },
    ]);
  });

  it('returns empty for an empty file', () => {
    expect(parseCsvRecords('')).toEqual({ headers: [], records: [] });
  });
});
