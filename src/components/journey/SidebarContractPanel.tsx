"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useJourney } from "@/hooks/useJourney";
import {
  DISCLOSURE_CEILING_LABEL,
  IDENTITY_STATE_LABEL,
  SIDEBAR_SECTION_LABEL,
  isSidebarSection,
} from "@/constants/shellContract";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-caption text-ink-secondary">{label}</span>
      <span className="text-sec text-right text-ink-primary">{children}</span>
    </div>
  );
}

/**
 * What the visitor's surface is authorized to render right now.
 *
 * The rails are retired: the journey service no longer returns `left_rail` or
 * `right_rail`, and this panel shows what replaced them — `sidebar_sections`,
 * `composer_label` and `question_loop_open` (Surface 2 v5.0 §00.1 item 7).
 *
 * WHY AN OPERATOR NEEDS THIS. A concierge about to intervene in a live thread
 * has to know what the visitor can already see, or they will reference a
 * document the visitor has no route to, or re-explain something already on
 * screen. It is a READ of the backend's decision, never an input to it: this
 * surface cannot grant a section, and a section the backend did not authorize
 * is not renderable on Surface 1 regardless of what is shown here.
 *
 * An unknown section key is surfaced explicitly rather than skipped. A silent
 * skip would hide exactly the drift worth knowing about — the frontend
 * vocabulary having fallen behind `apps/journey/constants.py`.
 */
export function SidebarContractPanel({ leadId }: { leadId: string }) {
  const { data: journey, isLoading, isError } = useJourney(leadId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shell contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Spinner className="size-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !journey) return null;

  const { shell } = journey;

  /**
   * The shell contract is Backend v6.0 §3.1. Until `shell.for_subject` ships,
   * the journey payload simply does not carry it.
   *
   * Say so plainly rather than rendering an empty panel or, as this did before,
   * dereferencing `shell.identityState` and taking the entire lead page down
   * with it. An operator needs to know the difference between "this visitor can
   * see nothing" and "we cannot tell you yet" — those are opposite answers to a
   * governance question.
   */
  if (!shell) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shell contract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sec text-ink-secondary">
            Not served by the connected backend yet. This panel reports what Surface 1
            is authorized to render for a subject, and it appears once the backend
            ships the shell contract.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shell contract</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-caption text-ink-secondary">
          What Surface 1 is authorized to render for this subject. Read-only — the
          backend decides, this surface reports.
        </p>

        <div className="space-y-1.5">
          <Row label="Identity">{IDENTITY_STATE_LABEL[shell.identityState]}</Row>
          <Row label="Disclosure ceiling">
            {DISCLOSURE_CEILING_LABEL[shell.disclosureCeiling]}
          </Row>
          <Row label="Composer label">
            <span className="italic">“{shell.composerLabel}”</span>
          </Row>
          <Row label="Question loop">
            {shell.questionLoopOpen ? (
              <Badge variant="info">Open</Badge>
            ) : (
              <Badge variant="neutral">Closed</Badge>
            )}
          </Row>
          <Row label="Attachments">
            {shell.attachmentsEnabled ? (
              <Badge variant="info">Enabled</Badge>
            ) : (
              <Badge variant="neutral">Disabled</Badge>
            )}
          </Row>
          <Row label="Quick help">
            {shell.conversationHeader.quickHelp ? (
              <Badge variant="success">Reachable</Badge>
            ) : (
              <Badge variant="neutral">Not yet</Badge>
            )}
          </Row>
          {shell.conversationHeader.humanOwner && (
            <Row label="Named owner">{shell.conversationHeader.humanOwner}</Row>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
            Sidebar sections ({shell.sidebarSections.length})
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {shell.sidebarSections.map((key) => (
              <li key={key}>
                {isSidebarSection(key) ? (
                  <Badge variant="neutral">{SIDEBAR_SECTION_LABEL[key]}</Badge>
                ) : (
                  <Badge variant="error" title="Unknown section key — vocabulary drift">
                    {key}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
