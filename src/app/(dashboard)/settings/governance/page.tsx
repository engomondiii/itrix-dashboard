import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGENT_AUTO_APPROVE_MAX_LEVEL, CLAIM_LEVEL_LABEL } from "@/constants/claimLevels";
import { siteConfig } from "@/config/site.config";

function FlagRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sec text-ink-700">{label}</span>
      <Badge variant={on ? "success" : "neutral"}>{on ? "On" : "Off"}</Badge>
    </div>
  );
}

export default function GovernanceSettingsPage() {
  return (
    <>
      <PageHeader
        title="Governance settings"
        description="Auto-approve threshold and capability flags (configured via environment variables)."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Auto-approve</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sec text-ink-700">
              Drafts at or below{" "}
              <strong>
                Level {AGENT_AUTO_APPROVE_MAX_LEVEL} ·{" "}
                {CLAIM_LEVEL_LABEL[AGENT_AUTO_APPROVE_MAX_LEVEL]}
              </strong>{" "}
              deliver automatically. Above it, they queue for a human. Levels 4–5 require a
              second, distinct approver.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Capability flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <FlagRow label="Agent console" on={siteConfig.flags.agentConsole} />
            <FlagRow label="Cockpit" on={siteConfig.flags.cockpit} />
            <FlagRow label="Realtime" on={siteConfig.flags.realtime} />
            <FlagRow label="Governance" on={siteConfig.flags.governance} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
