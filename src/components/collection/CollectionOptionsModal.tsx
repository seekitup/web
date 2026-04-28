import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { OptionRow } from "@/components/ui/OptionRow";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";
import { Avatar } from "@/components/ui/Avatar";
import {
  CopyIcon,
  CollectionIcon,
  PencilIcon,
  ShareIcon,
  QrIcon,
  EyeIcon,
  UsersIcon,
  TrashIcon,
  LogOutIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateCollection } from "@/hooks/useUpdateCollection";
import { useDeleteCollection } from "@/hooks/useDeleteCollection";
import { useDuplicateCollection } from "@/hooks/useDuplicateCollection";
import { useLeaveCollection } from "@/hooks/useLeaveCollection";
import { useUpdateCollectionParentVisibility } from "@/hooks/useUpdateCollectionParentVisibility";
import { useRemoveMember } from "@/hooks/useRemoveMember";
import { useUpdateMemberRole } from "@/hooks/useUpdateMemberRole";
import { useInviteMember } from "@/hooks/useInviteMember";
import {
  canManageMembers,
  canChangeVisibility,
  canRenameCollection,
  canManageParents,
  canDeleteCollection,
  canLeaveCollection,
  isCollectionOwner,
  getCollectionOwner,
  getUserDisplayName,
} from "@/lib/permissions";
import { getRelativeTime } from "@/lib/relativeTime";
import { getCollectionShareUrl, shareUrl } from "@/lib/share";
import { getApiErrorMessage } from "@/lib/apiError";
import type {
  CollectionResponseDto,
  CollectionRoleUserDto,
} from "@/types/api";

interface Props {
  isOpen: boolean;
  collection: CollectionResponseDto | null;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
  /**
   * When provided, "Change visibility" applies a per-instance override against
   * this parent collection rather than the global collection visibility. The
   * "Delete" / "Manage parents" actions still apply globally to the collection
   * itself.
   */
  parentCollectionId?: number;
}

type SubModal =
  | { kind: "none" }
  | { kind: "rename" }
  | { kind: "visibility" }
  | { kind: "share-private-confirm" }
  | { kind: "downgrade-with-collaborators-confirm" }
  | { kind: "delete-confirm" }
  | { kind: "leave-confirm" }
  | { kind: "edit-editors" };

