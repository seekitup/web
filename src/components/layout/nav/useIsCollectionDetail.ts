import { useLocation } from "react-router-dom";

/**
 * The collection detail page lives at `/:username/:slug`. To avoid
 * false-positives on other 2-segment URLs (`/login/email`, `/signup/password`,
 * `/auth/verify`, `/account/name`, …) we exclude any path whose first segment
 * is a known reserved top-level route. Keep this list in sync with the
 * top-level routes declared in `App.tsx`.
 */
const RESERVED_FIRST_SEGMENTS = new Set([
  "account",
  "auth",
  "collections",
  "download",
  "home",
  "links",
  "login",
  "search",
  "signup",
]);

export function useIsCollectionDetail(): boolean {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  return !RESERVED_FIRST_SEGMENTS.has(segments[0].toLowerCase());
}
