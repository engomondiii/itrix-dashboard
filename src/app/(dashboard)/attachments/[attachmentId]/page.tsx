import { PageHeader } from "@/components/layout/PageHeader";
import { AttachmentDetailView } from "@/components/attachments/AttachmentDetailView";

export default async function AttachmentDetailPage({
  params,
}: {
  params: Promise<{ attachmentId: string }>;
}) {
  const { attachmentId } = await params;

  return (
    <>
      <PageHeader
        title="Attachment"
        description="Scan, extraction and the full audit trail for one uploaded file."
      />
      <AttachmentDetailView attachmentId={attachmentId} />
    </>
  );
}
