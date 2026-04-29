import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateLink } from "@/lib/queryInvalidation";
import type { CreateLinkDto, LinkResponseDto } from "@/types/api";

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation<LinkResponseDto, unknown, CreateLinkDto>({
    mutationFn: (data) => api.links.create(data),
    onSuccess: (link) => {
      invalidateLink(queryClient, link);
    },
  });
}
