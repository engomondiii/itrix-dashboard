import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";

export default function HandoffTemplatesPage() {
  return (
    <>
      <PageHeader title="Handoff memos" description="Offline handoff memo templates." />
      <TemplateList kind="handoff" />
    </>
  );
}
