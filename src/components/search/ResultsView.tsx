import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type {
  CollectionResponseDto,
  LinkResponseDto,
} from "@/types/api";
import { CompactLinkCard } from "@/components/collection/CompactLinkCard";
import { LinkCard } from "@/components/collection/LinkCard";
import { useVisibleLinkTracker } from "@/hooks/useVisibleLinkTracker";
import { GhostAddCard } from "@/components/ui/GhostAddCard";
import { GridCollectionCard } from "./GridCollectionCard";
import { MiniCollectionRow } from "./MiniCollectionRow";
import { MiniLinkRow } from "./MiniLinkRow";
import {
  ALL_RESULTS_VIEW_MODES,
  persistResultsViewMode,
  readPersistedResultsViewMode,
  type ResultsViewMode,
} from "./resultsViewMode";

export type { ResultsViewMode } from "./resultsViewMode";

export interface ResultsViewSection {
  /** Stable key — typically "links" / "collections". */
  key: string;
  /** Displayed header label, already pluralized/counted by caller. */
  title: string;
  type: "links" | "collections";
  items: LinkResponseDto[] | CollectionResponseDto[];
}

export interface ResultsViewAddCard {
  label: string;
  caption?: string;
  onClick: () => void;
}

export interface ResultsViewProps {
  sections: ResultsViewSection[];
  highlightQuery?: string;
  defaultMode?: ResultsViewMode;
  mode?: ResultsViewMode;
  onModeChange?: (mode: ResultsViewMode) => void;
  availableModes?: ResultsViewMode[];
  hideToggle?: boolean;
  toolbar?: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  skeleton?: ReactNode;
  onLinkClick?: (link: LinkResponseDto) => void;
  onCollectionClick?: (collection: CollectionResponseDto) => void;
  /**
   * Per-section ghost add-card. Rendered as the LAST item of the matching
   * section (in compact/grid/complete modes), shape derived from the active
   * mode + section type. When the section is empty the ghost is not shown —
   * callers are expected to render their own empty state instead.
   */
  addCard?: Record<string, ResultsViewAddCard>;
  /** Hide section header (title bar). Useful when a single section is the page. */
  hideSectionHeaders?: boolean;
  className?: string;
}

const ALL_MODES: ResultsViewMode[] = [...ALL_RESULTS_VIEW_MODES];

/**
 * Standalone view-mode toggle that consumers can render next to other toolbar
 * elements (e.g., filter chips). Pair with `<ResultsView hideToggle mode … />`.
 */
export function ResultsViewModeToggle({
  mode,
  onChange,
  availableModes = ALL_MODES,
  className,
}: {
  mode: ResultsViewMode;
  onChange: (mode: ResultsViewMode) => void;
  availableModes?: ResultsViewMode[];
  className?: string;
}) {
  const { t } = useTranslation();
  const visibleModes = ALL_MODES.filter((m) => availableModes.includes(m));
  if (visibleModes.length <= 1) return null;
  return (
    <ModeToggle
      modes={visibleModes}
      active={mode}
      onChange={onChange}
      labels={{
        compact: t("searchScreen.viewCompact"),
        grid: t("searchScreen.viewGrid"),
        complete: t("searchScreen.viewComplete"),
      }}
      className={className}
    />
  );
}

/**
 * Strategic, reusable shell that renders mixed link/collection result sections
 * in one of three densities (Compact / Grid / Complete). Owns the toggle UI
 * and persists the user's preferred density to localStorage.
 *
 * Designed so future "list of mixed entities" pages (Home, My Links, etc.)
 * can drop it in with their own sections array and skeleton.
 */
