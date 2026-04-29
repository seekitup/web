import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";

type SavedSnapshot = { saved: boolean } | undefined;

/**
 * Saves a public collection for the current user.
 *
 * Mirrors the mobile `useSaveCollection`: optimistic flip of the
 * `savedCheck` cache, rollback on error, list invalidation on success so the
 * `filter=saved` collections list refetches. We deliberately don't invalidate
 * `collectionKeys.all()` — the lookup endpoint never carries saved state, so
 * an extra refetch there would be wasted work.
 */
export function useSaveCollection() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    number,
    { previousData: SavedSnapshot; collectionId: number }
  >({
    mutationFn: (collectionId) => api.collections.saveCollection(collectionId),
    onMutate: async (collectionId) => {
      const key = collectionKeys.savedCheck(collectionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousData = queryClient.getQueryData<{ saved: boolean }>(key);
      queryClient.setQueryData(key, { saved: true });
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
