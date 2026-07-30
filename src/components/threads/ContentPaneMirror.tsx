import { Badge } from "@/components/ui/badge";
import {
  CONTENT_PANE_SECTION_LABEL,
  isContentPaneSection,
} from "@/constants/shellContract";
import type { ContentPaneMirrorState } from "@/types/thread";

/**
 * What the visitor currently has open on their right-hand side (Surface 2
 * v6.0 §6.2).
 *
 * An operator answering a live question needs to know what is on the
 * visitor's screen — referencing a document the visitor has no route to, or
 * re-explaining an artifact already in front of them, both read as not
 * listening. This is a MIRROR of the visitor's pane state, never a control
 * for it: nothing here can open, close or authorize a section.
 */
export function ContentPaneMirror({ pane }: { pane: ContentPaneMirrorState }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {pane.collapsed ? (
          <Badge variant="neutral">Pane collapsed</Badge>
        ) : pane.openSection ? (
          isContentPaneSection(pane.openSection) ? (
            <Badge variant="info">{CONTENT_PANE_SECTION_LABEL[pane.openSection]}</Badge>
          ) : (
            <Badge variant="error" title="Unknown section key — vocabulary drift">
              {pane.openSection}
            </Badge>
          )
        ) : (
          <Badge variant="neutral">Nothing focused</Badge>
        )}
        {pane.openArtifactId && !pane.collapsed && (
          <span className="font-mono text-caption text-ink-secondary">
            {pane.openArtifactId}
          </span>
        )}
      </div>
      <p className="text-micro text-ink-secondary">
        {pane.collapsed
          ? "The visitor collapsed their content pane — anything you reference, they will have to reopen."
          : "What the visitor has open beside the conversation right now."}
      </p>
    </div>
  );
}
