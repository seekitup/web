/**
 * Backwards-compatible shim — `lib/collectionPermissions` originally exposed a
 * tiny subset of permission helpers. The full mobile-parity port now lives at
 * `lib/permissions/collectionPermissions`; this file re-exports the same names
 * so existing call-sites (`OrganizeCollectionForm`, `LinkForm`,
 * `CollectionPickerDialog`, `lib/ownership`) keep working unchanged.
 */
export {
  isCollectionOwner,
  getCollectionUserRole,
  canAddContent,
} from "./permissions/collectionPermissions";
