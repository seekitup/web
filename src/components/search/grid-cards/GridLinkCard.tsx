import type { ReactNode } from "react";
import type { LinkResponseDto } from "@/types/api";
import {
  isLinkedInProfile,
  isMercadoLibreProduct,
} from "@/lib/linkUtils";
import { GenericGridLinkCard } from "./GenericGridLinkCard";
import { LinkedInGridCard } from "./LinkedInGridCard";
import { MercadoLibreGridCard } from "./MercadoLibreGridCard";

export interface GridLinkCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  /** Optional action affordance (e.g. kebab menu) rendered top-right of the card. */
  actionSlot?: ReactNode;
}

/**
 * Canonical Grid-mode link card for the search results gallery. Routes to a
 * platform-specific portrait variant (LinkedIn / MercadoLibre) when the link
 * matches, otherwise renders the generic portrait card. Mirrors the dispatch
 * shape of `CompactLinkCard` so it can drop into the same wrappers.
 */
export function GridLinkCard({
  link,
  index,
  itemId,
  actionSlot,
}: GridLinkCardProps) {
  if (isLinkedInProfile(link)) {
    return (
      <LinkedInGridCard
        link={link}
        index={index}
        {...(itemId !== undefined ? { itemId } : {})}
        {...(actionSlot !== undefined ? { actionSlot } : {})}
      />
    );
  }
  if (isMercadoLibreProduct(link)) {
    return (
      <MercadoLibreGridCard
        link={link}
        index={index}
        {...(itemId !== undefined ? { itemId } : {})}
        {...(actionSlot !== undefined ? { actionSlot } : {})}
      />
    );
  }
  return (
    <GenericGridLinkCard
      link={link}
      index={index}
      {...(itemId !== undefined ? { itemId } : {})}
      {...(actionSlot !== undefined ? { actionSlot } : {})}
    />
  );
}
