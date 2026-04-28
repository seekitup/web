import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInView } from "react-intersection-observer";
import { useCollectionLookup } from "@/hooks/useCollectionLookup";
import { useInvitationLookup } from "@/hooks/useInvitationLookup";
import {
  useCollectionLinks,
  flattenCollectionLinks,
} from "@/hooks/useCollectionLinks";
import { useVisibleLinkTracker } from "@/hooks/useVisibleLinkTracker";
import { useResultsViewMode } from "@/hooks/useResultsViewMode";
import { useAuth } from "@/hooks/useAuth";
import { CollectionLoader } from "@/components/collection/CollectionLoader";
import { CollectionHeroBanner } from "@/components/collection/CollectionHeroBanner";
import { CollectionToolbar } from "@/components/collection/CollectionToolbar";
import { CollectionOptionsModal } from "@/components/collection/CollectionOptionsModal";
import { LinkOptionsModal } from "@/components/collection/LinkOptionsModal";
import { LinkCard } from "@/components/collection/LinkCard";
import { CompactLinkCard } from "@/components/collection/CompactLinkCard";
import { MiniLinkRow } from "@/components/search/MiniLinkRow";
import { MiniCollectionRow } from "@/components/search/MiniCollectionRow";
import { GridCollectionCard } from "@/components/search/GridCollectionCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { InvitationLanding } from "@/components/invite/InvitationLanding";
import { IconButton } from "@/components/ui/IconButton";
import { MoreIcon } from "@/components/ui/icons";
import { SetOutletWidth } from "@/components/layout/OutletWidth";
import { useCreateModal } from "@/components/create/createModalContext";
import { getCollectionShareUrl, shareUrl } from "@/lib/share";
import { getLinkPrimaryMedia } from "@/lib/linkUtils";
import { useNavigate } from "react-router-dom";
import type {
  CollectionLookupResponseDto,
  CollectionResponseDto,
  LinkResponseDto,
  LookupChildCollectionDto,
} from "@/types/api";

/**
 * Bridge a collection-lookup child into the heavier `CollectionResponseDto`
 * shape the option modal expects. We hydrate just enough fields for the
 * permission gates (userId, members, visibility) — the modal only consumes
 * those plus name / counts. Full hydration would require a second fetch.
 */
function adaptChildToCollection(
  child: LookupChildCollectionDto,
  parent: CollectionLookupResponseDto,
): CollectionResponseDto {
  return {
    id: child.id,
    userId: parent.user.id,
    parentCollectionIds: [parent.id],
    name: child.name,
    slug: child.slug,
    ...(child.description !== undefined
      ? { description: child.description }
      : {}),
    visibility: parent.isPublic ? "public" : "private",
    isFeatured: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: parent.user as unknown as CollectionResponseDto["user"],
    members: [],
    links: [],
    totalLinks: child.totalLinks,
    childCollections: [],
  };
}

/**
 * Adapt the lighter lookup DTO into the heavier shape expected by the
 * option modal + permission helpers. The lookup endpoint already gives us
 * everything we need for the parent collection's display + permission gates.
 */
function adaptLookupToCollection(
  lookup: CollectionLookupResponseDto,
): CollectionResponseDto {
  return {
    id: lookup.id,
    userId: lookup.user.id,
    parentCollectionIds: [],
    name: lookup.name,
    slug: lookup.slug,
    ...(lookup.description !== undefined
      ? { description: lookup.description }
      : {}),
    visibility: lookup.isPublic ? "public" : "private",
    isFeatured: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: lookup.user as unknown as CollectionResponseDto["user"],
    members: lookup.members.map((m) => ({
      id: m.id,
      username: m.username,
      roleName: "editor" as const,
      image: m.image
        ? ({
            id: m.image.id,
            url: m.image.url,
          } as unknown as CollectionResponseDto["members"][number]["image"])
        : undefined,
    })) as unknown as CollectionResponseDto["members"],
    links: [],
    totalLinks: lookup.totalLinks,
    childCollections: lookup.childCollections,
  };
}

