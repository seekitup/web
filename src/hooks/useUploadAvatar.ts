import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/authStorage";
import type { UserResponseDto } from "@/types/api";
import { useAuth } from "./useAuth";

interface UploadAvatarVars {
  userId: number;
  file: File;
}

/**
 * Uploads an avatar image: generates a presigned URL, uploads the binary,
 * notifies the API, and refreshes the current user so the new image URL
 * appears in the UI.
 */
export function useUploadAvatar() {
  const { setUser, refreshUser } = useAuth();

  return useMutation<UserResponseDto, unknown, UploadAvatarVars>({
    mutationFn: async ({ userId, file }) => {
      const upload = await api.files.generateUploadUrl(
        "users",
        userId,
        "image",
        { originalName: file.name },
      );
      await api.files.uploadToPresignedUrl(
        upload.uploadUrl,
        file,
        file.type || "image/jpeg",
      );
      await api.files.notifyUploadComplete(upload.file.id);
      await refreshUser();
      return authStorage.getUser() as UserResponseDto;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
        authStorage.setUser(updatedUser);
      }
    },
  });
}
