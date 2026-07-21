/**
 * ESLint rule: no-atelier-tokens
 *
 * Atelier Indigo is retired by NAME as well as by value (Surface 2 v5.0 §06
 * Phase 1). The earlier theme swap kept the old names and re-pointed their
 * values, which left this codebase saying "gold" while rendering soft-blue and
 * "sapphire" while rendering a blue-to-ink ramp. That works and is actively
 * misleading, so the names are gone — and this rule keeps them gone.
 *
 * It flags the retired token names anywhere in source text (Tailwind classes,
 * CSS custom properties, string literals) and names the replacement.
 *
 * TWO REPLACEMENTS DIFFER FROM itrix-web, deliberately — see globals.css:
 *   · the signature family is `signature`, not `accent`, because shadcn
 *     already owns --color-accent as its hover/selected wash here;
 *   · `line-strong` maps to `border-medium`, not `border-strong`, because the
 *     mapping follows the rendered value (0.56 alpha).
 *
 * Wired in eslint.config.mjs as `itrix/no-atelier-tokens`.
 */

/** Retired name → replacement. Longest / most specific patterns first. */
const RETIRED = [
  ['shadow-gold', 'shadow-accent'],
  ['canvas-deep', 'soft'],
  ['surface-warm', 'surface'],
  ['surface-sunken', 'soft'],
  ['oni-muted', 'ink-muted'],
  ['oni', 'ink-inverse'],
  ['indigo-950', 'structure-900 (or ink-primary for text)'],
  ['indigo-900', 'structure-800 (or ink-primary for text)'],
  ['indigo-800', 'structure-700'],
  ['indigo-700', 'structure-600'],
  ['sapphire-700', 'ink-primary'],
  ['sapphire-600', 'ink-primary'],
  ['sapphire-500', 'structure-600'],
  ['sapphire-300', 'tint'],
  ['sapphire-100', 'tint'],
  ['sapphire-50', 'soft'],
  ['gold-600', 'structure-600'],
  ['gold-500', 'tint (Brand Manual v1.5 has no flat accent colour)'],
  ['gold-400', 'tint'],
  ['gold-100', 'tint'],
  ['gold-50', 'soft'],
  ['ink-900', 'ink-primary'],
  ['ink-800', 'ink-primary'],
  ['ink-700', 'ink-secondary'],
  ['ink-600', 'ink-secondary'],
  ['ink-500', 'ink-secondary'],
  ['ink-400', 'ink-secondary'],
  ['ink-300', 'ink-muted (non-informational text only)'],
  ['line-subtle', 'border-soft'],
  ['line-strong', 'border-medium'],
];

/**
 * Word-ish boundary so `ink-primary` never trips the `ink-` family rules and
 * `structure-900` never trips `indigo-900`.
 *
 * Bare `line` is deliberately NOT listed: it is an ordinary English word that
 * appears in comments and copy throughout the repo, so linting it would be all
 * false positives. The `border-line` utility it produced is gone, and the CSS
 * custom property no longer exists, so a new use would fail to resolve rather
 * than render the wrong colour.
 */
function patternFor(name) {
  return new RegExp(`(^|[^a-zA-Z0-9_-])(${name})(?![a-zA-Z0-9_-])`, 'g');
}

const COMPILED = RETIRED.map(([name, replacement]) => ({
  name,
  replacement,
  re: patternFor(name),
}));

const noAtelierTokens = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow retired Atelier Indigo token names. Use the Brand Manual v1.5 vocabulary.',
    },
    schema: [],
    messages: {
      retired:
        'Retired Atelier token "{{name}}". Brand Manual v1.5 uses "{{replacement}}". ' +
        'A token name must describe what it renders.',
    },
  },

  create(context) {
    return {
      Program() {
        const source = context.sourceCode ?? context.getSourceCode();
        const text = source.getText();

        for (const { name, replacement, re } of COMPILED) {
          re.lastIndex = 0;
          let match;
          while ((match = re.exec(text)) !== null) {
            const index = match.index + match[1].length;
            context.report({
              loc: {
                start: source.getLocFromIndex(index),
                end: source.getLocFromIndex(index + name.length),
              },
              messageId: 'retired',
              data: { name, replacement },
            });
          }
        }
      },
    };
  },
};

export default noAtelierTokens;
