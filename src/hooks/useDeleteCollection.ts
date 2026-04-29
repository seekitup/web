import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: (id) => api.collections.delete(id),
    onSuccess: (_, id) => {
      invalidateCollection(queryClient, id);
    },
  });
}
