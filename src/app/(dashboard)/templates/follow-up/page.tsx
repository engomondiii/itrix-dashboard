import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";

export default function FollowUpTemplatesPage() {
  return (
    <>
      <PageHeader title="Follow-up scripts" description="Discovery and follow-up scripts." />
      <TemplateList kind="follow-up" />
    </>
  );
}
