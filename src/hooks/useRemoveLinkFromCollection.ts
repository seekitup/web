import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { linkKeys, searchKeys } from "@/lib/queryKeys";
import { invalidateCollection } from "@/lib/queryInvalidation";

interface Vars {
  collectionId: number;
  linkId: number;
}

/**
 * Removes the link's association with the collection. Does NOT delete the link
 * itself — it remains in the user's library and other collections it belongs to.
 */
export function useRemoveLinkFromCollection() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Vars>({
    mutationFn: ({ collectionId, linkId }) =>
      api.collections.removeLinkFromCollection(collectionId, linkId),
    onSuccess: (_, { collectionId }) => {
      invalidateCollection(queryClient, collectionId);
      queryClient.invalidateQueries({ queryKey: linkKeys.all() });
      queryClient.invalidateQueries({ queryKey: searchKeys.all() });
    },
  });
}
