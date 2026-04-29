import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";

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
      invalidateCollection(queryClient, collectionId);
      invalidateCollection(queryClient, parentId);
    },
  });
}
