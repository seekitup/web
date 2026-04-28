import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { OptionRow } from "@/components/ui/OptionRow";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";
import { Avatar } from "@/components/ui/Avatar";
import {
  CopyIcon,
  PlusIcon,
  FolderIcon,
  PencilIcon,
  ShareIcon,
  EyeIcon,
  TrashIcon,
  MinusCircleIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateLink } from "@/hooks/useUpdateLink";
import { useDeleteLink } from "@/hooks/useDeleteLink";
import { useDuplicateLink } from "@/hooks/useDuplicateLink";
import { useRemoveLinkFromCollection } from "@/hooks/useRemoveLinkFromCollection";
import { useUpdateCollectionLinkVisibility } from "@/hooks/useUpdateCollectionLinkVisibility";
import {
  isLinkCreator,
  getLinkCreator,
  canMoveLink,
  canRenameLink,
  canChangeLinkVisibility,
  canDeleteLink,
  canRemoveLinkFromCollection,
  getUserDisplayName,
} from "@/lib/permissions";
import {
  getLinkDisplayTitle,
  getLinkFavicon,
  getLinkPrimaryMedia,
  getLinkThumbnailUrl,
} from "@/lib/linkUtils";
import { getRelativeTime } from "@/lib/relativeTime";
import { shareUrl } from "@/lib/share";
import { getApiErrorMessage } from "@/lib/apiError";
import type {
  CollectionResponseDto,
  LinkResponseDto,
} from "@/types/api";

export type LinkOptionsContext = "mylinks" | "collection" | "home";

interface Props {
  isOpen: boolean;
  link: LinkResponseDto | null;
  collection?: CollectionResponseDto | null;
  context?: LinkOptionsContext;
  collectionId?: number;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

type SubModal =
  | { kind: "none" }
  | { kind: "rename" }
  | { kind: "visibility" }
  | { kind: "delete-confirm" }
  | { kind: "remove-confirm" };

export function LinkOptionsModal({
  isOpen,
  link,
  collection,
  context = "home",
  collectionId,
  onClose,
  onDeleted,
  onUpdated,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;

  const [sub, setSub] = useState<SubModal>({ kind: "none" });

  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const duplicateLink = useDuplicateLink();
  const removeFromCollection = useRemoveLinkFromCollection();
  const updateLinkVisibility = useUpdateCollectionLinkVisibility();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setSub({ kind: "none" });
  }, [isOpen, link?.id]);

  const isCreator = isLinkCreator(link, userId);
  const creator = getLinkCreator(link);
  const canMove = canMoveLink(link, collection ?? null, userId);
  const canRename = canRenameLink(link, collection ?? null, userId);
  const canVis = canChangeLinkVisibility(link, collection ?? null, userId);
  const canDelete = canDeleteLink(link, collection ?? null, userId);
  const isCollectionContext = context === "collection";
  const showRename = !isCollectionContext && canRename;
  const showRemove =
    isCollectionContext &&
    canRemoveLinkFromCollection(link, collection ?? null, userId);
  const showDelete = !isCollectionContext && canDelete;

  const linkTitle = link ? getLinkDisplayTitle(link) : "";
  const favicon = link ? getLinkFavicon(link) : undefined;
  const thumbnailUrl = link ? getLinkThumbnailUrl(link) : undefined;
  const primaryMedia = link ? getLinkPrimaryMedia(link) : undefined;

