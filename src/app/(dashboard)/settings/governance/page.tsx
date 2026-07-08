import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGENT_AUTO_APPROVE_MAX_LEVEL,
  CLAIM_LEVEL_LABEL,
  SECOND_APPROVER_LEVELS,
} from "@/constants/claimLevels";

export default function GovernanceSettingsPage() {
  return (
    <>
      <PageHeader
        title="Governance settings"
        description="How agent and team drafts are governed before they reach a client."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Auto-approve threshold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sec text-ink-700">
              Drafts at or below{" "}
              <strong>
                Level {AGENT_AUTO_APPROVE_MAX_LEVEL} ·{" "}
                {CLAIM_LEVEL_LABEL[AGENT_AUTO_APPROVE_MAX_LEVEL]}
              </strong>{" "}
              deliver automatically. Anything above queues for a human.
            </p>
            <p className="text-caption text-ink-500">
              Configured server-side via <code>AGENT_AUTO_APPROVE_MAX_LEVEL</code>.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sec text-ink-700">
            <p>Level 3 (technical / performance) — drafted with citation, one approver.</p>
            <p>
              Levels {SECOND_APPROVER_LEVELS.join(" & ")} (commercial / legal) — mandatory
              review by a <strong>second, distinct approver</strong> before delivery.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
