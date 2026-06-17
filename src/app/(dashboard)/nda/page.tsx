import { PageHeader } from "@/components/layout/PageHeader";
import { NDAQueue } from "@/components/nda/NDAQueue";

export default function NDAPage() {
  return (
    <>
      <PageHeader
        title="NDA tracker"
        description="Confidentiality agreements by stage. Mark signed to unlock NDA-level disclosure."
      />
      <NDAQueue />
    </>
  );
}
