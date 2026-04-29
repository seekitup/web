import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { useCollectionLookup } from "@/hooks/useCollectionLookup";
import { useInvitationLookup } from "@/hooks/useInvitationLookup";
import {
  useCollectionLinks,
  flattenCollectionLinks,
} from "@/hooks/useCollectionLinks";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useResultsViewMode } from "@/hooks/useResultsViewMode";
import { useAuth } from "@/hooks/useAuth";
import { useAcceptInvitation } from "@/hooks/useAcceptInvitation";
import { CollectionLoader } from "@/components/collection/CollectionLoader";
import { CollectionHeroBanner } from "@/components/collection/CollectionHeroBanner";
import { CollectionToolbar } from "@/components/collection/CollectionToolbar";
import { CollectionOptionsModal } from "@/components/collection/CollectionOptionsModal";
import { LinkOptionsModal } from "@/components/collection/LinkOptionsModal";
import { EntityActionKebab } from "@/components/collection/EntityActionKebab";
import { PendingInvitationBanner } from "@/components/collection/PendingInvitationBanner";
import { SaveCollectionBanner } from "@/components/collection/SaveCollectionBanner";
import { ResultsView } from "@/components/search/ResultsView";
import { ErrorState } from "@/components/ui/ErrorState";
import { InvitationLanding } from "@/components/invite/InvitationLanding";
import { SetOutletWidth } from "@/components/layout/OutletWidth";
import { useCreateModal } from "@/components/create/createModalContext";
import { getCollectionShareUrl, shareUrl } from "@/lib/share";
import { getApiErrorMessage } from "@/lib/apiError";
import { getLinkPrimaryMedia } from "@/lib/linkUtils";
import type {
  CollectionLookupResponseDto,
  CollectionResponseDto,
  CollectionRoleUserDto,
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
    // Cast preview links into the heavy DTO shape — `fromCollectionResponse`
    // (used by the shared subcollection cards inside ResultsView) reads only
    // a subset of fields that LookupPreviewLinkDto already covers, so the
    // structural overlap is sufficient for previews to render.
    links: child.previewLinks as unknown as CollectionResponseDto["links"],
    totalLinks: child.totalLinks,
    childCollections: [],
    isSaved: false,
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
      id: 0,
      userId: m.id,
      roleId: 0,
      role: { id: 0, name: "editor" as const, displayName: "Editor" },
      user: {
        id: m.id,
        username: m.username,
        image: m.image ? { id: m.image.id, url: m.image.url } : undefined,
      },
      createdAt: new Date().toISOString(),
    })) as unknown as CollectionResponseDto["members"],
    isSaved: false,
    links: [],
    totalLinks: lookup.totalLinks,
    childCollections: lookup.childCollections,
    ...(lookup.userRole
      ? {
          userRole: {
            id: lookup.userRole.id,
            userId: lookup.user.id,
            roleId: lookup.userRole.roleId,
            role: lookup.userRole.role,
            user: lookup.user as unknown as CollectionResponseDto["user"],
            acceptedAt: lookup.userRole.acceptedAt ?? null,
            createdAt: lookup.userRole.createdAt,
          } as unknown as CollectionRoleUserDto,
        }
      : {}),
  };
}

