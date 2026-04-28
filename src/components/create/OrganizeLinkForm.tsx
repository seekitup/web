import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useLinks } from "@/hooks/useLinks";
import { useUpdateLink } from "@/hooks/useUpdateLink";
import { useCollections } from "@/hooks/useCollections";
import { getApiErrorMessage } from "@/lib/apiError";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";
import { MiniLink } from "./MiniLink";

interface OrganizeLinkFormProps {
  onSuccess: () => void;
}

export function OrganizeLinkForm({ onSuccess }: OrganizeLinkFormProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [linkIds, setLinkIds] = useState<Set<number>>(new Set());
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: links = [], isLoading } = useLinks({
    filter: "my",
    limit: 100,
    sortBy: "createdAt",
  });
  const { data: collections = [] } = useCollections({
    filter: "all",
    limit: 100,
  });
  const updateLink = useUpdateLink();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return links;
    return links.filter((l) => {
      const haystack = `${l.title} ${l.ogTitle ?? ""} ${l.domain}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [links, search]);

  const toggleLink = (id: number) => {
    setLinkIds((prev) => {
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

  const isFormValid = linkIds.size > 0 && targetIds.length > 0;
  const isSubmitting = updateLink.isPending;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    const linksById = new Map(links.map((l) => [l.id, l]));
    const promises = [...linkIds].map(async (id) => {
      const link = linksById.get(id);
      const existingIds = (link?.collections ?? []).map((c) => c.id);
      const merged = Array.from(new Set([...existingIds, ...targetIds]));
      return updateLink.mutateAsync({ id, data: { collectionIds: merged } });
    });
    try {
      const results = await Promise.allSettled(promises);
      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        toast.error(t("organizeLinkForm.error"));
        return;
      }
      toast.success(t("organizeLinkForm.success"));
      setLinkIds(new Set());
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
          {linkIds.size > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/15 px-2 text-[11px] font-semibold text-primary">
              {linkIds.size}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size={20} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-text-dim">
              {t("organizeLinkForm.noLinks")}
            </p>
          ) : (
            filtered.map((l) => (
              <MiniLink
                key={l.id}
                link={l}
                isSelected={linkIds.has(l.id)}
                onPress={() => toggleLink(l.id)}
              />
            ))
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
