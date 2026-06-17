import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateList } from "@/components/templates/TemplateList";
import { ROUTES } from "@/constants/routes";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Approved language for follow-ups, proposals, and handoffs."
        actions={
          <div className="flex flex-wrap items-center gap-3 text-sec text-ink-500">
            <Link href={ROUTES.templatesEmails} className="hover:text-ink-700">Emails</Link>
            <Link href={ROUTES.templatesFollowUp} className="hover:text-ink-700">Follow-up</Link>
            <Link href={ROUTES.templatesEvaluation} className="hover:text-ink-700">Evaluation</Link>
            <Link href={ROUTES.templatesPoc} className="hover:text-ink-700">PoC</Link>
            <Link href={ROUTES.templatesHandoff} className="hover:text-ink-700">Handoff</Link>
          </div>
        }
      />
      <TemplateList />
    </>
  );
}
