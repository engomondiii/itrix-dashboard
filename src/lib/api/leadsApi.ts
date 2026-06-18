import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Paginated, SortDir } from "@/types/api";
import type { Lead, LeadListItem } from "@/types/lead";
import type { ProductRoute } from "@/constants/products";
import type { LeadStatus } from "@/constants/statuses";
import type { Tier } from "@/constants/tiers";

export interface LeadQuery {
  tier?: Tier;
  route?: ProductRoute;
  status?: LeadStatus;
  owner?: string;
  search?: string;
  sort?: string;
  dir?: SortDir;
  page?: number;
  pageSize?: number;
}

export function listLeads(query: LeadQuery = {}) {
  return apiGet<Paginated<LeadListItem>>(API.leads, { ...query });
}

export function getLead(id: string) {
  return apiGet<Lead>(API.lead(id));
}

export function assignOwner(id: string, owner: string | null) {
  return apiSend<Lead>(API.leadAssign(id), "POST", { owner });
}

export function setLeadStatus(id: string, status: LeadStatus) {
  return apiSend<Lead>(API.leadStatus(id), "POST", { status });
}

export function addLeadNote(id: string, body: string) {
  return apiSend<Lead>(API.leadNote(id), "POST", { body });
}

export function escalateLead(id: string) {
  return apiSend<Lead>(API.leadEscalate(id), "POST");
}

export function markLeadNda(id: string) {
  return apiSend<Lead>(API.leadNda(id), "POST");
}

export function requestLeadEvaluation(id: string) {
  return apiSend<Lead>(API.leadEvaluation(id), "POST");
}

export function markLeadPoC(id: string) {
  return apiSend<Lead>(API.leadPoc(id), "POST");
}

export interface BookMeetingInput {
  scheduledAt: string;
  durationMins: number;
  attendee: string;
  location: string;
  notes?: string;
}

export function bookLeadMeeting(id: string, input: BookMeetingInput) {
  return apiSend<Lead>(API.leadMeeting(id), "POST", input);
}
