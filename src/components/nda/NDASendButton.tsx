"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NdaSendDialog } from "@/components/nda/NdaSendDialog";
import type { NDARecord } from "@/types/nda";

/** Opens the send dialog to dispatch a drafted NDA to its signer. */
export function NDASendButton({ nda }: { nda: NDARecord }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <SendIcon />
        Send NDA
      </Button>
      {open && <NdaSendDialog nda={nda} onClose={() => setOpen(false)} />}
    </>
  );
}
