import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default function ProfileSettingsPage() {
  return (
    <>
      <PageHeader title="Profile" description="Your account details." />
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <ProfileForm />
        </CardContent>
      </Card>
    </>
  );
}
