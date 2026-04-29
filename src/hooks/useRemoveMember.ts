import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";

interface RemoveMemberVars {
  collectionId: number;
  memberId: number;
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, RemoveMemberVars>({
    mutationFn: ({ collectionId, memberId }) =>
      api.collections.removeMember(collectionId, memberId),
    onSuccess: (_, { collectionId }) => {
      invalidateCollection(queryClient, collectionId);
    },
  });
}
