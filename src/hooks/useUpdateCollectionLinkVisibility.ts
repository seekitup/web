import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { linkKeys } from "@/lib/queryKeys";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type { UpdateCollectionLinkVisibilityDto } from "@/types/api";

interface Vars {
  collectionId: number;
  linkId: number;
  data: UpdateCollectionLinkVisibilityDto;
}

/**
 * Per-instance link visibility override inside a collection. Mirrors the
 * mobile mutation; PATCH /api/v1/collections/:cid/links/:lid/visibility.
 */
export function useUpdateCollectionLinkVisibility() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Vars>({
    mutationFn: ({ collectionId, linkId, data }) =>
      api.collections.updateLinkVisibility(collectionId, linkId, data),
    onSuccess: (_, { collectionId }) => {
      invalidateCollection(queryClient, collectionId);
      // Also refresh any global link queries that may surface this link's
      // visibility flag (search results, library list).
      queryClient.invalidateQueries({ queryKey: linkKeys.all() });
    },
  });
}
