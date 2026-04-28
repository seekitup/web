import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
    },
  });
}
