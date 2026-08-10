/**
 * Journey-state → staff language. The wire values are the spec's ladder
 * codes (apps/journey/models.py); staff should never have to parse
 * NDA_REVIEW or CLIENT_PAGE. Unknown values fall through untranslated so a
 * new backend state degrades to visible-but-raw, never to hidden.
 */

const JOURNEY_LABEL: Record<string, string> = {
  ARRIVED: 'Just arrived',
  IN_REVIEW: 'In conversation',
  DIAGNOSED: 'Problem diagnosed',
  CLIENT_PAGE: 'Viewing their page',
  INVITED: 'Invited to an account',
  NDA_REVIEW: 'NDA stage',
  ASSESSMENT: 'Evaluating',
  POC: 'Running a PoC',
  INTEGRATION: 'Integrating',
  CUSTOMER_SUCCESS: 'Customer',
  DORMANT: 'Dormant',
  // Read-side aliases the backend still serves on old rows.
  CLIENT: 'Customer',
  ENGAGED: 'In conversation',
};

export function journeyLabel(state: string | null | undefined): string {
  if (!state) return '';
  return JOURNEY_LABEL[state] ?? state;
}
