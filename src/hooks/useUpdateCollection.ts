import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type {
  CollectionResponseDto,
  UpdateCollectionDto,
} from "@/types/api";

interface UpdateCollectionVars {
  id: number;
  data: UpdateCollectionDto;
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation<CollectionResponseDto, unknown, UpdateCollectionVars>({
    mutationFn: ({ id, data }) => api.collections.update(id, data),
    onSuccess: (collection) => {
      invalidateCollection(queryClient, collection.id);
    },
  });
}