export function CollectionOptionsModal({
  isOpen,
  collection,
  onClose,
  onDeleted,
  onUpdated,
  parentCollectionId,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [sub, setSub] = useState<SubModal>({ kind: "none" });

  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const duplicateCollection = useDuplicateCollection();
  const leaveCollection = useLeaveCollection();
  const updateParentVisibility = useUpdateCollectionParentVisibility();

  // Reset sub-modal when the modal closes / collection changes — synchronous
  // setState here is intentional: the sub-modal stack is purely UI state
  // derived from the parent modal's open/close lifecycle.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setSub({ kind: "none" });
  }, [isOpen, collection?.id]);

  const owner = useMemo(() => getCollectionOwner(collection), [collection]);
  const isOwner = isCollectionOwner(collection, userId);
  const canRename = canRenameCollection(collection, userId);
  const canMove = canManageParents(collection, userId);
  const canEditVisibility = canChangeVisibility(collection, userId);
  const canEditMembers = canManageMembers(collection, userId);
  const canDelete = canDeleteCollection(collection, userId);
  const canLeave = canLeaveCollection(collection, userId);

  // ── action handlers ──────────────────────────────────────────────

  const handleDuplicate = useCallback(async () => {
    if (!collection) return;
    try {
      const created = await duplicateCollection.mutateAsync({
        id: collection.id,
      });
      toast.success(t("collectionOptions.duplicateSuccess"));
      onUpdated?.();
      onClose();
      // Navigate to the new collection if we know the route
      if (created?.user?.username && created.slug) {
        navigate(`/${created.user.username}/${created.slug}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.duplicateError")));
    }
  }, [collection, duplicateCollection, navigate, onClose, onUpdated, t]);

  const handleShare = useCallback(async () => {
    if (!collection) return;
    if (collection.visibility === "private") {
      setSub({ kind: "share-private-confirm" });
      return;
    }
    await shareUrl(getCollectionShareUrl(collection), collection.name);
  }, [collection]);

  const handleShareConfirm = useCallback(async () => {
    if (!collection) return;
    try {
      await updateCollection.mutateAsync({
        id: collection.id,
        data: { visibility: "public" },
      });
      onUpdated?.();
      setSub({ kind: "none" });
      // Re-derive the share URL with whatever owner info we now have
      await shareUrl(getCollectionShareUrl(collection), collection.name);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.shareError")));
    }
  }, [collection, onUpdated, t, updateCollection]);

  const handleQR = useCallback(() => {
    // QR generation deferred to a follow-up to avoid an extra dependency;
    // the share URL is at least copyable for now.
    if (!collection) return;
    void navigator.clipboard
      ?.writeText(getCollectionShareUrl(collection))
      .catch(() => undefined);
    toast(t("common.comingSoon"));
  }, [collection, t]);

  const handleDelete = useCallback(() => {
    setSub({ kind: "delete-confirm" });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!collection) return;
    try {
      await deleteCollection.mutateAsync(collection.id);
      toast.success(t("collectionOptions.deleteSuccess"));
      setSub({ kind: "none" });
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.deleteError")));
    }
  }, [collection, deleteCollection, onClose, onDeleted, t]);

  const handleLeave = useCallback(() => {
    setSub({ kind: "leave-confirm" });
  }, []);

  const handleLeaveConfirm = useCallback(async () => {
    if (!collection || !userId) return;
    try {
      await leaveCollection.mutateAsync({
        collectionId: collection.id,
        userId,
      });
      toast.success(t("collectionOptions.leaveSuccess"));
      setSub({ kind: "none" });
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.leaveError")));
    }
  }, [collection, leaveCollection, onClose, onDeleted, t, userId]);

  // Build the delete-confirmation message exactly like mobile (counts +
  // optional parent collection list).
  const deleteMessage = useMemo(() => {
    if (!collection) return "";
    const links = collection.totalLinks ?? 0;
    const subCount = collection.childCollections?.length ?? 0;

    const parts: string[] = [];
    if (links > 0)
      parts.push(t("collectionOptions.linkCount", { count: links }));
    if (subCount > 0)
      parts.push(
        t("collectionOptions.subcollectionCount", { count: subCount }),
      );
    const contents = parts.length
      ? " " + t("collectionOptions.deleteContains", { contents: parts.join(", ") })
      : "";
    return t("collectionOptions.deleteMessage", { name: collection.name }) + contents;
  }, [collection, t]);

  if (!collection) return null;

  // Don't render the option list when a sub-modal is open — the sub-modal
  // sits on top via `stacked`, and the user should focus on it.
  return (
    <>
      <Modal
        isOpen={isOpen && sub.kind === "none"}
        onClose={onClose}
        showClose
        titleAlign="left"
        headerLeft={
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-white/[0.05] flex items-center justify-center text-text-dim">
              <CollectionIcon size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-text truncate">
                {collection.name}
              </h2>
              {owner ? (
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Avatar user={owner} size={14} />
                  <span className="text-[12px] text-text-dim truncate">
                    {isOwner
                      ? t("collectionOptions.createdBy", {
                          name: getUserDisplayName(owner),
                        })
                      : t("collectionOptions.sharedBy", {
                          name: getUserDisplayName(owner),
                        })}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="flex flex-col py-1">
          <OptionRow
            icon={<CopyIcon />}
            label={t("collectionOptions.duplicate")}
            onClick={handleDuplicate}
            loading={duplicateCollection.isPending}
          />
          {canMove ? (
            <OptionRow
              icon={<CollectionIcon />}
              label={t("collectionOptions.manageParents")}
              onClick={() => {
                // The picker dialog lives in /create/ and is wired up in the
                // create flow. For now, route the user to the create modal
                // by emitting a toast hint — full integration is a follow-up.
                toast(t("common.comingSoon"));
              }}
            />
          ) : null}
          {canRename ? (
            <OptionRow
              icon={<PencilIcon />}
              label={t("collectionOptions.rename")}
              onClick={() => setSub({ kind: "rename" })}
            />
          ) : null}
          <OptionRow
            icon={<ShareIcon />}
            label={t("collectionOptions.share")}
            onClick={handleShare}
            loading={updateCollection.isPending}
          />
          <OptionRow
            icon={<QrIcon />}
            label={t("collectionOptions.qrCode")}
            onClick={handleQR}
          />
          {canEditVisibility ? (
            <OptionRow
              icon={<EyeIcon />}
              label={t("collectionOptions.changeVisibility")}
              description={
                parentCollectionId
                  ? t("collectionOptions.changeVisibilityPerInstance")
                  : undefined
              }
              onClick={() => setSub({ kind: "visibility" })}
            />
          ) : null}
          {canEditMembers ? (
            <OptionRow
              icon={<UsersIcon />}
              label={t("collectionOptions.editEditors")}
              onClick={() => setSub({ kind: "edit-editors" })}
            />
          ) : null}
          {/* Select mode is gated identically to mobile (`selectMode` context).
              Web has no select-mode caller yet, so the row stays hidden. */}

          <div className="h-px bg-white/[0.06] my-1.5" />

          {canDelete ? (
            <OptionRow
              icon={<TrashIcon />}
              tone="danger"
              label={t("collectionOptions.delete")}
              onClick={handleDelete}
              loading={deleteCollection.isPending}
            />
          ) : canLeave ? (
            <OptionRow
              icon={<LogOutIcon />}
              tone="danger"
              label={t("collectionOptions.leaveCollection")}
              onClick={handleLeave}
              loading={leaveCollection.isPending}
            />
          ) : null}
        </div>
      </Modal>

      {/* ── Sub-modals ─────────────────────────────────────────── */}

      <RenameSubModal
        isOpen={isOpen && sub.kind === "rename"}
        currentName={collection.name}
        isPending={updateCollection.isPending}
        onCancel={() => setSub({ kind: "none" })}
        onSave={async (newName) => {
          try {
            await updateCollection.mutateAsync({
              id: collection.id,
              data: { name: newName },
            });
            onUpdated?.();
            setSub({ kind: "none" });
          } catch (err) {
            toast.error(
              getApiErrorMessage(err, t("collectionOptions.renameError")),
            );
          }
        }}
      />

      <VisibilitySubModal
        isOpen={isOpen && sub.kind === "visibility"}
        collection={collection}
        parentCollectionId={parentCollectionId}
        onCancel={() => setSub({ kind: "none" })}
        onConfirm={async (newVisibility) => {
          if (parentCollectionId) {
            try {
              await updateParentVisibility.mutateAsync({
                parentCollectionId,
                childCollectionId: collection.id,
                data: { visibility: newVisibility },
              });
              onUpdated?.();
              setSub({ kind: "none" });
            } catch (err) {
              toast.error(
                getApiErrorMessage(
                  err,
                  t("collectionOptions.visibilityError"),
                ),
              );
            }
            return;
          }
          if (newVisibility === collection.visibility) {
            setSub({ kind: "none" });
            return;
          }
          const hasNonOwnerCollabs =
            newVisibility === "private" &&
            collection.members?.some(
              (m: CollectionRoleUserDto) => m.roleName !== "owner",
            );
          if (hasNonOwnerCollabs) {
            setSub({ kind: "downgrade-with-collaborators-confirm" });
            return;
          }
          try {
            await updateCollection.mutateAsync({
              id: collection.id,
              data: { visibility: newVisibility },
            });
            onUpdated?.();
            setSub({ kind: "none" });
          } catch (err) {
            toast.error(
              getApiErrorMessage(err, t("collectionOptions.visibilityError")),
            );
          }
        }}
        isPending={
          updateCollection.isPending || updateParentVisibility.isPending
        }
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "share-private-confirm"}
        onClose={() => setSub({ kind: "none" })}
        onConfirm={handleShareConfirm}
        title={t("collectionOptions.sharePrivateTitle")}
        message={t("collectionOptions.sharePrivateMessage")}
        confirmLabel={t("collectionOptions.sharePrivateConfirm")}
        tone="primary"
        isPending={updateCollection.isPending}
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "downgrade-with-collaborators-confirm"}
        onClose={() => setSub({ kind: "visibility" })}
        onConfirm={async () => {
          try {
            await updateCollection.mutateAsync({
              id: collection.id,
              data: { visibility: "private", removeCollaborators: true },
            });
            onUpdated?.();
            setSub({ kind: "none" });
          } catch (err) {
            toast.error(
              getApiErrorMessage(err, t("collectionOptions.visibilityError")),
            );
          }
        }}
        title={t("collectionOptions.privateWithCollaboratorsTitle")}
        message={t("collectionOptions.privateWithCollaboratorsMessage")}
        tone="danger"
        isPending={updateCollection.isPending}
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "delete-confirm"}
        onClose={() => setSub({ kind: "none" })}
        onConfirm={handleDeleteConfirm}
        title={t("collectionOptions.deleteTitle")}
        message={deleteMessage}
        confirmLabel={t("common.delete")}
        tone="danger"
        isPending={deleteCollection.isPending}
      />

      <ConfirmModal
        isOpen={isOpen && sub.kind === "leave-confirm"}
        onClose={() => setSub({ kind: "none" })}
        onConfirm={handleLeaveConfirm}
        title={t("collectionOptions.leaveTitle")}
        message={t("collectionOptions.leaveMessage")}
        confirmLabel={t("collectionOptions.leaveCollection")}
        tone="danger"
        isPending={leaveCollection.isPending}
      />

      <EditEditorsSubModal
        isOpen={isOpen && sub.kind === "edit-editors"}
        collection={collection}
        onClose={() => setSub({ kind: "none" })}
        onChanged={() => onUpdated?.()}
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
  onSave: (newName: string) => Promise<void>;
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
      title={t("collectionOptions.renameTitle")}
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
          placeholder={t("collectionOptions.renamePlaceholder")}
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
  collection,
  parentCollectionId,
  onCancel,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  collection: CollectionResponseDto;
  parentCollectionId: number | undefined;
  onCancel: () => void;
  onConfirm: (next: "private" | "public") => Promise<void>;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  // Per-instance modal uses the global value as the initial seed; consumers
  // get a single boolean toggle either way.
  const initialPrivate = collection.visibility === "private";
  const [isPrivate, setIsPrivate] = useState(initialPrivate);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setIsPrivate(initialPrivate);
  }, [isOpen, initialPrivate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("collectionOptions.visibilityModalTitle")}
      stacked
      dismissOnBackdrop={!isPending}
      dismissOnEscape={!isPending}
    >
      <div className="px-5 pb-5">
        {parentCollectionId ? (
          <p className="text-[12px] text-text-dim mb-3">
            {t("collectionOptions.visibilityPerInstanceHint")}
          </p>
        ) : null}
        <label className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3.5 cursor-pointer">
          <div>
            <div className="text-[15px] font-semibold text-text">
              {isPrivate
                ? t("visibility.private")
                : t("visibility.public")}
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

function EditEditorsSubModal({
  isOpen,
  collection,
  onClose,
  onChanged,
}: {
  isOpen: boolean;
  collection: CollectionResponseDto;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();
  const inviteMember = useInviteMember();

  const [email, setEmail] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setEmail("");
  }, [isOpen]);

  const editableMembers = (collection.members ?? []).filter(
    (m) => m.roleName !== "owner",
  );

  const handleRoleChange = useCallback(
    async (memberId: number, next: "owner" | "editor") => {
      try {
        await updateMemberRole.mutateAsync({
          collectionId: collection.id,
          memberId,
          data: { roleName: next },
        });
        onChanged();
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, t("collectionOptions.editEditorsError")),
        );
      }
    },
    [collection.id, onChanged, t, updateMemberRole],
  );

  const handleRemove = useCallback(
    async (memberId: number) => {
      try {
        await removeMember.mutateAsync({
          collectionId: collection.id,
          memberId,
        });
        onChanged();
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, t("collectionOptions.editEditorsError")),
        );
      }
    },
    [collection.id, onChanged, removeMember, t],
  );

  const handleInvite = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await inviteMember.mutateAsync({
        collectionId: collection.id,
        data: { email: trimmed, roleName: "editor" },
      });
      toast.success(t("collectionOptions.inviteSuccess"));
      setEmail("");
      onChanged();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.inviteError")));
    }
  }, [collection.id, email, inviteMember, onChanged, t]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("collectionOptions.editEditorsTitle")}
      stacked
    >
      <div className="px-5 pb-5">
        {editableMembers.length === 0 ? (
          <p className="text-sm text-text-dim py-6 text-center">
            {t("collectionOptions.noEditorsYet")}
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {editableMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5"
              >
                <Avatar user={m} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-text truncate">
                    {getUserDisplayName(m)}
                  </div>
                  <div className="text-[12px] text-text-dim truncate">
                    @{m.username}
                  </div>
                </div>
                <select
                  value={m.roleName}
                  onChange={(e) =>
                    void handleRoleChange(
                      m.id,
                      e.target.value as "owner" | "editor",
                    )
                  }
                  disabled={updateMemberRole.isPending}
                  className="bg-surface text-text text-[12px] rounded-full border border-neutral-700 px-2 py-1 cursor-pointer"
                >
                  <option value="editor">{t("roles.editor")}</option>
                  <option value="owner">{t("roles.owner")}</option>
                </select>
                <button
                  type="button"
                  onClick={() => void handleRemove(m.id)}
                  disabled={removeMember.isPending}
                  aria-label={t("collectionOptions.removeMember")}
                  className="ml-1 h-8 w-8 inline-flex items-center justify-center rounded-full text-text-dim hover:bg-danger/15 hover:text-danger transition cursor-pointer"
                >
                  <TrashIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <label className="text-[12px] font-medium text-text-dim mb-2 block">
            {t("collectionOptions.inviteEditorLabel")}
          </label>
          <div className="flex gap-2">
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("collectionOptions.invitePlaceholder")}
              disabled={inviteMember.isPending}
              containerClassName="flex-1"
            />
            <button
              type="button"
              onClick={() => void handleInvite()}
              disabled={!email.trim() || inviteMember.isPending}
              className="px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-background hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
            >
              {inviteMember.isPending
                ? t("common.loading")
                : t("collectionOptions.inviteButton")}
            </button>
          </div>
          <p className="text-[11px] text-text-dim mt-2">
            {t("collectionOptions.shareableNote", {
              url: getCollectionShareUrl(collection),
            })}
          </p>
          <p className="text-[10px] text-text-dim mt-3">
            {t("collectionOptions.editorsCreatedRelative", {
              time: getRelativeTime(collection.createdAt),
            })}
          </p>
        </div>
      </div>
    </Modal>
  );
}
