"use client";

import { use } from "react";
import Link from "next/link";
import { LayoutTemplateIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateViewer } from "@/components/templates/TemplateViewer";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useTemplate } from "@/hooks/useTemplates";

export default function EmailTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const { data, isLoading, isError } = useTemplate(templateId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        icon={LayoutTemplateIcon}
        title="Template not found"
        action={
          <Link href={ROUTES.templatesEmails} className="text-sec font-medium text-sapphire-600">
            Back to email templates
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={data.name}
        actions={
          <Link href={ROUTES.templatesEmails} className="text-sec font-medium text-sapphire-600">
            All email templates
          </Link>
        }
      />
      <div className="max-w-2xl">
        <TemplateViewer template={data} />
      </div>
    </>
  );
}
