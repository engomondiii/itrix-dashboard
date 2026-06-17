import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";

export default function EmailTemplatesPage() {
  return (
    <>
      <PageHeader title="Email templates" description="Visitor-facing follow-up emails." />
      <TemplateList kind="email" />
    </>
  );
}
