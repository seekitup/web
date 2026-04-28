import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface RemoveParentVars {
  collectionId: number;
  parentId: number;
}

export function useRemoveParent() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, RemoveParentVars>({
    mutationFn: ({ collectionId, parentId }) =>
      api.collections.removeParent(collectionId, parentId),
    onSuccess: (_, { collectionId, parentId }) => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collection", parentId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
