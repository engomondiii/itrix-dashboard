"use client";

import { useQuery } from "@tanstack/react-query";

import { listTeam } from "@/lib/api/settingsApi";

export function useTeam() {
  return useQuery({ queryKey: ["team"], queryFn: listTeam });
}