export function AuthenticatedCollectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { username = "", slug = "" } = useParams<{
    username: string;
    slug: string;
  }>();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [mode, setMode] = useResultsViewMode("complete");
  const [collectionOptionsOpen, setCollectionOptionsOpen] = useState(false);
  const [linkOptionsTarget, setLinkOptionsTarget] =
    useState<LinkResponseDto | null>(null);
  const [childOptionsTarget, setChildOptionsTarget] =
    useState<CollectionResponseDto | null>(null);

  const createModal = useCreateModal();

  // Invitation flow — same as the public page; auth users still see the
  // landing component (and can act on it from there).
  const {
    data: invitation,
    isLoading: invitationLoading,
    isError: invitationError,
  } = useInvitationLookup(inviteToken);
  const showInvitation = !!inviteToken && !invitationError;

  const {
    data: lookup,
    isLoading: lookupLoading,
    isError,
  } = useCollectionLookup(
    showInvitation ? "" : username,
    showInvitation ? "" : slug,
  );

  const collection = useMemo(
    () => (lookup ? adaptLookupToCollection(lookup) : null),
    [lookup],
  );

  // Authenticated collection-scoped link list — the backend honours role.
  const {
    data: linksData,
    isLoading: linksLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCollectionLinks(collection?.id);

  const links = useMemo(
    () => flattenCollectionLinks(linksData?.pages),
    [linksData],
  );

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { visibleLinkId, handleVisibilityChange } = useVisibleLinkTracker();

  const childCollections = useMemo(
    () =>
      (lookup?.childCollections ?? []).map((c) =>
        adaptChildToCollection(c, lookup!),
      ),
    [lookup],
  );

  // Sticky backdrop — once we've seen a hero image we keep showing it across
  // refetches / pagination. Without this, the backdrop briefly disappears
  // when react-query refetches and `linksData` momentarily resolves to
  // undefined again.
  const [backdropMediaUrl, setBackdropMediaUrl] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (links.length === 0) return;
    const url = getLinkPrimaryMedia(links[0]!)?.url;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (url && url !== backdropMediaUrl) setBackdropMediaUrl(url);
  }, [links, backdropMediaUrl]);

  const handleShareCollection = useCallback(async () => {
    if (!collection) return;
    if (collection.visibility === "private") {
      // Forward the share intent to the options modal so the user gets the
      // private→public confirmation dialog (mobile-parity behavior).
      setCollectionOptionsOpen(true);
      return;
    }
    await shareUrl(getCollectionShareUrl(collection), collection.name);
  }, [collection]);

  const handleAddLink = useCallback(() => {
    if (!collection) return;
    createModal.open({
      mode: "creating",
      tab: "link",
      preselectedCollectionId: collection.id,
    });
  }, [collection, createModal]);

  // ── early-return branches mirror the public page ──────────────────

  if (showInvitation) {
    if (invitationLoading) {
      return (
        <div className="mx-auto max-w-xl w-full">
          <CollectionLoader className="min-h-[60vh]" />
        </div>
      );
    }
    if (invitation) {
      const inviterName =
        invitation.inviter.firstName || invitation.inviter.username;
      return (
        <>
          <Helmet>
            <title>
              {t("invitationPage.metaTitle", {
                name: invitation.collection.name,
                inviter: inviterName,
              })}
            </title>
            <meta name="robots" content="noindex" />
          </Helmet>
          <InvitationLanding invitation={invitation} />
        </>
      );
    }
  }

  if (isError) {
    return (
      <>
        <Helmet>
          <title>{t("collectionPage.metaTitleNotFound")}</title>
        </Helmet>
        <ErrorState
          icon={
            <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-500"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          }
          title={t("collectionPage.errorTitle")}
          description={t("collectionPage.errorDescription")}
          ctaText={t("collectionPage.errorCta")}
          ctaTo="/download"
          ctaDisabled
          ctaLabel={t("common.comingSoon")}
        />
      </>
    );
  }

  if (lookupLoading || !collection || !lookup) {
    return (
      <div className="mx-auto max-w-7xl w-full">
        <CollectionLoader className="min-h-[60vh]" />
      </div>
    );
  }

  const ogImage =
    links.length > 0 ? getLinkPrimaryMedia(links[0]!)?.url : undefined;

  // ── render ────────────────────────────────────────────────────────

  return (
    <>
      <SetOutletWidth value="full" />
      <Helmet>
        <title>
          {t("collectionPage.metaTitle", { name: collection.name, username })}
        </title>
        <meta
          name="description"
          content={
            collection.description ||
            t("collectionPage.metaDescriptionFallback", {
              name: collection.name,
            })
          }
        />
        <meta property="og:title" content={collection.name} />
        <meta
          property="og:description"
          content={
            collection.description ||
            t("collectionPage.ogDescriptionFallback", { username })
          }
        />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="w-full">
        <CollectionHeroBanner
          collection={collection}
          currentUserId={userId}
          backdropMediaUrl={backdropMediaUrl}
          totalLinks={collection.totalLinks}
          totalCollections={childCollections.length}
          onShare={handleShareCollection}
          onAddLink={handleAddLink}
          onOpenOptions={() => setCollectionOptionsOpen(true)}
        />

        <CollectionToolbar mode={mode} onModeChange={setMode} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {childCollections.length > 0 ? (
            <section className="mb-8">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-dim mb-3 px-1">
                {t("childCollections.title")}
              </h2>
              <ChildList
                mode={mode}
                children={childCollections}
                onOpenOptions={(c) => setChildOptionsTarget(c)}
                onClick={(c) =>
                  navigate(`/${lookup.user.username}/${c.slug}`)
                }
              />
            </section>
          ) : null}

          <section>
            {linksLoading ? (
              <CollectionLoader className="py-16" />
            ) : links.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-neutral-500 text-sm">
                  {t("collectionPage.emptyLinks")}
                </p>
              </div>
            ) : (
              <LinkList
                mode={mode}
                links={links}
                visibleLinkId={visibleLinkId}
                onVisibilityChange={handleVisibilityChange}
                onOpenOptions={(l) => setLinkOptionsTarget(l)}
              />
            )}

            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="h-8" />
        </div>
      </div>

      <CollectionOptionsModal
        isOpen={collectionOptionsOpen}
        collection={collection}
        onClose={() => setCollectionOptionsOpen(false)}
      />
      <CollectionOptionsModal
        isOpen={!!childOptionsTarget}
        collection={childOptionsTarget}
        parentCollectionId={collection.id}
        onClose={() => setChildOptionsTarget(null)}
      />
      <LinkOptionsModal
        isOpen={!!linkOptionsTarget}
        link={linkOptionsTarget}
        collection={collection}
        context="collection"
        collectionId={collection.id}
        onClose={() => setLinkOptionsTarget(null)}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Mode-specific renderers
// ────────────────────────────────────────────────────────────────────

function ChildList({
  mode,
  children,
  onOpenOptions,
  onClick,
}: {
  mode: "compact" | "grid" | "complete";
  children: CollectionResponseDto[];
  onOpenOptions: (c: CollectionResponseDto) => void;
  onClick: (c: CollectionResponseDto) => void;
}) {
  const { t } = useTranslation();
  const renderKebab = (target: CollectionResponseDto) => (
    <IconButton
      variant="glass"
      size={32}
      aria-label={t("collectionHero.openOptions")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenOptions(target);
      }}
    >
      <MoreIcon size={14} />
    </IconButton>
  );

  if (mode === "compact") {
    return (
      <ul className="flex flex-col">
        {children.map((c) => (
          <li key={c.id}>
            <MiniCollectionRow
              collection={c}
              onClick={onClick}
              actionSlot={renderKebab(c)}
            />
          </li>
        ))}
      </ul>
    );
  }
  // grid + complete both render in a grid for collections (matches mobile)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {children.map((c, i) => (
        <GridCollectionCard
          key={c.id}
          collection={c}
          index={i}
          onClick={onClick}
          actionSlot={renderKebab(c)}
        />
      ))}
    </div>
  );
}

