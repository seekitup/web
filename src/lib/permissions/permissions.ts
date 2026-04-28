/**
 * Core permission types and base utilities for role-based access control.
 *
 * Ported verbatim from `seekitup-app/app/utils/permissions.ts` so the web
 * mirrors mobile behavior exactly. The `EntityRole` union is widened to also
 * include `"member"` because the web API DTO (`CollectionRoleUserDto`) emits
 * that role name; semantically `"member"` is treated like a viewer-level role
 * (no editor / no owner privileges) — the existing call sites only ever check
 * for `"owner"` or `"editor"` so the additional value passes through safely.
 */

export type PermissionAction =
  | "view"
  | "edit"
  | "delete"
  | "leave"
  | "manage_members"
  | "change_visibility"
  | "rename"
  | "move"
  | "share";

export type EntityRole = "owner" | "editor" | "viewer" | "member";

export interface PermissionContext<T> {
  entity: T;
  userId: number;
  userRole?: EntityRole;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

export function allow(): PermissionResult {
  return { allowed: true };
}

export function deny(reason: string): PermissionResult {
  return { allowed: false, reason };
}

export function getUserDisplayName(user: {
  firstName?: string | undefined;
  lastName?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.username) {
    return user.username;
  }
  return user.email ?? "";
}
