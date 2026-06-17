import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";

export default function PoCTemplatesPage() {
  return (
    <>
      <PageHeader title="PoC proposals" description="Proof-of-concept proposal templates." />
      <TemplateList kind="poc" />
    </>
  );
}
