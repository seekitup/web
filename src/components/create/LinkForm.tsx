import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Switch } from "@/components/ui/Switch";
import { Spinner } from "@/components/ui/Spinner";
import { useCollections } from "@/hooks/useCollections";
import { useCreateLink } from "@/hooks/useCreateLink";
import { useExtractMetadata } from "@/hooks/useExtractMetadata";
import { formatUrl, isValidUrl } from "@/lib/formatUrl";
import { getApiErrorMessage } from "@/lib/apiError";
import { canAddContent } from "@/lib/collectionPermissions";
import { useAuth } from "@/hooks/useAuth";
import {
  getLastUsedCollectionId,
  setLastUsedCollectionId,
} from "@/lib/lastUsedCollection";
import type { MetadataResponseDto } from "@/types/api";
import { CollectionPickerDialog } from "./CollectionPickerDialog";
import { CollectionPickerTrigger } from "./CollectionPickerTrigger";

interface LinkFormProps {
  onSuccess: () => void;
  sharedUrl?: string | null;
  preselectedCollectionId?: number | null;
}

export function LinkForm({
  onSuccess,
  sharedUrl,
  preselectedCollectionId,
}: LinkFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    [],
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<MetadataResponseDto | null>(null);

  const userTouchedTitleRef = useRef(false);
  const lastFetchedUrlRef = useRef<string | null>(null);

  const { data: collections = [] } = useCollections({
    filter: "all",
    limit: 100,
  });
  const createLink = useCreateLink();
  const extractMetadata = useExtractMetadata();

  const doExtract = useCallback(
    async (rawUrl: string) => {
      const formatted = formatUrl(rawUrl);
      if (!isValidUrl(formatted)) return;
      if (lastFetchedUrlRef.current === formatted) return;
      lastFetchedUrlRef.current = formatted;
      try {
        const meta = await extractMetadata.mutateAsync(formatted);
        setMetadata(meta);
        if (!userTouchedTitleRef.current) {
          const candidate = meta.ogTitle ?? meta.title ?? "";
          if (candidate) setTitle(candidate);
        }
      } catch {
        // Server scrapes as a fallback on POST /links — silent failure is fine.
      }
    },
    [extractMetadata],
  );

  // Initialize collection: explicit preselect → shared URL → last-used (validated)
  useEffect(() => {
    if (preselectedCollectionId != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCollectionIds([preselectedCollectionId]);
      return;
    }
    if (collections.length === 0) return;
    const last = getLastUsedCollectionId();
    if (last == null) return;
    const match = collections.find((c) => c.id === last);
    if (match && canAddContent(match, user?.id)) {
      setSelectedCollectionIds((prev) => (prev.length === 0 ? [last] : prev));
    }
  }, [preselectedCollectionId, collections, user?.id]);

  // If a sharedUrl was provided, prefill and immediately try to extract metadata
  useEffect(() => {
    if (!sharedUrl) return;
    const formatted = formatUrl(sharedUrl);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(formatted);
    if (isValidUrl(formatted)) {
      void doExtract(formatted);
    }
  }, [sharedUrl, doExtract]);

  const handleUrlBlur = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError(undefined);
      return;
    }
    const formatted = formatUrl(trimmed);
    if (formatted !== url) setUrl(formatted);
    if (!isValidUrl(formatted)) {
      setUrlError(t("linkForm.invalidUrl"));
      return;
    }
    setUrlError(undefined);
    await doExtract(formatted);
  };

  const handlePaste = async () => {
    if (!navigator.clipboard?.readText) {
      toast.error(t("linkForm.clipboardError"));
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) return;
      const formatted = formatUrl(trimmed);
      setUrl(formatted);
      if (isValidUrl(formatted)) {
        setUrlError(undefined);
        await doExtract(formatted);
      } else {
        setUrlError(t("linkForm.invalidUrl"));
      }
    } catch {
      toast.error(t("linkForm.clipboardError"));
    }
  };

  const handleSelectionsChange = (added: number[], removed: number[]) => {
    setSelectedCollectionIds((prev) => [
      ...prev.filter((id) => !removed.includes(id)),
      ...added,
    ]);
  };

  const isFormValid = url.trim().length > 0 && isValidUrl(formatUrl(url));
  const isLoading = createLink.isPending;

  const handleSubmit = async () => {
    const formatted = formatUrl(url);
    if (!isValidUrl(formatted)) {
      setUrlError(t("linkForm.invalidUrl"));
      return;
    }
    try {
      await createLink.mutateAsync({
        url: formatted,
        ...(title.trim() ? { title: title.trim() } : {}),
        visibility: isPrivate ? "private" : "public",
        ...(selectedCollectionIds.length > 0
          ? { collectionIds: selectedCollectionIds }
          : {}),
        ...(metadata?.ogTitle ? { ogTitle: metadata.ogTitle } : {}),
        ...(metadata?.ogDescription
          ? { ogDescription: metadata.ogDescription }
          : {}),
        ...(metadata?.ogSiteName ? { ogSiteName: metadata.ogSiteName } : {}),
        ...(metadata?.ogType ? { ogType: metadata.ogType } : {}),
      });
      if (selectedCollectionIds.length > 0) {
        setLastUsedCollectionId(selectedCollectionIds[0] ?? null);
      }
      toast.success(t("linkForm.linkAdded"));
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("linkForm.addError")));
    }
  };

  const isExtracting = extractMetadata.isPending;
  const previewImage =
    metadata?.ogImages?.[0]?.url ?? metadata?.twitterImage ?? null;

  return (
    <>
      <div className="flex flex-col gap-5 px-5 pt-5 pb-5">
        <TextField
          label={t("linkForm.urlLabel")}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlError) setUrlError(undefined);
          }}
          onBlur={handleUrlBlur}
          onFocus={() => setUrlError(undefined)}
          placeholder={t("linkForm.urlPlaceholder")}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          error={urlError}
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
              <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
            </svg>
          }
          rightAccessory={
            isExtracting ? (
              <Spinner size={16} />
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                aria-label={t("linkForm.paste")}
                className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-semibold uppercase tracking-wide text-text-dim hover:bg-white/[0.05] hover:text-text transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <span>{t("linkForm.paste")}</span>
              </button>
            )
          }
        />

        {previewImage || metadata?.favicon || metadata?.ogTitle ? (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-surface-light/30 p-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-800">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              ) : metadata?.favicon ? (
                <img
                  src={metadata.favicon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-dim"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-text">
                {metadata?.ogTitle ?? metadata?.title ?? title ?? ""}
              </p>
              {metadata?.ogSiteName || metadata?.ogDescription ? (
                <p className="truncate text-[12px] text-text-dim">
                  {metadata?.ogSiteName ?? metadata?.ogDescription}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="link-title"
            className="text-sm font-medium text-text-dim"
          >
            {t("linkForm.titleLabel")}
          </label>
          <TextField
            id="link-title"
            value={title}
            onChange={(e) => {
              userTouchedTitleRef.current = true;
              setTitle(e.target.value);
            }}
            placeholder={t("linkForm.titlePlaceholder")}
            maxLength={500}
          />
        </div>

        <CollectionPickerTrigger
          label={t("linkForm.addToCollection")}
          selectedCollectionIds={selectedCollectionIds}
          collections={collections}
          onPress={() => setPickerOpen(true)}
          onClear={() => setSelectedCollectionIds([])}
        />

        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
          label={t("linkForm.private")}
          card
        />
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-neutral-800/70 bg-surface px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <Button
          type="button"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={!isFormValid}
          onClick={handleSubmit}
        >
          {t("linkForm.addLink")}
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
