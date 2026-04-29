import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateAllLinkScopes } from "@/lib/queryInvalidation";

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: (id) => api.links.delete(id),
    onSuccess: () => {
      // Delete doesn't return the link, so we don't know which collections
      // it belonged to — invalidate all link/collection scopes broadly.
      invalidateAllLinkScopes(queryClient);
    },
  });
}
