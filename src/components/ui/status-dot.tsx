import { cn } from "@/lib/utils";

export type StatusIntent = "success" | "warning" | "error" | "info" | "neutral";

const DOT: Record<StatusIntent, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-ink-muted",
};

/** Small traffic-light status indicator. */
export function StatusDot({
  intent = "neutral",
  className,
  ...props
}: { intent?: StatusIntent } & React.ComponentProps<"span">) {
  return (
    <span
      data-slot="status-dot"
      className={cn("inline-block size-2 shrink-0 rounded-full", DOT[intent], className)}
      {...props}
    />
  );
}
