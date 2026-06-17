import { PageHeader } from "@/components/layout/PageHeader";
import { TeamMemberList } from "@/components/settings/TeamMemberList";

export default function TeamSettingsPage() {
  return (
    <>
      <PageHeader title="Team" description="Members, roles, and open lead load." />
      <TeamMemberList />
    </>
  );
}