function LinkList({
  mode,
  links,
  visibleLinkId,
  onVisibilityChange,
  onOpenOptions,
}: {
  mode: "compact" | "grid" | "complete";
  links: LinkResponseDto[];
  visibleLinkId: number | null;
  onVisibilityChange: (id: number, inView: boolean) => void;
  onOpenOptions: (link: LinkResponseDto) => void;
}) {
  const { t } = useTranslation();
  const renderKebab = (link: LinkResponseDto) => (
    <IconButton
      variant="glass"
      size={32}
      aria-label={t("collectionHero.openOptions")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenOptions(link);
      }}
    >
      <MoreIcon size={14} />
    </IconButton>
  );

  if (mode === "compact") {
    return (
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.id}>
            <MiniLinkRow
              link={link}
              onClick={() => window.open(link.url, "_blank", "noopener")}
              actionSlot={renderKebab(link)}
            />
          </li>
        ))}
      </ul>
    );
  }
  if (mode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <CompactLinkCard
            key={link.id}
            link={link}
            index={i}
            actionSlot={renderKebab(link)}
          />
        ))}
      </div>
    );
  }
  // complete
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {links.map((link, i) => (
        <LinkCard
          key={link.id}
          link={link}
          index={i}
          isVisible={link.id === visibleLinkId}
          onVisibilityChange={onVisibilityChange}
          actionSlot={renderKebab(link)}
        />
      ))}
    </div>
  );
}
