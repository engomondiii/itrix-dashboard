import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";

export default function NotificationSettingsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Choose what you get alerted about." />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <NotificationPreferences />
        </CardContent>
      </Card>
    </>
  );
}
