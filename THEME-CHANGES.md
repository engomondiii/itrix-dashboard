# itrix-dashboard — Theme swap: Atelier Indigo → Mathematical Glass Intelligence (Brand Bible v1.2)

This archive reskins `itrix-dashboard` (Surface 2) to the **Brand Bible v1.2
"Mathematical Glass Intelligence"** system. **Only theme-layer files change** —
colors, fonts, and tokens. No routes, components, hooks, API proxies, CRM logic,
console, agent oversight, or governance admin are touched.

## Why this is safe (the approach)
The dashboard is a Tailwind v4 **CSS-first** app: a single `globals.css` holds
the `@theme` palette, the shadcn semantic tokens (`--background`, `--primary`,
`--sidebar`, `--chart-*`, …), and the `@theme inline` mapping. Every component
styles itself through **token names** (Tailwind classes like `bg-surface`,
`text-ink-900`, `border-line`, `bg-sidebar`, `text-primary`). A codebase scan
found **0 hardcoded brand hexes** in components (only 2 in an HTML export
template, updated here). So the whole surface is reskinned by **re-pointing
token values** while keeping every name identical — the robust, low-risk path
that honours "architecture stays the same, only colors/fonts change." The same
role mapping is used as itrix-web, so the two surfaces stay visually consistent.

## Role mapping (old Atelier → v1.2)
| Token name (unchanged) | Was (Atelier Indigo) | Now (Glass v1.2) |
|---|---|---|
| `canvas` / `--background` | warm paper `#FAF8F5` | cool paper `#F8FAFC` |
| `canvas-deep` / `secondary` / `muted` | `#F4F1EC` / `#F0EDE7` | `#EAF0FF` background-soft |
| `indigo-950…700` / `--sidebar` | deep indigo | `#1F2937` ink ramp (structure/sidebar) |
| `sapphire-*` | royal-blue action | cool blue-white → ink scale |
| `--primary` | sapphire `#2950C8` | structural ink `#1F2937` (v1.2 §8.5) |
| `--accent` | sapphire-50 | `#D6E6FF` light-blue wash |
| `gold-*` / `--sidebar-ring` | brushed gold | holographic soft-blue accent |
| `ink-*` / `--foreground` | warm ink | `#1F2937 / #4B5563 / #94A3B8` |
| `line` / `--border` | warm hairline | slate glass borders `rgba(148,163,184,…)` |
| shadows | warm umber | cool ink-tinted glass shadows |
| radius | 6/8/12 | 10/14/20 (`--radius` 14px) |
| chart-1..5 | sapphire/gold/… | cool-anchored series |
| fonts | Inter + JetBrains Mono | Space Grotesk (display) + Inter + IBM Plex Mono + Pretendard (KR) |

## Files in this archive (4)
All paths are relative to the `itrix-dashboard` project root:

- `src/app/globals.css` — the master reskin: `@theme` palette, `:root` shadcn
  semantic tokens + sidebar, `@theme inline` mapping, fonts, Pretendard CDN
  import, headings on the Display face, and an opt-in `.glass-surface` helper
  (with `-webkit-` prefix + `@supports` opaque fallback per §8.7).
- `src/app/layout.tsx` — next/font swap (Space Grotesk `--font-space-grotesk`,
  Inter `--font-inter`, IBM Plex Mono `--font-mono`).
- `src/lib/export/report.ts` — the 2 hardcoded hexes in the HTML report export
  template updated to the v1.2 ink colors (`#1f2937`, `#4b5563`).
- `public/fonts/README.md` — updated font notes.

## Apply
Place `itrix-dashboard-theme-v1.2.zip` in the `itrix-dashboard` project root:

```bash
unzip -o itrix-dashboard-theme-v1.2.zip && bash apply-theme.sh
```

`apply-theme.sh` backs up every overwritten file to `.theme-backup-<timestamp>/`
and prints a one-line restore command. Afterward:

```bash
rm -rf .next && npm run dev
```

## Notes
- The sidebar stays a dark structural frame — now `#1F2937` ink instead of deep
  indigo — with a holographic soft-blue active indicator (was gold).
- shadcn `--primary` maps to structural ink `#1F2937` (v1.2 primary buttons are
  ink-filled, §8.5), and `--accent` to the light-blue `#D6E6FF` hover/selected
  wash, so buttons, tabs, and selected rows read in-brand automatically.
- Semantic status colors (error/success/warning) keep the soft-companion badge
  pattern the CRM already uses, retuned to the v1.2 feedback family.
- Space Grotesk is Latin-only; Korean glyphs fall back to Pretendard (§4.1).
