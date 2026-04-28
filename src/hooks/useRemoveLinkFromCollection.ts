import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
}
