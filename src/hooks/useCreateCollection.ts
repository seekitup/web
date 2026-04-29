import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type { CollectionResponseDto, CreateCollectionDto } from "@/types/api";

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation<CollectionResponseDto, unknown, CreateCollectionDto>({
    mutationFn: (data) => api.collections.create(data),
    onSuccess: (created) => {
      invalidateCollection(queryClient, created.id);
    },
  });
}
