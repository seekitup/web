import clsx from "clsx";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { MobileTabBar } from "./MobileTabBar";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { CreateModalProvider } from "@/components/create/CreateModalProvider";
import { useCreateModal } from "@/components/create/createModalContext";
import { CreateModal } from "@/components/create/CreateModal";
import { DesktopCreateFab } from "@/components/create/DesktopCreateFab";
import { OutletWidthProvider } from "./OutletWidth";
import { useOutletWidth } from "@/hooks/outletWidthContext";

/**
 * Authenticated layout. Composition:
 *   - Navbar (top, full-width): brand + language toggle + UserMenu
 *   - Sidebar (lg+, left): primary nav rail + recent collections + new collection
 *   - MobileTabBar (< lg, bottom): Home / Links / + / Collections / Profile
 *   - DesktopCreateFab (lg+): floating green "+" bottom-right
 *   - CreateModal: shared overlay opened by all "+" entry points
 *   - Main content area centers within the remaining space
 *
 * Both rails stay mounted across every authenticated route — including
 * /account/* sub-pages — so the user never feels like navigation has dropped
 * out from under them mid-flow.
 */
export function AppLayout() {
  const { i18n } = useTranslation();

  return (
    <CreateModalProvider>
      <OutletWidthProvider>
        <Helmet>
          <html lang={i18n.language} />
        </Helmet>
        <div className="flex min-h-screen flex-col bg-background">
          <Navbar />

          <div className="flex flex-1">
            <AppSidebar />

            <main className="relative flex min-w-0 flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+72px)] lg:pb-0">
              <OutletContainer />
            </main>
          </div>

          <AppMobileTabBar />
          <DesktopCreateFab />
          <CreateModal />
        </div>
      </OutletWidthProvider>
    </CreateModalProvider>
  );
}

function OutletContainer() {
  const width = useOutletWidth();
  // "full" lets the page own its own padding + width — used by pages that need
  // an edge-to-edge hero (the authenticated collection view). The page is
  // expected to apply `px-4 sm:px-6` to whichever inner blocks should have it.
  if (width === "full") {
    return (
      <div className="w-full">
        <Outlet />
      </div>
    );
  }
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 sm:px-6 py-6 md:py-10",
        width === "wide" ? "max-w-7xl" : "max-w-3xl",
      )}
    >
      <Outlet />
    </div>
  );
}

function AppSidebar() {
  const createModal = useCreateModal();
  return (
    <Sidebar
      onNewCollection={() =>
        createModal.open({ mode: "creating", tab: "collection" })
      }
    />
  );
}

function AppMobileTabBar() {
  const createModal = useCreateModal();
  return (
    <MobileTabBar
      onAddPress={() => createModal.open({ mode: "creating" })}
    />
  );
}
