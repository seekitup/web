import { useAuth } from "@/hooks/useAuth";
import { CollectionLoader } from "@/components/collection/CollectionLoader";
import { PublicCollectionPage } from "./PublicCollectionPage";
import { AuthenticatedCollectionPage } from "./AuthenticatedCollectionPage";

/**
 * Thin router for the `/:username/:slug` route. Anonymous visitors see the
 * preserved public collection page (untouched). Authenticated users see the
 * stunning new view with hero banner, 3-mode density toggle, avatar stack,
 * and per-item / collection options modals — gated by their actual role
 * (owner / editor / viewer-member / passing-by). The auth state is the only
 * decision input here; the inner pages own everything else.
 */
export function CollectionPage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl w-full">
        <CollectionLoader className="min-h-[60vh]" />
      </div>
    );
  }
  return isAuthenticated ? (
    <AuthenticatedCollectionPage />
  ) : (
    <PublicCollectionPage />
  );
}
