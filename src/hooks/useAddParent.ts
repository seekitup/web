import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AddParentVars {
  collectionId: number;
  parentCollectionId: number;
}

export function useAddParent() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, AddParentVars>({
    mutationFn: ({ collectionId, parentCollectionId }) =>
      api.collections.addParent(collectionId, parentCollectionId),
    onSuccess: (_, { collectionId, parentCollectionId }) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({
        queryKey: ["collection", parentCollectionId],
      });
    },
  });
}
