import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LeaveCollectionVars {
  collectionId: number;
  userId: number;
}

/**
 * Removes the current user from the collection. Uses the same removeMember
 * endpoint, with the user's own id as the member id (matches mobile).
 */
export function useLeaveCollection() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, LeaveCollectionVars>({
    mutationFn: ({ collectionId, userId }) =>
      api.collections.removeMember(collectionId, userId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
    },
  });
}
