import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { SLAConfigForm } from "@/components/settings/SLAConfigForm";

export default function SLASettingsPage() {
  return (
    <>
      <PageHeader title="SLA thresholds" description="First-response targets by tier." />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <SLAConfigForm />
        </CardContent>
      </Card>
    </>
  );
}
