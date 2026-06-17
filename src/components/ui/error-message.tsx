import { AlertCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Inline form/field error. */
export function ErrorMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn("flex items-center gap-1.5 text-caption text-error-text", className)}
      {...props}
    >
      <AlertCircleIcon className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}
