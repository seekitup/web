import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DuplicateLinkDto, LinkResponseDto } from "@/types/api";

interface DuplicateLinkVars {
  id: number;
  data?: DuplicateLinkDto;
}

export function useDuplicateLink() {
  const queryClient = useQueryClient();
  return useMutation<LinkResponseDto, unknown, DuplicateLinkVars>({
    mutationFn: ({ id, data }) => api.links.duplicate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
