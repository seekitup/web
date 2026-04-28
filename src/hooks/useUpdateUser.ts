import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/authStorage";
import type { UpdateUserDto, UserResponseDto } from "@/types/api";
import { useAuth } from "./useAuth";

/**
 * Mutation hook for updating the current user's profile. Keeps the auth
 * context, localStorage cache, and react-query caches in sync.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation<
    UserResponseDto,
    unknown,
    { id: number; data: UpdateUserDto }
  >({
    mutationFn: ({ id, data }) => api.users.update(id, data),
    onSuccess: (updatedUser) => {
      const stored = authStorage.getUser();
      if (stored && stored.id === updatedUser.id) {
        authStorage.setUser(updatedUser);
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
