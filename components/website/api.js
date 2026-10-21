export const ROOT = '/itx-console-7k2m';
export async function api(path, data) {
  const response = await fetch(ROOT + '/api/' + path, {
    method: data ? 'POST' : 'GET',
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 403 && path.startsWith('admin/'))
      location.assign(ROOT + '/sign-in?expired=1');
    const fields = result.error?.fields || result;
    const error = new Error(fields.detail || result.error?.detail || 'Request failed');
    error.reason = fields.reason;
    error.remainingAttempts = fields.remaining_attempts;
    throw error;
  }
  return result;
}
