import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateLinkDto, LinkResponseDto } from "@/types/api";

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation<LinkResponseDto, unknown, CreateLinkDto>({
    mutationFn: (data) => api.links.create(data),
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      for (const c of link.collections ?? []) {
        queryClient.invalidateQueries({ queryKey: ["collection", c.id] });
      }
    },
  });
}
