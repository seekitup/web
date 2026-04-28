import type { ComponentType, SVGProps } from "react";
import {
  CollectionsIcon,
  HomeIcon,
  LinksIcon,
  ProfileIcon,
} from "./icons";

export interface NavItem {
  to: string;
  labelKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Route is `/account` today; later flips to a dedicated /profile page. */
  end?: boolean;
}

/**
 * Shared between the desktop sidebar and the mobile bottom tab bar so adding a
 * tab in one place lights it up in both. Order mirrors the mobile app.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/home", labelKey: "tabBar.home", Icon: HomeIcon },
  { to: "/links", labelKey: "tabBar.links", Icon: LinksIcon },
  { to: "/collections", labelKey: "tabBar.collections", Icon: CollectionsIcon },
  { to: "/account", labelKey: "tabBar.profile", Icon: ProfileIcon },
];