  const handleCopy = useCallback(async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success(t("linkOptions.linkCopied"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("linkOptions.copyError")));
    }
  }, [link, onClose, t]);

  const handleAddToMyLinks = useCallback(async () => {
    if (!link) return;
    try {
      await duplicateLink.mutateAsync({ id: link.id });
      toast.success(t("linkOptions.addToMyLinksSuccess"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("linkOptions.duplicateError")));
    }
  }, [duplicateLink, link, onClose, t]);

  const handleShare = useCallback(async () => {
    if (!link) return;
    await shareUrl(link.url, linkTitle);
  }, [link, linkTitle]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!link) return;
    try {
      await deleteLink.mutateAsync(link.id);
      toast.success(t("linkOptions.deleteSuccess"));
      setSub({ kind: "none" });
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("linkOptions.deleteError")));
    }
  }, [deleteLink, link, onClose, onDeleted, t]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!link || !collection) return;
    try {
      await removeFromCollection.mutateAsync({
        collectionId: collection.id,
        linkId: link.id,
      });
      toast.success(t("linkOptions.removeFromCollectionSuccess"));
      setSub({ kind: "none" });
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, t("linkOptions.removeFromCollectionError")),
      );
    }
  }, [collection, link, onClose, onDeleted, removeFromCollection, t]);

  // Build a delete-confirmation message that lists the link's current
  // collections as inline chips, mirroring the mobile rendering.
  const deleteMessage = useMemo(() => {
    if (!link) return null;
    const cols = link.collections ?? [];
    if (cols.length === 0) {
      return t("linkOptions.deleteMessageNoCollections", { title: linkTitle });
    }
    return (
      <span>
        {t("linkOptions.deleteMessageWithCollections", { title: linkTitle })}
        <span className="mt-2 flex flex-wrap gap-1.5">
          {cols.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-text"
            >
              {c.name}
            </span>
          ))}
        </span>
      </span>
    );
  }, [link, linkTitle, t]);

  if (!link) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && sub.kind === "none"}
        onClose={onClose}
        showClose
        titleAlign="left"
        headerLeft={
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 shrink-0 rounded-xl bg-white/[0.05] overflow-hidden">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : primaryMedia?.url ? (
                <img
                  src={primaryMedia.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              {favicon?.url ? (
                <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-md ring-2 ring-surface bg-surface">
                  <img
                    src={favicon.url}
                    alt=""
                    className="h-3.5 w-3.5 rounded-sm"
                    loading="lazy"
                  />
                </span>
              ) : null}
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-text truncate">
                {linkTitle}
              </h2>
              {!isCreator && creator ? (
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Avatar user={creator} size={14} />
                  <span className="text-[12px] text-text-dim truncate">
                    {t("linkOptions.createdBy", {
                      name: getUserDisplayName(creator),
                    })}
                    {link.createdAt
                      ? ` · ${getRelativeTime(link.createdAt)}`
                      : ""}
                  </span>
                </div>
              ) : link.createdAt ? (
                <div className="text-[12px] text-text-dim truncate mt-0.5">
                  {t("linkOptions.createdTimeAgo", {
                    time: getRelativeTime(link.createdAt),
                  })}
                </div>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="flex flex-col py-1">
          <OptionRow
            icon={<CopyIcon />}
            label={t("linkOptions.copyLink")}
            onClick={handleCopy}
          />
          {!isCreator ? (
            <OptionRow
              icon={<PlusIcon />}
              label={t("linkOptions.addToMyLinks")}
              onClick={handleAddToMyLinks}
              loading={duplicateLink.isPending}
            />
          ) : null}
          {canMove ? (
            <OptionRow
              icon={<FolderIcon />}
              label={t("linkOptions.manageCollections")}
              onClick={() => {
                // Defers to the existing CollectionPickerDialog flow under
                // /create/. Wiring is a small follow-up; flagged in the plan.
                toast(t("common.comingSoon"));
              }}
            />
          ) : null}
          {showRename ? (
            <OptionRow
              icon={<PencilIcon />}
              label={t("linkOptions.rename")}
              onClick={() => setSub({ kind: "rename" })}
            />
          ) : null}
          <OptionRow
            icon={<ShareIcon />}
            label={t("linkOptions.share")}
            onClick={handleShare}
          />
          {canVis ? (
            <OptionRow
              icon={<EyeIcon />}
              label={t("linkOptions.changeVisibility")}
              description={
                isCollectionContext
                  ? t("linkOptions.changeVisibilityPerInstance")
                  : undefined
              }
              onClick={() => setSub({ kind: "visibility" })}
            />
          ) : null}
          {/* Select mode: gated identically to mobile (`canSelect && selectMode`).
              Web has no select-mode caller yet, so we render nothing. */}

          <div className="h-px bg-white/[0.06] my-1.5" />

          {showRemove ? (
            <OptionRow
              icon={<MinusCircleIcon />}
              tone="danger"
              label={t("linkOptions.removeFromCollection")}
              onClick={() => setSub({ kind: "remove-confirm" })}
              loading={removeFromCollection.isPending}
            />
          ) : null}
          {showDelete ? (
            <OptionRow
              icon={<TrashIcon />}
              tone="danger"
              label={t("linkOptions.delete")}
              onClick={() => setSub({ kind: "delete-confirm" })}
              loading={deleteLink.isPending}
            />
          ) : null}
        </div>
      </Modal>

      <RenameSubModal
        isOpen={isOpen && sub.kind === "rename"}
        currentName={link.title || ""}
        isPending={updateLink.isPending}
        onCancel={() => setSub({ kind: "none" })}
        onSave={async (next) => {
          try {
            await updateLink.mutateAsync({
              id: link.id,
              data: { title: next },
            });
            onUpdated?.();
            setSub({ kind: "none" });
          } catch (err) {
            toast.error(
              getApiErrorMessage(err, t("linkOptions.renameError")),
            );
          }
        }}
      />

      <VisibilitySubModal
        isOpen={isOpen && sub.kind === "visibility"}
        link={link}
        isCollectionContext={isCollectionContext}
        onCancel={() => setSub({ kind: "none" })}
        onConfirm={async (newVisibility) => {
          try {
            if (isCollectionContext && collectionId) {
              const currentEffective =
                link.effectiveVisibility ?? link.visibility;
              if (newVisibility === currentEffective) {
                setSub({ kind: "none" });
                return;
              }
              await updateLinkVisibility.mutateAsync({
                collectionId,
                linkId: link.id,
                data: { visibility: newVisibility },
              });
            } else {
              if (newVisibility === link.visibility) {
                setSub({ kind: "none" });
                return;
              }
              await updateLink.mutateAsync({
                id: link.id,
                data: { visibility: newVisibility },
              });
            }
            onUpdated?.();
            setSub({ kind: "none" });
          } catch (err) {
            toast.error(
              getApiErrorMessage(err, t("linkOptions.visibilityError")),
            );
          }
        }}
        isPending={updateLink.isPending || updateLinkVisibility.isPending}
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "delete-confirm"}
        onClose={() => setSub({ kind: "none" })}
        onConfirm={handleDeleteConfirm}
        title={t("linkOptions.deleteTitle")}
        message={deleteMessage}
        confirmLabel={t("common.delete")}
        tone="danger"
        isPending={deleteLink.isPending}
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "remove-confirm"}
        onClose={() => setSub({ kind: "none" })}
        onConfirm={handleRemoveConfirm}
        title={t("linkOptions.removeFromCollectionTitle")}
        message={t("linkOptions.removeFromCollectionMessage", {
          title: linkTitle,
          collection: collection?.name ?? "",
        })}
        confirmLabel={t("linkOptions.removeFromCollection")}
        tone="danger"
        isPending={removeFromCollection.isPending}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-modals
// ────────────────────────────────────────────────────────────────────

function RenameSubModal({
  isOpen,
  currentName,
  isPending,
  onCancel,
  onSave,
}: {
  isOpen: boolean;
  currentName: string;
  isPending: boolean;
  onCancel: () => void;
  onSave: (next: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(currentName);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== currentName.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("linkOptions.renameTitle")}
      stacked
      dismissOnBackdrop={!isPending}
      dismissOnEscape={!isPending}
    >
      <form
        className="px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) void onSave(trimmed);
        }}
      >
        <TextField
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("linkOptions.renamePlaceholder")}
          disabled={isPending}
        />
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-text-dim hover:bg-white/[0.06] hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={!canSave || isPending}
            className="px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-background hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function VisibilitySubModal({
  isOpen,
  link,
  isCollectionContext,
  onCancel,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  link: LinkResponseDto;
  isCollectionContext: boolean;
  onCancel: () => void;
  onConfirm: (next: "private" | "public") => Promise<void>;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const initial = isCollectionContext
    ? (link.effectiveVisibility ?? link.visibility) === "private"
    : link.visibility === "private";
  const [isPrivate, setIsPrivate] = useState(initial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setIsPrivate(initial);
  }, [isOpen, initial]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("linkOptions.visibilityModalTitle")}
      stacked
      dismissOnBackdrop={!isPending}
      dismissOnEscape={!isPending}
    >
      <div className="px-5 pb-5">
        {isCollectionContext ? (
          <p className="text-[12px] text-text-dim mb-3">
            {t("linkOptions.visibilityPerInstanceHint")}
          </p>
        ) : null}
        <label className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3.5 cursor-pointer">
          <div>
            <div className="text-[15px] font-semibold text-text">
              {isPrivate ? t("visibility.private") : t("visibility.public")}
            </div>
            <div className="text-[12px] text-text-dim mt-0.5">
              {isPrivate
                ? t("visibility.privateHint")
                : t("visibility.publicHint")}
            </div>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-5 w-5 accent-primary"
            aria-label={t("common.private")}
          />
        </label>
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-text-dim hover:bg-white/[0.06] hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(isPrivate ? "private" : "public")}
            disabled={isPending}
            className="px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-background hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
