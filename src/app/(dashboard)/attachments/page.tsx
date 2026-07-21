import { PageHeader } from "@/components/layout/PageHeader";
import { AttachmentQueue } from "@/components/attachments/AttachmentQueue";

export default function AttachmentsPage() {
  return (
    <>
      <PageHeader
        title="Attachments"
        description="Everything visitors have uploaded — scan outcome, extraction result, retention and risk flags. Quarantined files cannot be previewed or downloaded without a logged release."
      />
      <AttachmentQueue />
    </>
  );
}