export function ResultsView({
  sections,
  highlightQuery,
  defaultMode = "compact",
  mode: controlledMode,
  onModeChange,
  availableModes = ALL_MODES,
  hideToggle = false,
  toolbar,
  emptyState,
  loading = false,
  skeleton,
  onLinkClick,
  onCollectionClick,
  addCard,
  hideSectionHeaders = false,
  className,
}: ResultsViewProps) {
  const { t } = useTranslation();

  const [uncontrolledMode, setUncontrolledMode] = useState<ResultsViewMode>(
    () => readPersistedResultsViewMode() ?? defaultMode,
  );
  const isControlled = controlledMode !== undefined;
  const activeMode = isControlled ? controlledMode! : uncontrolledMode;

  useEffect(() => {
    if (!isControlled) persistResultsViewMode(uncontrolledMode);
  }, [uncontrolledMode, isControlled]);

  const handleModeChange = useCallback(
    (next: ResultsViewMode) => {
      if (!isControlled) setUncontrolledMode(next);
      onModeChange?.(next);
    },
    [isControlled, onModeChange],
  );

  const visibleModes = useMemo(
    () => ALL_MODES.filter((m) => availableModes.includes(m)),
    [availableModes],
  );

  // Visibility tracker for Complete mode (powers LinkCard's video/iframe autoplay).
  const { visibleLinkId, handleVisibilityChange } = useVisibleLinkTracker();

  // If Complete is selected but every section is collections, downgrade to grid.
  const effectiveMode: ResultsViewMode = useMemo(() => {
    if (activeMode !== "complete") return activeMode;
    const hasLinks = sections.some(
      (s) => s.type === "links" && s.items.length > 0,
    );
    return hasLinks ? "complete" : "grid";
  }, [activeMode, sections]);

  const isEmpty = sections.every((s) => s.items.length === 0);

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {!hideToggle && visibleModes.length > 1 ? (
        <div className="flex justify-end">
          <ModeToggle
            modes={visibleModes}
            active={activeMode}
            onChange={handleModeChange}
            labels={{
              compact: t("searchScreen.viewCompact"),
              grid: t("searchScreen.viewGrid"),
              complete: t("searchScreen.viewComplete"),
            }}
          />
        </div>
      ) : null}

      {toolbar}

      {loading ? (
        skeleton
      ) : isEmpty ? (
        emptyState
      ) : (
        <div className="flex flex-col gap-8">
          {sections
            .filter((s) => s.items.length > 0)
            .map((section) => (
              <section key={section.key}>
                {!hideSectionHeaders && section.title ? (
                  <header className="mb-3 flex items-baseline gap-2 px-2">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-dim">
                      {section.title}
                    </h2>
                  </header>
                ) : null}

                {section.type === "links" ? (
                  <LinkSectionBody
                    items={section.items as LinkResponseDto[]}
                    mode={effectiveMode}
                    highlightQuery={highlightQuery}
                    onLinkClick={onLinkClick}
                    visibleLinkId={visibleLinkId}
                    onVisibilityChange={handleVisibilityChange}
                    addCard={addCard?.[section.key]}
                  />
                ) : (
                  <CollectionSectionBody
                    items={section.items as CollectionResponseDto[]}
                    mode={effectiveMode}
                    highlightQuery={highlightQuery}
                    onCollectionClick={onCollectionClick}
                    addCard={addCard?.[section.key]}
                  />
                )}
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

// ---------- internals ----------

interface ModeToggleProps {
  modes: ResultsViewMode[];
  active: ResultsViewMode;
  onChange: (mode: ResultsViewMode) => void;
  labels: Record<ResultsViewMode, string>;
  className?: string | undefined;
}

/**
 * Pill-style toggle. Visual parity with the CollectionPage `<ViewToggle>`:
 * outer rounded-full border, the active segment paints a primary-colored pill
 * that visually replaces the section of the outer ring it covers.
 */
function ModeToggle({
  modes,
  active,
  onChange,
  labels,
  className,
}: ModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className={clsx(
        "flex border border-[#414141] rounded-full overflow-hidden",
        className,
      )}
    >
      {modes.map((m) => {
        const isActive = m === active;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(m)}
            className={clsx(
              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border transition-all duration-200 cursor-pointer outline-none",
              "focus-visible:ring-2 focus-visible:ring-primary/30",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-[#6E6E6E] hover:text-text",
            )}
          >
            <ModeIcon mode={m} active={isActive} />
            <span className="text-sm font-medium">{labels[m]}</span>
          </button>
        );
      })}
    </div>
  );
}

function ModeIcon({
  mode,
  active,
}: {
  mode: ResultsViewMode;
  active: boolean;
}) {
  const stroke = active ? "currentColor" : "currentColor";
  const props = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (mode === "compact") {
    return (
      <svg {...props} aria-hidden>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  if (mode === "grid") {
    return (
      <svg {...props} aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  return (
    <svg {...props} aria-hidden>
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
    </svg>
  );
}

interface LinkSectionBodyProps {
  items: LinkResponseDto[];
  mode: ResultsViewMode;
  highlightQuery: string | undefined;
  onLinkClick: ((link: LinkResponseDto) => void) | undefined;
  visibleLinkId: number | null;
  onVisibilityChange: (id: number, inView: boolean) => void;
  addCard: ResultsViewAddCard | undefined;
}

function LinkSectionBody({
  items,
  mode,
  highlightQuery,
  onLinkClick,
  visibleLinkId,
  onVisibilityChange,
  addCard,
}: LinkSectionBodyProps) {
  if (mode === "compact") {
    return (
      <ul className="flex flex-col px-1">
        {addCard ? (
          <li className="mb-1">
            <GhostAddCard
              variant="row"
              type="link"
              label={addCard.label}
              caption={addCard.caption}
              onClick={addCard.onClick}
            />
          </li>
        ) : null}
        {items.map((link) => (
          <li key={link.id}>
            <MiniLinkRow
              link={link}
              onClick={(l) => onLinkClick?.(l)}
              highlightQuery={highlightQuery}
            />
          </li>
        ))}
      </ul>
    );
  }
  if (mode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {addCard ? (
          <GhostAddCard
            variant="grid"
            type="link"
            label={addCard.label}
            caption={addCard.caption}
            onClick={addCard.onClick}
          />
        ) : null}
        {items.map((link, i) => (
          <CompactLinkCardWrapper
            key={link.id}
            link={link}
            index={i}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>
    );
  }
  // complete
  return (
    <div className="space-y-4">
      {addCard ? (
        <GhostAddCard
          variant="complete"
          type="link"
          label={addCard.label}
          caption={addCard.caption}
          onClick={addCard.onClick}
        />
      ) : null}
      {items.map((link, i) => (
        <LinkCardWrapper
          key={link.id}
          link={link}
          index={i}
          isVisible={link.id === visibleLinkId}
          onVisibilityChange={onVisibilityChange}
          onLinkClick={onLinkClick}
        />
      ))}
    </div>
  );
}

interface CollectionSectionBodyProps {
  items: CollectionResponseDto[];
  mode: ResultsViewMode;
  highlightQuery: string | undefined;
  onCollectionClick:
    | ((collection: CollectionResponseDto) => void)
    | undefined;
  addCard: ResultsViewAddCard | undefined;
}

function CollectionSectionBody({
  items,
  mode,
  highlightQuery,
  onCollectionClick,
  addCard,
}: CollectionSectionBodyProps) {
  if (mode === "compact") {
    return (
      <ul className="flex flex-col px-1">
        {addCard ? (
          <li className="mb-1">
            <GhostAddCard
              variant="row"
              type="collection"
              label={addCard.label}
              caption={addCard.caption}
              onClick={addCard.onClick}
            />
          </li>
        ) : null}
        {items.map((collection) => (
          <li key={collection.id}>
            <MiniCollectionRow
              collection={collection}
              onClick={(c) => onCollectionClick?.(c)}
              highlightQuery={highlightQuery}
            />
          </li>
        ))}
      </ul>
    );
  }
  // grid (also used as fallback for complete)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {addCard ? (
        <GhostAddCard
          variant="grid"
          type="collection"
          label={addCard.label}
          caption={addCard.caption}
          onClick={addCard.onClick}
        />
      ) : null}
      {items.map((collection, i) => (
        <GridCollectionCard
          key={collection.id}
          collection={collection}
          index={i}
          onClick={(c) => onCollectionClick?.(c)}
          highlightQuery={highlightQuery}
        />
      ))}
    </div>
  );
}

/**
 * CompactLinkCard is an `<a target="_blank">`. We delegate to it directly when
 * no custom click handler is provided; otherwise we wrap it so we can intercept
 * the click and call the consumer's callback (e.g., to record a recent search).
 */
function CompactLinkCardWrapper({
  link,
  index,
  onLinkClick,
}: {
  link: LinkResponseDto;
  index: number;
  onLinkClick: ((link: LinkResponseDto) => void) | undefined;
}) {
  if (!onLinkClick) {
    return <CompactLinkCard link={link} index={index} />;
  }
  return (
    <div
      onClickCapture={(e) => {
        // Allow modifier-clicks (open in new tab) to behave naturally;
        // intercept only the plain click to invoke our callback.
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          (e as unknown as MouseEvent).button === 1
        ) {
          return;
        }
        onLinkClick(link);
      }}
    >
      <CompactLinkCard link={link} index={index} />
    </div>
  );
}

function LinkCardWrapper({
  link,
  index,
  isVisible,
  onVisibilityChange,
  onLinkClick,
}: {
  link: LinkResponseDto;
  index: number;
  isVisible: boolean;
  onVisibilityChange: (id: number, inView: boolean) => void;
  onLinkClick: ((link: LinkResponseDto) => void) | undefined;
}) {
  const card = (
    <LinkCard
      link={link}
      index={index}
      isVisible={isVisible}
      onVisibilityChange={onVisibilityChange}
    />
  );
  if (!onLinkClick) return card;
  return (
    <div
      onClickCapture={(e) => {
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          (e as unknown as MouseEvent).button === 1
        ) {
          return;
        }
        onLinkClick(link);
      }}
    >
      {card}
    </div>
  );
}
