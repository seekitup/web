import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LinkResponseDto, LinksQueryParams } from "@/types/api";

export function useLinks(
  params: LinksQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["links", params],
    queryFn: () => api.links.list(params),
    enabled: isAuthenticated && (options.enabled ?? true),
    staleTime: 30_000,
    select: (res): LinkResponseDto[] => res.data,
  });
}
