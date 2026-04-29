import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateLink } from "@/lib/queryInvalidation";
import type { DuplicateLinkDto, LinkResponseDto } from "@/types/api";

interface DuplicateLinkVars {
  id: number;
  data?: DuplicateLinkDto;
}

export function useDuplicateLink() {
  const queryClient = useQueryClient();
  return useMutation<LinkResponseDto, unknown, DuplicateLinkVars>({
    mutationFn: ({ id, data }) => api.links.duplicate(id, data),
    onSuccess: (duplicated) => {
      invalidateLink(queryClient, duplicated);
    },
  });
}
