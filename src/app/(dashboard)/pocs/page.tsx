import { PageHeader } from "@/components/layout/PageHeader";
import { PoCList } from "@/components/pocs/PoCList";

export default function PoCsPage() {
  return (
    <>
      <PageHeader title="PoCs" description="Proof-of-concept projects and their milestones." />
      <PoCList />
    </>
  );
}
