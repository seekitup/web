import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { BookmarkIcon, BookmarkFilledIcon } from "@/components/ui/icons";
import { useIsCollectionSaved } from "@/hooks/useIsCollectionSaved";
import { useSaveCollection } from "@/hooks/useSaveCollection";
import { useUnsaveCollection } from "@/hooks/useUnsaveCollection";
import { getApiErrorMessage } from "@/lib/apiError";

interface SaveCollectionBannerProps {
  collectionId: number;
}

/**
 * Save / unsave card surfaced on the authenticated collection page when the
 * viewer is signed in, the collection is public, and they have no membership
 * (owner or invitee). Mirrors the visual language of `PendingInvitationBanner`
 * so the two banners read as a family.
 */
export function SaveCollectionBanner({ collectionId }: SaveCollectionBannerProps) {
  const { t } = useTranslation();
  const { isSaved, isFetched } = useIsCollectionSaved(collectionId);
  const saveCollection = useSaveCollection();
  const unsaveCollection = useUnsaveCollection();

  // Skip the first paint until we know the saved state — avoids the banner
  // flickering between "Save" and "Saved" copy when the cache is cold.
  if (!isFetched) return null;

  const isPending = saveCollection.isPending || unsaveCollection.isPending;

  const handleClick = () => {
    if (isPending) return;
    if (isSaved) {
      unsaveCollection.mutate(collectionId, {
        onSuccess: () => toast.success(t("savedCollections.unsaveSuccess")),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, t("savedCollections.unsaveError"))),
      });
    } else {
      saveCollection.mutate(collectionId, {
        onSuccess: () => toast.success(t("savedCollections.saveSuccess")),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, t("savedCollections.saveError"))),
      });
    }
  };

  const title = isSaved
    ? t("savedCollections.savedCardTitle")
    : t("savedCollections.saveCardTitle");
  const subtitle = isSaved
    ? t("savedCollections.savedCardSubtitle")
    : t("savedCollections.saveCardSubtitle");
  const buttonLabel = isSaved
    ? t("savedCollections.saved")
    : t("savedCollections.save");

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-neutral-900/80 p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 255, 153, 0.06) 0%, rgba(0, 255, 153, 0.02) 100%)",
      }}
      role="region"
      aria-label={title}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          {isSaved ? (
            <BookmarkFilledIcon size={18} />
          ) : (
            <BookmarkIcon size={18} />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-[13px] text-white/60">{subtitle}</p>
        </div>
      </div>

      <Button
        variant={isSaved ? "outlined" : "primary"}
        size="md"
        loading={isPending}
        disabled={isPending}
        onClick={handleClick}
        leftIcon={
          isPending ? null : isSaved ? (
            <BookmarkFilledIcon size={14} />
          ) : (
            <BookmarkIcon size={14} />
          )
        }
        className="w-full sm:w-auto sm:shrink-0"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
