"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  value: string;
  className?: string;
  /** Optional visible label next to the icon. */
  label?: string;
}

/** Copy-to-clipboard button with a transient success state. */
export function CopyButton({ value, className, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "sm" : "icon-sm"}
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(className)}
    >
      {copied ? (
        <CheckIcon className="text-success" />
      ) : (
        <CopyIcon className="text-ink-400" />
      )}
      {label}
    </Button>
  );
}
