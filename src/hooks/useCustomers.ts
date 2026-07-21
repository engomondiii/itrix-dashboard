"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAllOutcomes,
  getCustomer,
  getCustomers,
  getSuccessReviews,
} from "@/lib/api/customersApi";

export function useCustomers() {
  return useQuery({ queryKey: ["customers"], queryFn: getCustomers });
}

export function useCustomerDetail(clientId: string) {
  return useQuery({
    queryKey: ["customer", clientId],
    queryFn: () => getCustomer(clientId),
    enabled: Boolean(clientId),
  });
}

export function useAllOutcomes() {
  return useQuery({ queryKey: ["customer-outcomes"], queryFn: getAllOutcomes });
}

export function useSuccessReviews() {
  return useQuery({ queryKey: ["success-reviews"], queryFn: getSuccessReviews });
}
