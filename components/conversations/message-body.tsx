/**
 * Chat bubbles carry the concierge's markdown (bold, bullet/numbered lists,
 * paragraphs). Rendering it raw showed literal ** to staff, so this renders
 * the subset the agent actually writes — as React nodes, never injected
 * HTML, so a hostile visitor message can't smuggle markup in.
 */

import type { ReactNode } from 'react';

/** Inline: **bold** and *italic* (the two the concierge uses). */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** first, then *italic* inside the remainder.
  const boldParts = text.split(/\*\*(.+?)\*\*/g);
  boldParts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{part}</strong>);
      return;
    }
    const italicParts = part.split(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g);
    italicParts.forEach((sub, j) => {
      if (j % 2 === 1) nodes.push(<em key={`${keyPrefix}-i${i}-${j}`}>{sub}</em>);
      else if (sub) nodes.push(sub);
    });
  });
  return nodes;
}

export function MessageBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2 text-sm">
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        const isBullets = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isBullets || isNumbered) {
          const List = isNumbered ? 'ol' : 'ul';
          return (
            <List key={bi} className={isNumbered ? 'list-decimal space-y-1 pl-5' : 'list-disc space-y-1 pl-5'}>
              {lines.map((line, li) => (
                <li key={li}>{inline(line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ''), `${bi}-${li}`)}</li>
              ))}
            </List>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {inline(block, String(bi))}
          </p>
        );
      })}
    </div>
  );
}
