import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UpdateCollectionLinkVisibilityDto } from "@/types/api";

interface Vars {
  parentCollectionId: number;
  childCollectionId: number;
  data: UpdateCollectionLinkVisibilityDto;
}

/**
 * Per-instance child-collection visibility override inside a parent. Mirrors
 * the mobile mutation; PATCH /api/v1/collections/:parentId/children/:childId/visibility.
 */
export function useUpdateCollectionParentVisibility() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Vars>({
    mutationFn: ({ parentCollectionId, childCollectionId, data }) =>
      api.collections.updateChildVisibility(
        parentCollectionId,
        childCollectionId,
        data,
      ),
    onSuccess: (_, { parentCollectionId, childCollectionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["collection", parentCollectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["collection", childCollectionId],
      });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
