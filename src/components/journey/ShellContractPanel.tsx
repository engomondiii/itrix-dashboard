"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useJourney } from "@/hooks/useJourney";
import {
  CONTENT_PANE_SECTION_LABEL,
  CONVERSATION_RAIL_SECTION_LABEL,
  DISCLOSURE_CEILING_LABEL,
  IDENTITY_STATE_LABEL,
  SHELL_MODE_LABEL,
  SIDEBAR_SECTION_LABEL,
  isContentPaneSection,
  isConversationRailSection,
  isShellMode,
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
 * One zone's section list. `label` names the zone; `resolve` maps a known key
 * to operator copy. An unknown key is surfaced explicitly rather than skipped —
 * a silent skip would hide exactly the drift worth knowing about, the frontend
 * vocabulary having fallen behind `apps/journey/constants.py`.
 */
function SectionList({
  heading,
  keys,
  resolve,
}: {
  heading: string;
  keys: string[];
  resolve: (key: string) => string | null;
}) {
  return (
    <div className="space-y-2">
      <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
        {heading} ({keys.length})
      </div>
      {keys.length === 0 ? (
        <p className="text-caption text-ink-secondary">None authorized at this state.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {keys.map((key) => {
            const label = resolve(key);
            return (
              <li key={key}>
                {label !== null ? (
                  <Badge variant="neutral">{label}</Badge>
                ) : (
                  <Badge variant="error" title="Unknown section key — vocabulary drift">
                    {key}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * What the visitor's surface is authorized to render right now.
 *
 * v7.0 split the shell into two zones — a conversation rail that never grows
 * and a content pane that does — plus a server-derived mode (Surface 2 v6.0
 * §00.1 item 4). This panel reads `shellMode`, `conversationRailSections` and
 * `contentPaneSections`, and falls back to the one-release `sidebarSections`
 * alias while the deployed backend still emits only that key.
 *
 * WHY AN OPERATOR NEEDS THIS. A concierge about to intervene in a live thread
 * has to know what the visitor can already see, or they will reference a
 * document the visitor has no route to, or re-explain something already on
 * screen. It is a READ of the backend's decision, never an input to it: this
 * surface cannot grant a section, and a section the backend did not authorize
 * is not renderable on Surface 1 regardless of what is shown here.
 */
export function ShellContractPanel({ leadId }: { leadId: string }) {
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
   * The contract cannot be derived here — it encodes what the backend decided
   * a visitor may see, and guessing would be frontend self-authorization. Say
   * so plainly rather than rendering an empty panel or, as this once did,
   * dereferencing `shell.identityState` and taking the whole lead page down.
   * An operator needs to know the difference between "this visitor can see
   * nothing" and "we cannot tell you yet" — those are opposite answers to a
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

  /**
   * Rail via the alias: a v7.0 backend emits `sidebarSections` as an alias of
   * the rail for one release; a v6.0 backend emits it with the retired
   * vocabulary. Either way it is the best available answer to "what is on the
   * visitor's left" until `conversationRailSections` arrives, so both label
   * sets are consulted before a key is declared drift.
   */
  const railKeys = shell.conversationRailSections ?? shell.sidebarSections;
  const railViaAlias = shell.conversationRailSections === undefined;
  const resolveRail = (key: string) =>
    isConversationRailSection(key)
      ? CONVERSATION_RAIL_SECTION_LABEL[key]
      : railViaAlias && isSidebarSection(key)
        ? SIDEBAR_SECTION_LABEL[key]
        : null;

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
          {shell.shellMode !== undefined && (
            <Row label="Mode">
              {isShellMode(shell.shellMode) ? (
                <Badge variant={shell.shellMode === "working" ? "info" : "neutral"}>
                  {SHELL_MODE_LABEL[shell.shellMode]}
                </Badge>
              ) : (
                <Badge variant="error" title="Unknown shell mode — vocabulary drift">
                  {shell.shellMode}
                </Badge>
              )}
            </Row>
          )}
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

        {railKeys !== undefined && (
          <SectionList
            heading={railViaAlias ? "Conversation rail (via sidebar alias)" : "Conversation rail"}
            keys={railKeys}
            resolve={resolveRail}
          />
        )}

        {shell.contentPaneSections !== undefined && (
          <>
            <SectionList
              heading="Content pane"
              keys={shell.contentPaneSections}
              resolve={(key) =>
                isContentPaneSection(key) ? CONTENT_PANE_SECTION_LABEL[key] : null
              }
            />
            <Row label="Default pane artifact">
              {shell.contentPaneDefaultArtifactId ? (
                <span className="font-mono text-caption">{shell.contentPaneDefaultArtifactId}</span>
              ) : (
                <Badge variant="neutral">None</Badge>
              )}
            </Row>
          </>
        )}

        {railKeys === undefined && shell.contentPaneSections === undefined && (
          <p className="text-caption text-ink-secondary">
            Zone sections are not served by the connected backend yet — this backend
            predates the v7.0 rail / pane split.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
