/**
 * Collection-specific permission utilities.
 *
 * Mirrors `seekitup-app/app/utils/collectionPermissions.ts` exactly. Only field
 * accesses are adapted to the web DTO shape: members are flat
 * `CollectionRoleUserDto` records (no nested `.role` / `.userId`), where
 * `.id` is the user id and `.roleName` carries the role.
 */

import type {
  CollectionResponseDto,
  CollectionRoleUserDto,
} from "@/types/api";

import type { EntityRole } from "./permissions";

/**
 * Minimal user shape we can guarantee from any owner source — covers what
 * Avatar / display-name helpers actually consume. Both `UserResponseDto` and
 * `CollectionRoleUserDto` satisfy this.
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
    (m: CollectionRoleUserDto) => m.roleName === "owner",
  );
  if (ownerMember?.id === userId) {
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
    (m) => m.roleName === "owner",
  );
  if (ownerMember) {
    return {
      id: ownerMember.id,
      username: ownerMember.username,
      firstName: ownerMember.firstName,
      lastName: ownerMember.lastName,
      image: ownerMember.image
        ? { id: ownerMember.image.id, url: ownerMember.image.url }
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

  if (collection.userRole?.roleName) {
    return collection.userRole.roleName as EntityRole;
  }

  const memberEntry = collection.members?.find((m) => m.id === userId);
  if (memberEntry?.roleName) {
    return memberEntry.roleName as EntityRole;
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
