import type { Locale } from '../config';

import { en, type Messages } from './en';
import { ko } from './ko';

/**
 * Both catalogues are imported statically rather than `import()`-ed per
 * locale. They are a few KB of strings; code-splitting them would buy a
 * negligible bundle saving and cost a loading state on every language
 * switch — and a suspended boundary around the entire app shell is a bad
 * trade for that. Revisit if the catalogue grows past ~100 KB.
 */
export const MESSAGES: Record<Locale, Messages> = { en, ko };

export type { Messages };
