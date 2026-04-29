import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { useCreateCollection } from "@/hooks/useCreateCollection";
import { canAddContent } from "@/lib/collectionPermissions";
import { getCollectionOwnership } from "@/lib/ownership";
import { getApiErrorMessage } from "@/lib/apiError";
import { OwnershipChip } from "./OwnershipChip";

interface CollectionPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently selected collection ids in the parent form. */
  currentCollectionIds: number[];
  /** Diff callback — fires with arrays of added/removed ids when user accepts. */
  onSelectionsChange: (added: number[], removed: number[]) => void;
  /** Hide these ids from the list (e.g. prevent self-parenting). */
  excludeCollectionIds?: number[];
}

export function CollectionPickerDialog({
  isOpen,
  onClose,
  currentCollectionIds,
  onSelectionsChange,
  excludeCollectionIds,
}: CollectionPickerDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState("");

  const { data: allCollections = [], isLoading } = useCollections({
    filter: "all",
    limit: 100,
  });
  const createCollection = useCreateCollection();

  useEffect(() => {
    if (!isOpen) return;
    const ids = new Set(currentCollectionIds);
    /* eslint-disable react-hooks/set-state-in-effect */
    setSelectedIds(new Set(ids));
    setInitialIds(new Set(ids));
    setSearchQuery("");
    setIsQuickCreating(false);
    setQuickCreateName("");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, currentCollectionIds]);

  const sorted = useMemo(() => {
    const excludeSet = new Set(excludeCollectionIds ?? []);
    const q = searchQuery.toLowerCase().trim();
    const base = allCollections.filter((c) => !excludeSet.has(c.id));
    const filtered = q
      ? base.filter((c) => c.name.toLowerCase().includes(q))
      : base;
    return [...filtered].sort((a, b) => {
      const aSelected = selectedIds.has(a.id) ? 0 : 1;
      const bSelected = selectedIds.has(b.id) ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;
      const aOwn = a.userId === user?.id ? 0 : 1;
      const bOwn = b.userId === user?.id ? 0 : 1;
      if (aOwn !== bOwn) return aOwn - bOwn;
      return a.name.localeCompare(b.name);
    });
  }, [allCollections, searchQuery, selectedIds, excludeCollectionIds, user?.id]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAccept = () => {
    const added = [...selectedIds].filter((id) => !initialIds.has(id));
    const removed = [...initialIds].filter((id) => !selectedIds.has(id));
    onSelectionsChange(added, removed);
    onClose();
  };

  const handleQuickCreate = async () => {
    const name = quickCreateName.trim();
    if (!name) return;
    try {
      const created = await createCollection.mutateAsync({ name });
      toast.success(t("collectionPicker.quickCreateSuccess"));
      setQuickCreateName("");
      setIsQuickCreating(false);
      setSelectedIds((prev) => new Set([...prev, created.id]));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionPicker.quickCreateError")));
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      stacked
      showClose={false}
      headerLeft={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-text-dim hover:text-text transition-colors"
          >
            {t("collectionPicker.cancel")}
          </button>
          <div className="flex flex-col items-center min-w-0">
            <h2 className="text-[16px] font-semibold text-text truncate">
              {t("collectionPicker.title")}
            </h2>
            {selectedCount > 0 ? (
              <span className="text-[11px] font-medium text-primary">
                {t("collectionPicker.multipleSelected", { count: selectedCount })}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAccept}
            className="text-[14px] font-semibold text-primary hover:brightness-110 transition"
          >
            {t("collectionPicker.accept")}
          </button>
        </div>
      }
    >
      <div className="flex flex-col">
        <div className="px-5 pt-1">
          <TextField
            placeholder={t("collectionPicker.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftAccessory={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-dim"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            rightAccessory={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-text-dim hover:text-text transition-colors"
                  aria-label="Clear"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : null
            }
          />
        </div>

        <div className="px-5 pt-3 pb-1">
          {isQuickCreating ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/60 bg-primary/[0.04] px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <input
                autoFocus
                value={quickCreateName}
                onChange={(e) => setQuickCreateName(e.target.value)}
                placeholder={t("collectionPicker.quickCreatePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickCreate();
                  }
                  if (e.key === "Escape") {
                    setIsQuickCreating(false);
                    setQuickCreateName("");
                  }
                }}
                className="flex-1 bg-transparent text-[14px] font-medium text-text outline-none placeholder:text-text-dim/70"
              />
              {createCollection.isPending ? (
                <Spinner size={16} />
              ) : (
                <button
                  type="button"
                  onClick={handleQuickCreate}
                  disabled={!quickCreateName.trim()}
                  className="text-[12px] font-semibold uppercase tracking-wide text-primary disabled:opacity-40"
                >
                  {t("collectionPicker.quickCreateButton")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsQuickCreating(false);
                  setQuickCreateName("");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-white/[0.05] hover:text-text transition-colors"
                aria-label="Cancel"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsQuickCreating(true)}
              className="group inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:brightness-110 transition"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <span>{t("collectionPicker.newCollection")}</span>
            </button>
          )}
        </div>

        <div className="flex-1 max-h-[55vh] overflow-y-auto px-3 pb-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size={20} />
            </div>
          ) : sorted.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-text-dim">
              {searchQuery.trim()
                ? t("collectionPicker.noResults")
                : t("collectionPicker.noCollections")}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {sorted.map((c) => {
                const isSelected = selectedIds.has(c.id);
                const ownership = getCollectionOwnership(c, user?.id);
                const hasWriteAccess = canAddContent(c, user?.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={
                        hasWriteAccess ? () => toggle(c.id) : undefined
                      }
                      disabled={!hasWriteAccess}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-primary/[0.07]"
                          : "hover:bg-white/[0.03]",
                        !hasWriteAccess && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-neutral-800 text-text-dim",
                        )}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] text-text">
                        {c.name}
                      </span>
                      {ownership && ownership !== "own" ? (
                        <OwnershipChip ownership={ownership} />
                      ) : null}
                      <span
                        aria-hidden
                        className={clsx(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                          isSelected
                            ? "bg-primary"
                            : "border-2 border-neutral-600",
                        )}
                      >
                        {isSelected ? (
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-background"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
