import type { CollectionResponseDto, LinkResponseDto } from "@/types/api";
import { getCollectionUserRole, isCollectionOwner } from "./collectionPermissions";

export type CollectionOwnership = "own" | "collaborative" | "saved";
export type LinkOwnership = "own" | "shared";

export function getCollectionOwnership(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): CollectionOwnership {
  if (!collection || !userId) return "saved";
  if (isCollectionOwner(collection, userId)) return "own";
  const role = getCollectionUserRole(collection, userId);
  if (role === "editor") return "collaborative";
  return "saved";
}

export function getLinkOwnership(
  link: LinkResponseDto | null | undefined,
  userId: number | undefined,
): LinkOwnership {
  if (!link || !userId) return "shared";
  return link.userId === userId ? "own" : "shared";
}
