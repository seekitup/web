import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { useInfiniteCollections } from "@/hooks/useInfiniteCollections";
import { useAddParent } from "@/hooks/useAddParent";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { canAddContent } from "@/lib/collectionPermissions";
import { getApiErrorMessage } from "@/lib/apiError";
import { InfiniteScrollSentinel } from "@/components/list/InfiniteScrollSentinel";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";
import { MiniCollection } from "./MiniCollection";

interface OrganizeCollectionFormProps {
  onSuccess: () => void;
}

// Auto-fetch the next page if the post-permission-filter list is at or below
// this length and more pages exist — keeps the visible list from looking
// empty when many items in a page get filtered out by `canAddContent`.
const MIN_VISIBLE_BEFORE_AUTO_FETCH = 5;

export function OrganizeCollectionForm({
  onSuccess,
}: OrganizeCollectionFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [sourceIds, setSourceIds] = useState<Set<number>>(new Set());
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    items: collections,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteCollections({
    filter: "all",
    name: debouncedSearch || undefined,
  });
  // Bounded second query feeds CollectionPickerTrigger's selected-name lookup —
  // the trigger needs to resolve names regardless of what the paginated list
  // happens to have loaded. Matches the pattern in OrganizeLinkForm.
  const { data: triggerCollections = [] } = useCollections({
    filter: "all",
    limit: 100,
  });
  const addParent = useAddParent();

  const filtered = useMemo(
    () => collections.filter((c) => canAddContent(c, user?.id)),
    [collections, user?.id],
  );

  useEffect(() => {
    if (
      filtered.length <= MIN_VISIBLE_BEFORE_AUTO_FETCH &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoading
    ) {
      fetchNextPage();
    }
  }, [
    filtered.length,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  ]);

  const toggleSource = (id: number) => {
    setSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectionsChange = (added: number[], removed: number[]) => {
    setTargetIds((prev) => [
      ...prev.filter((id) => !removed.includes(id)),
      ...added,
    ]);
  };

  const isFormValid = sourceIds.size > 0 && targetIds.length > 0;
  const isSubmitting = addParent.isPending;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    const pairs: { collectionId: number; parentCollectionId: number }[] = [];
    for (const sourceId of sourceIds) {
      for (const targetId of targetIds) {
        if (sourceId === targetId) continue;
        pairs.push({
          collectionId: sourceId,
          parentCollectionId: targetId,
        });
      }
    }
    try {
      const results = await Promise.allSettled(
        pairs.map((p) => addParent.mutateAsync(p)),
      );
      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        toast.error(t("organizeCollectionForm.error"));
        return;
      }
      toast.success(t("organizeCollectionForm.success"));
      setSourceIds(new Set());
      setTargetIds([]);
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("organizeCollectionForm.error")));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        <TextField
          placeholder={t("organizeCollectionForm.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear"
                className="text-text-dim hover:text-text transition-colors"
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
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-dim">
            {t("organizeCollectionForm.sectionLabel")}
          </p>
          {sourceIds.size > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/15 px-2 text-[11px] font-semibold text-primary">
              {sourceIds.size}
            </span>
          ) : null}
        </div>
        <div
          ref={scrollRef}
          className="flex max-h-[280px] flex-col gap-1.5 overflow-y-auto pr-1 -mr-1"
        >
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size={20} />
            </div>
          ) : filtered.length === 0 && !hasNextPage ? (
            <p className="py-6 text-center text-[14px] text-text-dim">
              {t("organizeCollectionForm.noCollections")}
            </p>
          ) : (
            <>
              {filtered.map((c) => (
                <MiniCollection
                  key={c.id}
                  collection={c}
                  isSelected={sourceIds.has(c.id)}
                  onPress={() => toggleSource(c.id)}
                />
              ))}
              <InfiniteScrollSentinel
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                root={scrollRef.current}
                rootMargin="120px 0px"
                className="flex justify-center py-3"
              />
            </>
          )}
        </div>

        <div className="pt-3 border-t border-neutral-800/70">
          <CollectionPickerTrigger
            label={t("organizeCollectionForm.addToCollection")}
            selectedCollectionIds={targetIds}
            collections={triggerCollections}
            onPress={() => setPickerOpen(true)}
            onClear={() => setTargetIds([])}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-neutral-800/70 bg-surface px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <Button
          type="button"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={!isFormValid}
          onClick={handleSubmit}
        >
          {t("organizeCollectionForm.addCollections")}
        </Button>
      </div>

      <CollectionPickerDialog
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentCollectionIds={targetIds}
        onSelectionsChange={handleSelectionsChange}
        excludeCollectionIds={[...sourceIds]}
      />
    </>
  );
}
