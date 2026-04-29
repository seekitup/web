import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";
import type { CollectionMemberResponseDto } from "@/types/api";

export function useCollectionMembers(
  collectionId: number | undefined,
  enabled: boolean = true,
) {
  return useQuery<CollectionMemberResponseDto[]>({
    queryKey: collectionKeys.members(collectionId ?? 0),
    queryFn: async () => {
      const res = await api.collections.listMembers(collectionId!, {
        page: 1,
        limit: 100,
      });
      return res.data;
    },
    enabled: enabled && typeof collectionId === "number",
  });
}
