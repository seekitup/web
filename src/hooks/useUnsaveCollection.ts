import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";

type SavedSnapshot = { saved: boolean } | undefined;

/**
 * Removes a saved collection for the current user. Same optimistic /
 * rollback / list-invalidation shape as `useSaveCollection` but flips the
 * cached saved flag to `false`.
 */
export function useUnsaveCollection() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    number,
    { previousData: SavedSnapshot; collectionId: number }
  >({
    mutationFn: (collectionId) => api.collections.unsaveCollection(collectionId),
    onMutate: async (collectionId) => {
      const key = collectionKeys.savedCheck(collectionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousData = queryClient.getQueryData<{ saved: boolean }>(key);
      queryClient.setQueryData(key, { saved: false });
      return { previousData, collectionId };
    },
    onError: (_err, _collectionId, context) => {
      if (!context) return;
      queryClient.setQueryData(
        collectionKeys.savedCheck(context.collectionId),
        context.previousData,
      );
    },
    onSuccess: (_data, collectionId) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.savedCheck(collectionId),
      });
      queryClient.invalidateQueries({ queryKey: collectionKeys.list() });
    },
  });
}