export function AuthenticatedCollectionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const { username = "", slug = "" } = useParams<{
    username: string;
    slug: string;
  }>();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const navigate = useNavigate();

  const [mode, setMode] = useResultsViewMode("complete");
  const [collectionOptionsOpen, setCollectionOptionsOpen] = useState(false);
  const [linkOptionsTarget, setLinkOptionsTarget] =
    useState<LinkResponseDto | null>(null);
  const [childOptionsTarget, setChildOptionsTarget] =
    useState<CollectionResponseDto | null>(null);
  // Local flag so the banner disappears immediately on accept, even before the
  // refetched lookup arrives with `userRole.acceptedAt` populated.
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  const createModal = useCreateModal();
  const acceptInvitation = useAcceptInvitation();

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

  // Membership decides whether to hit the auth endpoint (sees private links the
  // user has access to) or the public endpoint (returns the canonical public set).
  // We can't rely on the auth endpoint alone: for non-member viewers of a public
  // collection it returns nothing, leaving the page blank even though the public
  // page would render the same links fine.
  const isOwnerOrMember = useMemo(() => {
    if (!lookup || !userId) return false;
    if (lookup.user.id === userId) return true;
    return lookup.members.some((m) => m.id === userId);
  }, [lookup, userId]);

  const authLinksQuery = useCollectionLinks(
    isOwnerOrMember ? collection?.id : undefined,
  );
  const publicLinksQuery = usePublicLinks(
    isOwnerOrMember ? undefined : collection?.id,
  );
  const linksQuery = isOwnerOrMember ? authLinksQuery : publicLinksQuery;
  const {
    data: linksData,
    isLoading: linksLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = linksQuery;

  const links = useMemo(
    () => flattenCollectionLinks(linksData?.pages),
    [linksData],
  );

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const childCollections = useMemo(
    () =>
      (lookup?.childCollections ?? []).map((child) =>
        adaptChildToCollection(child, lookup!),
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

  // Pending-invitation banner — mirrors the mobile CollectionScreen flow.
  // The viewer sees the banner when their RoleUser exists but acceptedAt is
  // still null. Owners never see it.
  const isPendingInvitation = useMemo(() => {
    if (!lookup || !userId || invitationAccepted) return false;
    if (lookup.user.id === userId) return false;
    return !!lookup.userRole?.id && !lookup.userRole.acceptedAt;
  }, [lookup, userId, invitationAccepted]);

  // Save banner — visible to authenticated viewers of a public collection who
  // have no membership at all (mirrors the mobile `shouldShowSaveButton`).
  // Mutually exclusive with `isPendingInvitation` because that branch implies
  // a `userRole` row exists.
  const shouldShowSaveBanner = useMemo(() => {
    if (!lookup || !userId) return false;
    if (!lookup.isPublic) return false;
    if (lookup.user.id === userId) return false;
    if (lookup.userRole) return false;
    return true;
  }, [lookup, userId]);

  const ownerForBanner = useMemo(() => {
    if (!lookup) return null;
    return {
      id: lookup.user.id,
      username: lookup.user.username,
      firstName: lookup.user.firstName,
      lastName: lookup.user.lastName,
      image: lookup.user.image
        ? { id: lookup.user.image.id, url: lookup.user.image.url }
        : null,
    };
  }, [lookup]);

  const handleAcceptInvitation = useCallback(async () => {
    if (!collection) return;
    try {
      await acceptInvitation.mutateAsync(collection.id);
      setInvitationAccepted(true);
      toast.success(t("collectionOptions.acceptSuccess"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("collectionOptions.acceptError")));
    }
  }, [collection, acceptInvitation, t]);

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

        <CollectionToolbar
          mode={mode}
          onModeChange={setMode}
          collectionName={collection.name}
        />

        {isPendingInvitation && ownerForBanner ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
            <PendingInvitationBanner
              owner={ownerForBanner}
              onAccept={handleAcceptInvitation}
              isAccepting={acceptInvitation.isPending}
            />
          </div>
        ) : shouldShowSaveBanner ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
            <SaveCollectionBanner collectionId={collection.id} />
          </div>
        ) : null}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <ResultsView
            mode={mode}
            onModeChange={setMode}
            hideToggle
            sections={[
              ...(childCollections.length > 0
                ? [
                    {
                      key: "collections",
                      type: "collections" as const,
                      title: t("childCollections.title"),
                      items: childCollections,
                    },
                  ]
                : []),
              ...(links.length > 0
                ? [
                    {
                      key: "links",
                      type: "links" as const,
                      title: "",
                      items: links,
                    },
                  ]
                : []),
            ]}
            onLinkClick={(link) =>
              window.open(link.url, "_blank", "noopener")
            }
            onCollectionClick={(c) =>
              navigate(`/${c.user.username}/${c.slug}`)
            }
            renderLinkActions={(link) => (
              <EntityActionKebab
                ariaLabel={t("collectionHero.openOptions")}
                onOpen={() => setLinkOptionsTarget(link)}
              />
            )}
            renderCollectionActions={(c) => (
              <EntityActionKebab
                ariaLabel={t("collectionHero.openOptions")}
                onOpen={() => setChildOptionsTarget(c)}
              />
            )}
            loading={linksLoading}
            skeleton={<CollectionLoader className="py-16" />}
            emptyState={
              <div className="px-4 py-16 text-center">
                <p className="text-neutral-500 text-sm">
                  {t("collectionPage.emptyLinks")}
                </p>
              </div>
            }
          />

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

