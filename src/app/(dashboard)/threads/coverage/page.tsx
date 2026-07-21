import { PageHeader } from "@/components/layout/PageHeader";
import { CoverageOverviewPanel } from "@/components/threads/CoverageOverviewPanel";

export default function ThreadsCoveragePage() {
  return (
    <>
      <PageHeader
        title="Loop productivity"
        description="Which listening dimensions the question loop keeps failing to close, and how loops are ending across the book."
      />
      <CoverageOverviewPanel />
    </>
  );
}
