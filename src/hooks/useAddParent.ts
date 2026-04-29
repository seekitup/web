import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";

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
      invalidateCollection(queryClient, collectionId);
      invalidateCollection(queryClient, parentCollectionId);
    },
  });
}
