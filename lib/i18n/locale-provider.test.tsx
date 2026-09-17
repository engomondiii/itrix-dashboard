/**
 * The provider's contract: what the app reads, and what survives a reload.
 *
 * The cookie assertions are the load-bearing ones. The whole reason this
 * console stores the locale in a cookie rather than localStorage is so the
 * server can read it and render the right language directly — if the cookie
 * stops being written, that silently degrades to Surface 1's behaviour (an
 * English first paint that flips after hydration) with no visible error.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCALE_COOKIE } from './config';
import { LocaleProvider, useCopy, useLocale } from './locale-provider';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

function Probe() {
  const { locale, setLocale } = useLocale();
  const copy = useCopy();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="today">{copy.nav.today}</span>
      <button onClick={() => setLocale('ko')}>ko</button>
      <button onClick={() => setLocale('en')}>en</button>
    </div>
  );
}

function renderWith(initialLocale: 'en' | 'ko') {
  return render(
    <LocaleProvider initialLocale={initialLocale}>
      <Probe />
    </LocaleProvider>,
  );
}

beforeEach(() => {
  refresh.mockClear();
  // Expire anything a previous test wrote; jsdom shares one document.cookie.
  document.cookie = `${LOCALE_COOKIE}=; Path=/; Max-Age=0`;
});

describe('LocaleProvider', () => {
  it('renders the language the server chose, with no effect needed', () => {
    // Seeding from a prop rather than reading storage in an effect is what
    // makes the first client render match the server's.
    renderWith('ko');
    expect(screen.getByTestId('locale')).toHaveTextContent('ko');
    expect(screen.getByTestId('today')).toHaveTextContent('오늘');
  });

  it('serves the English catalogue by default', () => {
    renderWith('en');
    expect(screen.getByTestId('today')).toHaveTextContent('Today');
  });

  it('switches the catalogue and persists to the cookie the server reads', async () => {
    const user = userEvent.setup();
    renderWith('en');

    await user.click(screen.getByRole('button', { name: 'ko' }));

    expect(screen.getByTestId('today')).toHaveTextContent('오늘');
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=ko`);
    expect(document.documentElement.lang).toBe('ko');
  });

  it('refreshes so server-rendered segments re-render in the new language', async () => {
    const user = userEvent.setup();
    renderWith('en');

    await user.click(screen.getByRole('button', { name: 'ko' }));

    // Without this, the router cache would keep serving RSC payloads built
    // from the previous cookie.
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does no work when the chosen language is already active', async () => {
    const user = userEvent.setup();
    renderWith('en');

    await user.click(screen.getByRole('button', { name: 'en' }));

    expect(refresh).not.toHaveBeenCalled();
  });

  it('throws a useful error outside the provider', () => {
    // Silence React's expected error logging for this render.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/useLocale must be used inside/);
    spy.mockRestore();
  });
});
