import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CollectionMemberResponseDto, InviteMemberDto } from "@/types/api";

interface InviteMemberVars {
  collectionId: number;
  data: InviteMemberDto;
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation<CollectionMemberResponseDto, unknown, InviteMemberVars>({
    mutationFn: ({ collectionId, data }) =>
      api.collections.inviteMember(collectionId, data),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["collection", collectionId],
      });
    },
  });
}
