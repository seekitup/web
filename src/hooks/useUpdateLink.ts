import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LinkResponseDto, UpdateLinkDto } from "@/types/api";

interface UpdateLinkVars {
  id: number;
  data: UpdateLinkDto;
}

export function useUpdateLink() {
  const queryClient = useQueryClient();
  return useMutation<LinkResponseDto, unknown, UpdateLinkVars>({
    mutationFn: ({ id, data }) => api.links.update(id, data),
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["link", link.id] });
      for (const c of link.collections ?? []) {
        queryClient.invalidateQueries({ queryKey: ["collection", c.id] });
      }
    },
  });
}
