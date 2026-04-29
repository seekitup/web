import type { CollectionResponseDto, LinkResponseDto } from "@/types/api";
import { getCollectionUserRole, isCollectionOwner } from "./collectionPermissions";

export type CollectionOwnership =
  | "own"
  | "collaborative"
  | "saved"
  | "pending";
export type LinkOwnership = "own" | "shared";

/**
 * Resolves the current user's relationship to a collection for chip display.
 * Returns null when no chip should render (e.g. anonymous viewer of a public
 * collection that the user has not saved).
 */
export function getCollectionOwnership(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): CollectionOwnership | null {
  if (!collection || !userId) return null;
  if (isCollectionOwner(collection, userId)) return "own";
  if (collection.userRole?.id && !collection.userRole.acceptedAt) {
    return "pending";
  }
  const role = getCollectionUserRole(collection, userId);
  if (role && role !== "owner") return "collaborative";
  if (collection.isSaved) return "saved";
  return null;
}

export function getLinkOwnership(
  link: LinkResponseDto | null | undefined,
  userId: number | undefined,
): LinkOwnership {
  if (!link || !userId) return "shared";
  return link.userId === userId ? "own" : "shared";
}
