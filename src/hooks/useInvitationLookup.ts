import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CollectionInvitationLookupResponseDto } from '@/types/api';

export function useInvitationLookup(token: string | null) {
  return useQuery<CollectionInvitationLookupResponseDto>({
    queryKey: ['invitation', 'lookup', token],
    queryFn: () => api.collections.lookupInvitation(token as string),
    enabled: !!token,
    retry: false,
  });
}
