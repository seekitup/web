import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import clsx from "clsx";
import { Avatar, type AvatarUser } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { getApiErrorMessage } from "@/lib/apiError";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface AvatarPickerProps {
  user: AvatarUser & { id: number };
  size?: number;
  className?: string;
}

export function AvatarPicker({ user, size = 80, className }: AvatarPickerProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const isUploading = upload.isPending;

  const onPick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking same file later
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("accountScreen.profilePictureInvalid"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("accountScreen.profilePictureTooLarge"));
      return;
    }

    try {
      await upload.mutateAsync({ userId: user.id, file });
      toast.success(t("accountScreen.profilePictureUpdated"));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("accountScreen.profilePictureFailed")),
      );
    }
  };

  return (
    <div className={clsx("relative inline-flex", className)}>
      <button
        type="button"
        onClick={onPick}
        disabled={isUploading}
        aria-label={t("accountScreen.changePhoto")}
        className={clsx(
          "group relative inline-flex shrink-0 items-center justify-center rounded-full",
          "transition-transform duration-200",
          !isUploading && "hover:scale-[1.03] active:scale-95 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        style={{ width: size, height: size }}
      >
        <span
          aria-hidden
          className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/40 to-primary-light/30 blur-md opacity-50 group-hover:opacity-90 transition-opacity"
        />
        <span className="relative inline-flex h-full w-full overflow-hidden rounded-full ring-2 ring-primary/70 ring-offset-2 ring-offset-background">
          <Avatar user={user} size={size} />
        </span>

        <span
          aria-hidden
          className={clsx(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity",
            !isUploading && "group-hover:opacity-100 group-focus-visible:opacity-100",
            isUploading && "opacity-100",
          )}
        >
          {isUploading ? (
            <Spinner size={size * 0.32} className="text-white" />
          ) : (
            <svg
              width={Math.round(size * 0.3)}
              height={Math.round(size * 0.3)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </span>

        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-background shadow-md"
        >
          {isUploading ? (
            <Spinner size={12} className="text-background" />
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
