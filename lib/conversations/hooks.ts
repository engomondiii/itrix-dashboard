'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getConversation, getThread, listConversations, sendConsoleMessage } from './api';

const POLL_MS = 30_000;

export function useThreadDetail(threadId: string) {
  return useQuery({
    queryKey: ['conversations', 'thread', threadId],
    queryFn: () => getThread(threadId),
    refetchInterval: POLL_MS,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations', 'console'],
    queryFn: listConversations,
    refetchInterval: POLL_MS,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', 'console', conversationId],
    queryFn: () => getConversation(conversationId),
    refetchInterval: POLL_MS,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, claimLevel }: { body: string; claimLevel: number }) =>
      sendConsoleMessage(conversationId, body, claimLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // A held message lands in the approval queue.
      queryClient.invalidateQueries({ queryKey: ['today', 'approvals'] });
    },
  });
}
