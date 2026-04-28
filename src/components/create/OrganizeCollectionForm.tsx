import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { useAddParent } from "@/hooks/useAddParent";
import { canAddContent } from "@/lib/collectionPermissions";
import { getApiErrorMessage } from "@/lib/apiError";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";
import { MiniCollection } from "./MiniCollection";

interface OrganizeCollectionFormProps {
  onSuccess: () => void;
}

export function OrganizeCollectionForm({
  onSuccess,
}: OrganizeCollectionFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [sourceIds, setSourceIds] = useState<Set<number>>(new Set());
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: collections = [], isLoading } = useCollections({
    filter: "all",
    limit: 100,
  });
  const addParent = useAddParent();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return collections.filter((c) => {
      if (!canAddContent(c, user?.id)) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q);
    });
  }, [collections, search, user?.id]);

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
        <div className="flex flex-col gap-1.5">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size={20} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-text-dim">
              {t("organizeCollectionForm.noCollections")}
            </p>
          ) : (
            filtered.map((c) => (
              <MiniCollection
                key={c.id}
                collection={c}
                isSelected={sourceIds.has(c.id)}
                onPress={() => toggleSource(c.id)}
              />
            ))
          )}
        </div>

        <div className="pt-3 border-t border-neutral-800/70">
          <CollectionPickerTrigger
            label={t("organizeCollectionForm.addToCollection")}
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
