import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}
