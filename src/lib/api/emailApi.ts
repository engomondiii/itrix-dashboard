import { apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";

export interface SendEmailInput {
  to?: string;
  subject: string;
  body: string;
  leadId?: string;
  templateId?: string;
}

export function sendEmail(input: SendEmailInput) {
  return apiSend<{ ok: true; queued: boolean }>(API.emailSend, "POST", input);
}
