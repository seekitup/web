import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Switch } from "@/components/ui/Switch";
import { useCollections } from "@/hooks/useCollections";
import { useCreateCollection } from "@/hooks/useCreateCollection";
import { useInviteMember } from "@/hooks/useInviteMember";
import { getApiErrorMessage } from "@/lib/apiError";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";
import {
  EditorManager,
  type EditorInfo,
  type EditorManagerHandle,
} from "./EditorManager";

interface CollectionFormProps {
  onSuccess: () => void;
  preselectedCollectionIds?: number[];
}

export function CollectionForm({
  onSuccess,
  preselectedCollectionIds = [],
}: CollectionFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    preselectedCollectionIds,
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [showEditors, setShowEditors] = useState(false);
  const [editors, setEditors] = useState<EditorInfo[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const editorManagerRef = useRef<EditorManagerHandle>(null);

  const { data: collections = [] } = useCollections({
    filter: "all",
    limit: 100,
  });
  const createCollection = useCreateCollection();
  const inviteMember = useInviteMember();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCollectionIds(preselectedCollectionIds);
  }, [preselectedCollectionIds]);

  const isFormValid = name.trim().length > 0;
  const isLoading = createCollection.isPending || inviteMember.isPending;

  const handleSelectionsChange = (added: number[], removed: number[]) => {
    setSelectedCollectionIds((prev) => [
      ...prev.filter((id) => !removed.includes(id)),
      ...added,
    ]);
  };

  const handleCreate = async () => {
    if (!isFormValid) return;

    const flushed = await editorManagerRef.current?.flushPendingInput();
    if (flushed === null) return;
    const finalEditors = flushed ?? editors;

    try {
      const created = await createCollection.mutateAsync({
        name: name.trim(),
        visibility: isPrivate ? "private" : "public",
        ...(selectedCollectionIds.length > 0
          ? { parentCollectionIds: selectedCollectionIds }
          : {}),
      });

      const editorsToInvite = finalEditors.filter((e) => !!e?.email);
      if (editorsToInvite.length > 0 && created.id) {
        await Promise.allSettled(
          editorsToInvite.map((editor) =>
            inviteMember.mutateAsync({
              collectionId: created.id,
              data: { email: editor.email, roleName: "editor" },
            }),
          ),
        );
        toast.success(
          t("editorsModal.inviteSuccess", { count: editorsToInvite.length }),
        );
      }

      toast.success(t("collectionForm.createdSuccess"));
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("collectionForm.createError")));
    }
  };

  const editorCount = editors.length;

  return (
    <>
      <div className="flex flex-col gap-5 px-5 pt-5 pb-5">
        <TextField
          label={t("collectionForm.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("collectionForm.namePlaceholder")}
          autoFocus
          autoComplete="off"
          maxLength={255}
        />

        <CollectionPickerTrigger
          label={t("collectionForm.addToCollection")}
          selectedCollectionIds={selectedCollectionIds}
          collections={collections}
          onPress={() => setPickerOpen(true)}
          onClear={() => setSelectedCollectionIds([])}
        />

        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
          label={t("collectionForm.private")}
          helper={
            isPrivate
              ? t("collectionForm.privateHelper")
              : t("collectionForm.publicHelper")
          }
          card
        />

        {!isPrivate ? (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setShowEditors((v) => !v)}
              className="group flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-surface-light/30 px-4 py-3 text-left transition-colors hover:border-neutral-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-text-dim group-hover:text-text">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                </span>
                <span className="text-[15px] font-medium text-text truncate">
                  {t("collectionForm.addEditors")}
                </span>
                {editorCount > 0 ? (
                  <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
                    {editorCount}
                  </span>
                ) : null}
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-text-dim transition-transform"
                style={{
                  transform: showEditors ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {showEditors ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <EditorManager
                      ref={editorManagerRef}
                      editors={editors}
                      onEditorsChange={setEditors}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-neutral-800/70 bg-surface px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <Button
          type="button"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={!isFormValid}
          onClick={handleCreate}
        >
          {t("collectionForm.createCollection")}
        </Button>
      </div>

      <CollectionPickerDialog
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentCollectionIds={selectedCollectionIds}
        onSelectionsChange={handleSelectionsChange}
      />
    </>
  );
}
