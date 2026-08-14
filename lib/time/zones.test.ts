import { describe, expect, it } from 'vitest';

import {
  OPERATING_SITE,
  SITES,
  clockAt,
  formatInstant,
  hoursFromOperating,
  labelledClockAt,
} from './zones';

const NAIROBI = SITES.find((site) => site.key === 'nairobi')!;

// 2026-08-14T06:04:00Z → 15:04 in Seoul, 09:04 in Nairobi.
const INSTANT = '2026-08-14T06:04:00.000Z';

describe('the operating clock', () => {
  it('is Seoul', () => {
    expect(OPERATING_SITE.timeZone).toBe('Asia/Seoul');
    expect(OPERATING_SITE.label).toBe('KST');
  });

  it('renders a fixed zone regardless of where the browser is', () => {
    // The whole point of the module: this must not follow the machine's zone.
    expect(clockAt(OPERATING_SITE, new Date(INSTANT))).toBe('15:04');
    expect(clockAt(NAIROBI, new Date(INSTANT))).toBe('09:04');
  });

  it('names the zone alongside the time', () => {
    expect(labelledClockAt(OPERATING_SITE, new Date(INSTANT))).toBe('15:04 KST');
  });
});

describe('formatInstant', () => {
  it('gives a day-first date and a named zone', () => {
    expect(formatInstant(INSTANT)).toBe('14 Aug, 15:04 KST');
  });

  it('renders the same instant in a second site without re-parsing', () => {
    expect(formatInstant(INSTANT, { site: NAIROBI })).toBe('14 Aug, 09:04 EAT');
  });

  it('can drop the date for same-day contexts', () => {
    expect(formatInstant(INSTANT, { timeOnly: true })).toBe('15:04 KST');
  });

  it('is 24-hour — "3:04 pm" in a handover note is an incident waiting', () => {
    expect(formatInstant('2026-08-14T06:04:00.000Z')).not.toMatch(/[ap]m/i);
    // 22:30 KST, the middle of the Seoul evening shift.
    expect(formatInstant('2026-08-14T13:30:00.000Z')).toBe('14 Aug, 22:30 KST');
  });

  it('returns empty for junk rather than "Invalid Date"', () => {
    expect(formatInstant(null)).toBe('');
    expect(formatInstant('not a date')).toBe('');
    expect(formatInstant(undefined)).toBe('');
  });
});

describe('hoursFromOperating', () => {
  it('puts Nairobi six hours behind Seoul', () => {
    expect(hoursFromOperating(NAIROBI, new Date(INSTANT))).toBe(-6);
  });

  it('is zero for the operating site itself', () => {
    expect(hoursFromOperating(OPERATING_SITE, new Date(INSTANT))).toBe(0);
  });

  it('still holds in January — neither zone observes DST', () => {
    // Pinned deliberately: if either zone ever adopts DST this breaks here
    // rather than quietly mis-stating a shift handover time.
    expect(hoursFromOperating(NAIROBI, new Date('2026-01-15T06:04:00.000Z'))).toBe(-6);
  });
});
