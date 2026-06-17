"use client";

import { toast } from "sonner";

/**
 * Thin wrapper over sonner's toast so components import from one place.
 * Render <Toaster /> once (in the app providers) for these to appear.
 */
export function useToast() {
  return { toast };
}

export { toast };
