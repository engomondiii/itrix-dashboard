import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type {
  CustomerDetail,
  CustomerListItem,
  Outcome,
  SuccessReview,
} from "@/types/customer";

export async function getCustomers(): Promise<CustomerListItem[]> {
  const data = await apiGet<{ results: CustomerListItem[] }>(API.cockpitCustomers);
  return data.results;
}

export function getCustomer(clientId: string) {
  return apiGet<CustomerDetail>(API.cockpitCustomer(clientId));
}

export async function getAllOutcomes(): Promise<Outcome[]> {
  const data = await apiGet<{ results: Outcome[] }>(`${API.cockpitCustomers}/outcomes`);
  return data.results;
}

export async function getSuccessReviews(): Promise<SuccessReview[]> {
  const data = await apiGet<{ results: SuccessReview[] }>(API.successReviews);
  return data.results;
}
