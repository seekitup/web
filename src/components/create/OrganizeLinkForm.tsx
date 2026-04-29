import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useInfiniteLinks } from "@/hooks/useInfiniteLinks";
import { useUpdateLink } from "@/hooks/useUpdateLink";
import { useCollections } from "@/hooks/useCollections";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { InfiniteScrollSentinel } from "@/components/list/InfiniteScrollSentinel";
import type { LinkResponseDto } from "@/types/api";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";
import { MiniLink } from "./MiniLink";

interface OrganizeLinkFormProps {
  onSuccess: () => void;
}

export function OrganizeLinkForm({ onSuccess }: OrganizeLinkFormProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  // Track selected links as full objects, not just ids — the displayed list is
  // paginated/searched, so a link the user picked may scroll out of the loaded
  // pages by the time they submit. Snapshotting on toggle keeps the merge with
  // existing `link.collections` correct regardless of current query state.
  const [selectedLinks, setSelectedLinks] = useState<Map<number, LinkResponseDto>>(
    new Map(),
  );
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    items: links,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteLinks({
    filter: "my",
    sortBy: "createdAt",
    search: debouncedSearch || undefined,
  });
  const { data: collections = [] } = useCollections({
    filter: "all",
    limit: 100,
  });
  const updateLink = useUpdateLink();

  const toggleLink = (link: LinkResponseDto) => {
    setSelectedLinks((prev) => {
      const next = new Map(prev);
      if (next.has(link.id)) next.delete(link.id);
      else next.set(link.id, link);
      return next;
    });
  };

  const handleSelectionsChange = (added: number[], removed: number[]) => {
    setTargetIds((prev) => [
      ...prev.filter((id) => !removed.includes(id)),
      ...added,
    ]);
  };

  const isFormValid = selectedLinks.size > 0 && targetIds.length > 0;
  const isSubmitting = updateLink.isPending;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    const promises = [...selectedLinks.values()].map(async (link) => {
      const existingIds = (link.collections ?? []).map((c) => c.id);
      const merged = Array.from(new Set([...existingIds, ...targetIds]));
      return updateLink.mutateAsync({
        id: link.id,
        data: { collectionIds: merged },
      });
    });
    try {
      const results = await Promise.allSettled(promises);
      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        toast.error(t("organizeLinkForm.error"));
        return;
      }
      toast.success(t("organizeLinkForm.success"));
      setSelectedLinks(new Map());
      setTargetIds([]);
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("organizeLinkForm.error")));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        <TextField
          placeholder={t("organizeLinkForm.searchPlaceholder")}
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
            {t("organizeLinkForm.sectionLabel")}
          </p>
          {selectedLinks.size > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/15 px-2 text-[11px] font-semibold text-primary">
              {selectedLinks.size}
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
          ) : links.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-text-dim">
              {t("organizeLinkForm.noLinks")}
            </p>
          ) : (
            <>
              {links.map((l) => (
                <MiniLink
                  key={l.id}
                  link={l}
                  isSelected={selectedLinks.has(l.id)}
                  onPress={() => toggleLink(l)}
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
            label={t("organizeLinkForm.addToCollection")}
            selectedCollectionIds={targetIds}
            collections={collections}
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
          {t("organizeLinkForm.addLinks")}
        </Button>
      </div>

      <CollectionPickerDialog
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentCollectionIds={targetIds}
        onSelectionsChange={handleSelectionsChange}
      />
    </>
  );
}
