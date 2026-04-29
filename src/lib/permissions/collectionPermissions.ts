/**
 * Collection-specific permission utilities.
 *
 * Mirrors `seekitup-app/app/utils/collectionPermissions.ts`. Members and
 * `userRole` follow the API shape: `CollectionRoleUserDto.id` is the
 * role_user row id, `.userId` is the user id, `.role.name` carries the role,
 * and `.acceptedAt` is null/undefined for pending invitations.
 */

import type {
  CollectionResponseDto,
  CollectionRoleUserDto,
} from "@/types/api";

import type { EntityRole } from "./permissions";

/**
 * Minimal user shape we can guarantee from any owner source — covers what
 * Avatar / display-name helpers actually consume.
 */
export interface OwnerLike {
  id: number;
  username: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  image?: { id: number; url: string } | null | undefined;
}

export function isCollectionOwner(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!collection || !userId) return false;

  if (collection.userId === userId) {
    return true;
  }

  const ownerMember = collection.members?.find(
    (m: CollectionRoleUserDto) => m.role?.name === "owner",
  );
  if (ownerMember?.userId === userId) {
    return true;
  }

  return false;
}

export function getCollectionOwner(
  collection: CollectionResponseDto | null | undefined,
): OwnerLike | null {
  if (!collection) return null;

  if (collection.user) {
    const u = collection.user;
    return {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      image: u.image
        ? { id: u.image.id, url: u.image.url }
        : null,
    };
  }

  const ownerMember = collection.members?.find(
    (m) => m.role?.name === "owner",
  );
  if (ownerMember?.user) {
    const u = ownerMember.user;
    return {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      image: u.image
        ? { id: u.image.id, url: u.image.url }
        : null,
    };
  }

  return null;
}

export function getCollectionUserRole(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): EntityRole | null {
  if (!collection || !userId) return null;

  if (collection.userId === userId) {
    return "owner";
  }

  if (collection.userRole?.role?.name) {
    return collection.userRole.role.name as EntityRole;
  }

  const memberEntry = collection.members?.find((m) => m.userId === userId);
  if (memberEntry?.role?.name) {
    return memberEntry.role.name as EntityRole;
  }

  return null;
}

/**
 * Only owners of public collections can manage members.
 * Private collections cannot have collaborators.
 */
export function canManageMembers(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!collection || !userId) return false;
  if (collection.visibility === "private") return false;
  return isCollectionOwner(collection, userId);
}

export function canChangeVisibility(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return isCollectionOwner(collection, userId);
}

export function canDeleteCollection(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return isCollectionOwner(collection, userId);
}

/**
 * Non-owners with an editor role can leave; owners cannot leave their own
 * collection.
 */
export function canLeaveCollection(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!collection || !userId) return false;
  if (isCollectionOwner(collection, userId)) return false;
  const role = getCollectionUserRole(collection, userId);
  return role === "editor";
}

export function canRenameCollection(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return isCollectionOwner(collection, userId);
}

export function canManageParents(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  return isCollectionOwner(collection, userId);
}

export function canShareCollection(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  const role = getCollectionUserRole(collection, userId);
  return role === "owner" || role === "editor";
}

export function isSharedCollection(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  if (!collection || !userId) return false;
  return !isCollectionOwner(collection, userId);
}

export function canAddContent(
  collection: CollectionResponseDto | null | undefined,
  userId: number | undefined,
): boolean {
  const role = getCollectionUserRole(collection, userId);
  return role === "owner" || role === "editor";
}
