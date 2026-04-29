import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type {
  CollectionResponseDto,
  DuplicateCollectionDto,
} from "@/types/api";

interface DuplicateCollectionVars {
  id: number;
  data?: DuplicateCollectionDto;
}

export function useDuplicateCollection() {
  const queryClient = useQueryClient();
  return useMutation<CollectionResponseDto, unknown, DuplicateCollectionVars>({
    mutationFn: ({ id, data }) => api.collections.duplicate(id, data),
    onSuccess: (duplicated) => {
      invalidateCollection(queryClient, duplicated.id);
    },
  });
}
