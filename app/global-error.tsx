'use client';

/**
 * Last-resort boundary: catches errors thrown by the ROOT layout itself,
 * where `app/error.tsx` cannot help because the layout that would render it
 * has crashed. It must therefore render its own <html> and <body>, and it
 * cannot rely on globals.css having survived — styles are inlined.
 *
 * If this renders, the theme provider, fonts and design tokens are all gone;
 * plain readable HTML is the correct ambition.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
        }}
      >
        <main style={{ maxWidth: '28rem', padding: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            The application failed to load.
            {error.digest ? ` Reference: ${error.digest}.` : ''}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
