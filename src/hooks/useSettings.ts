"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPrefs,
  getProfile,
  getSlaConfig,
  updateNotificationPrefs,
  updateProfile,
  updateSlaConfig,
} from "@/lib/api/settingsApi";
import { useToast } from "@/hooks/useToast";
import type { SessionUser } from "@/types/auth";
import type { NotificationPrefs, SlaConfig } from "@/types/settings";

// ── Profile ───────────────────────────────────────────────────────────────
export function useProfile() {
  return useQuery({ queryKey: ["settings", "profile"], queryFn: getProfile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (patch: { name: string }) => updateProfile(patch),
    onSuccess: (user: SessionUser) => {
      qc.setQueryData(["settings", "profile"], user);
      qc.setQueryData(["me"], user); // keep topbar avatar/name in sync
      toast.success("Profile updated");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

// ── Notification preferences ────────────────────────────────────────────────
export function useNotificationPrefs() {
  return useQuery({
    queryKey: ["settings", "notification-prefs"],
    queryFn: getNotificationPrefs,
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (prefs: NotificationPrefs) => updateNotificationPrefs(prefs),
    onSuccess: (p) => {
      qc.setQueryData(["settings", "notification-prefs"], p);
      // Toggling a category re-filters the bell feed — refresh it.
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification preferences saved");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

// ── SLA thresholds ──────────────────────────────────────────────────────────
export function useSlaConfig() {
  return useQuery({ queryKey: ["settings", "sla"], queryFn: getSlaConfig });
}

export function useUpdateSlaConfig() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (config: SlaConfig) => updateSlaConfig(config),
    onSuccess: (c) => {
      qc.setQueryData(["settings", "sla"], c);
      toast.success("SLA thresholds saved");
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
