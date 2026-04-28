/**
 * Link-specific permission utilities.
 *
 * Mirrors `seekitup-app/app/utils/linkPermissions.ts` exactly. The web
 * `LinkResponseDto` carries an embedded `user` (creator) and a `collections`
 * array of `LinkCollectionDto` records — both shapes line up with what the
 * mobile gates expect.
 */

import type {
  CollectionResponseDto,
  LinkResponseDto,
} from "@/types/api";

import type { OwnerLike } from "./collectionPermissions";
import { getCollectionUserRole } from "./collectionPermissions";

export function isLinkCreator(
  link: LinkResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!link || !userId) return false;
  return link.userId === userId;
}

export function getLinkCreator(
  link: LinkResponseDto | null | undefined,
): OwnerLike | null {
  if (!link?.user) return null;
  const u = link.user;
  return {
    id: u.id,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    image: null,
  };
}

/**
 * Edit if the user is the link creator OR has owner-level rights in the
 * containing collection. (Editor-level rights for non-creators are intentionally
 * left out — see the matching TODO in mobile.)
 */
export function canEditLink(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!link || !userId) return false;

  if (isLinkCreator(link, userId)) {
    return true;
  }

  if (collection && link.collections?.some((c) => c.id === collection.id)) {
    const role = getCollectionUserRole(collection, userId);
    return role === "owner";
  }

  return false;
}

export function canDeleteLink(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return canEditLink(link, collection, userId);
}

export function canSelectLink(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return canEditLink(link, collection, userId);
}

export function canChangeLinkVisibility(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return canEditLink(link, collection, userId);
}

export function canRenameLink(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return canEditLink(link, collection, userId);
}

export function canMoveLink(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return canEditLink(link, collection, userId);
}

/**
 * Link creator OR collection owner OR collection editor can remove a link
 * from a collection.
 */
export function canRemoveLinkFromCollection(
  link: LinkResponseDto | null | undefined,
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!link || !collection || !userId) return false;
  if (isLinkCreator(link, userId)) return true;
  const role = getCollectionUserRole(collection, userId);
  return role === "owner" || role === "editor";
}

export function isSharedLink(
  link: LinkResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!link || !userId) return false;
  return !isLinkCreator(link, userId);
}
