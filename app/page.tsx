import { redirect } from 'next/navigation';

/**
 * Staff console has no public landing page: the root sends everyone to
 * Today, and the (app) guard bounces unauthenticated visitors to /login.
 */
export default function RootPage() {
  redirect('/today');
}
