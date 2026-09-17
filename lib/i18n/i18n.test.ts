/**
 * The translation-coverage tests TypeScript cannot write for you.
 *
 * `ko.ts` is annotated `: Messages`, so a MISSING key is already a compile
 * error. What the type system cannot see is a key that is present but not
 * actually translated — `''`, or the English string pasted through — which is
 * exactly the failure mode a half-finished translation produces.
 */

import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, isLocale, LOCALES, resolveLocale } from './config';
import { MESSAGES } from './messages';
import { en } from './messages/en';
import { ko } from './messages/ko';

type Leaf = [path: string, value: unknown];

/** Flattens a catalogue to `['palette.title', 'Command palette']` pairs. */
function leaves(node: unknown, prefix = ''): Leaf[] {
  if (node === null || typeof node !== 'object') return [[prefix, node]];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leaves(value, prefix ? `${prefix}.${key}` : key),
  );
}

/**
 * Identifiers that are correctly identical in both locales. Brand and product
 * names are never translated, and the search-keyword strings deliberately
 * carry both scripts so the palette is searchable either way.
 */
const SHARED_BY_DESIGN = new Set([
  'app.name',
  'palette.languageKeywords',
  // "NDA" is a protected identifier — it is not translated, in either
  // direction. Anything added here must be a deliberate decision, not a
  // convenient way to silence the check.
  'leads.ndaTitle',
  // "AI" is written the same way in Korean product copy.
  'conversations.senderAi',
  // "PoC" is a protected identifier, like NDA.
  'library.kindPoc',
]);

describe('locale config', () => {
  it('accepts only the supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('ja')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('falls back to English for anything unrecognised', () => {
    // A stale cookie from a removed locale must not blank the UI.
    expect(resolveLocale('ja')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('ko')).toBe('ko');
  });

  it('has a catalogue for every declared locale', () => {
    for (const locale of LOCALES) {
      expect(MESSAGES[locale], `no catalogue for ${locale}`).toBeDefined();
    }
  });
});

describe('korean catalogue', () => {
  const enLeaves = leaves(en);
  const koByPath = new Map(leaves(ko).map(([path, value]) => [path, value]));

  it('covers every key in the English source', () => {
    const missing = enLeaves.map(([path]) => path).filter((path) => !koByPath.has(path));
    expect(missing).toEqual([]);
  });

  it('adds no key the English source does not have', () => {
    const enPaths = new Set(enLeaves.map(([path]) => path));
    const extra = [...koByPath.keys()].filter((path) => !enPaths.has(path));
    expect(extra).toEqual([]);
  });

  it('keeps interpolation as functions of the same arity', () => {
    for (const [path, value] of enLeaves) {
      if (typeof value !== 'function') continue;
      const translated = koByPath.get(path);
      expect(typeof translated, `${path} is not a function in ko`).toBe('function');
      expect((translated as (...args: unknown[]) => unknown).length, path).toBe(value.length);
    }
  });

  it('has no empty strings', () => {
    const blank = [...koByPath.entries()]
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([path]) => path);
    expect(blank).toEqual([]);
  });

  it('does not leave English strings untranslated', () => {
    const untranslated = enLeaves
      .filter(([path, value]) => {
        if (typeof value !== 'string' || SHARED_BY_DESIGN.has(path)) return false;
        return koByPath.get(path) === value;
      })
      .map(([path]) => path);
    expect(untranslated).toEqual([]);
  });

  it('writes each language name in its own language', () => {
    // A switcher that says "Korean" in English is useless to the person who
    // needs it — they cannot read the label that would rescue them.
    expect(ko.palette.languageKorean).toContain('한국어');
    expect(en.palette.languageKorean).toContain('한국어');
  });

  it('interpolates into Korean, not around it', () => {
    expect(ko.palette.nothingMatches('리드')).toContain('리드');
    expect(en.palette.nothingMatches('leads')).toContain('leads');
  });
});
