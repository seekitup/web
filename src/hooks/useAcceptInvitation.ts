import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type { CollectionMemberResponseDto } from "@/types/api";

/**
 * Accepts the current user's pending invitation to a collection.
 * Mirrors the mobile app's `useAcceptInvitation` — the endpoint takes no body;
 * the user is identified by the JWT.
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation<CollectionMemberResponseDto, unknown, number>({
    mutationFn: (collectionId) => api.collections.acceptInvitation(collectionId),
    onSuccess: (_, collectionId) => {
      invalidateCollection(queryClient, collectionId);
    },
  });
}
