/**
 * /settings has no content of its own — it forwards to the first section.
 * The sidebar and command palette link here so their entries stay stable
 * while sections are added or reordered in the layout's SETTINGS_NAV.
 */

import { redirect } from 'next/navigation';

export default function SettingsIndexPage() {
  redirect('/settings/profile');
}
