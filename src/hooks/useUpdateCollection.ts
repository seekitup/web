import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      queryClient.invalidateQueries({
        queryKey: ["collection", collection.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["collection-lookup", collection.user.username, collection.slug],
      });
    },
  });
}
