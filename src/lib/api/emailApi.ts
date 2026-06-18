import { apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";

export interface SendEmailInput {
  to?: string;
  subject: string;
  body: string;
  leadId?: string;
  templateId?: string;
  cc?: string;
  /** Local datetime "YYYY-MM-DDTHH:mm"; if in the future, the send is queued. */
  scheduledAt?: string;
  attachments?: string[];
}

export function sendEmail(input: SendEmailInput) {
  return apiSend<{ ok: true; queued: boolean; scheduled: boolean }>(
    API.emailSend,
    "POST",
    input,
  );
}
