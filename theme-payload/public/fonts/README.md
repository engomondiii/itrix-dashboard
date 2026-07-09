# Fonts

Mathematical Glass Intelligence (Brand Bible v1.2) uses four faces:

- **Space Grotesk** — Display (page/section headings) → `--font-space-grotesk`
- **Inter** — Primary UI + body text → `--font-inter` (composed into `--font-sans`)
- **IBM Plex Mono** — technical labels, code, IDs, KPI numerals → `--font-mono`
- **Pretendard** — Korean fallback (headings + body)

Space Grotesk is Latin-only, so Korean glyphs in a Display heading fall back to
Pretendard automatically (Brand Bible §4.1).

## How they load
- Space Grotesk, Inter, and IBM Plex Mono load through `next/font/google` in
  `src/app/layout.tsx` (no binary files needed, no layout shift). They expose
  `--font-space-grotesk`, `--font-inter`, and `--font-mono`, which
  `src/app/globals.css` composes into `--font-sans` / `--font-display`.
- **Pretendard** loads from CDN via the first `@import` in `globals.css`.

The `.woff2` files in this folder are self-hosting fallbacks and are not
referenced by the app while `next/font/google` is used.

## Optional: self-host instead
For offline builds / stricter CSP, add woff2 files here (Space Grotesk, Inter,
IBM Plex Mono, Pretendard), swap the `next/font/google` calls in `layout.tsx`
for `next/font/local`, and replace the Pretendard CDN `@import` in `globals.css`
with a local `@font-face`. The CSS variable names stay identical, so nothing
else changes.
