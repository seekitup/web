import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { AppLayout } from "./AppLayout";
import { Layout } from "./Layout";

/**
 * Route layout for /:username/:slug. Renders the authenticated AppLayout
 * (sidebar + tab bar + create FAB) for logged-in viewers, and the public
 * Layout (navbar + download AppBanner) for everyone else. The page itself
 * stays publicly reachable — never redirect here.
 *
 * While auth is verifying, render a full-screen spinner so we don't flicker
 * between the two layouts on initial load or hard refresh.
 */
export function CollectionRouteLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={28} className="text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <Layout />;
}
