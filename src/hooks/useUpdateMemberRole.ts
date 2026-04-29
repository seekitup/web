import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateCollection } from "@/lib/queryInvalidation";
import type {
  CollectionMemberResponseDto,
  UpdateMemberRoleDto,
} from "@/types/api";

interface UpdateMemberRoleVars {
  collectionId: number;
  memberId: number;
  data: UpdateMemberRoleDto;
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation<CollectionMemberResponseDto, unknown, UpdateMemberRoleVars>({
    mutationFn: ({ collectionId, memberId, data }) =>
      api.collections.updateMemberRole(collectionId, memberId, data),
    onSuccess: (_, { collectionId }) => {
      invalidateCollection(queryClient, collectionId);
    },
  });
}
