import { cn } from "@/lib/utils";

/** 11px uppercase micro-label — the signature of serious operational UIs. */
export function SectionLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary",
        className,
      )}
      {...props}
    />
  );
}
