import { getCopy } from '@/lib/i18n/server';

import { LibraryView } from '@/components/library/library-view';

export async function generateMetadata() {
  const copy = await getCopy();
  return { title: copy.nav.library };
}

export default function LibraryPage() {
  return <LibraryView />;
}
