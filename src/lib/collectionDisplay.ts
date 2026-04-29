import type {
  CollectionResponseDto,
  FileResponseDto,
  LinkResponseDto,
  LookupChildCollectionDto,
  LookupLinkFileDto,
  LookupPreviewLinkDto,
} from "@/types/api";

/**
 * Subset of link fields needed by the subcollection preview cards
 * (`ExpandedSubcollection` / `CompactSubcollection`). Mirrors
 * `LookupPreviewLinkDto` but is a structural superset accepted by the
 * existing `linkUtils` helpers (`getPreviewImageUrl`, `formatLinkPrice`,
 * `isYouTubeLink`, …).
 */
export interface CollectionDisplayPreviewLink {
  id: number;
  url: string;
  domain: string;
  title: string;
  ogTitle?: string;
  productName?: string;
  productPrice?: number;
  productPriceCurrency?: string;
  platformPostTitle?: string;
  platformUserName?: string;
  files: LookupLinkFileDto[];
}

/**
 * View-model consumed by the canonical Complete / Grid collection cards
 * (`ExpandedSubcollection`, `CompactSubcollection`). Lets the same components
 * back two backend shapes — the lightweight lookup payload used by the public
 * collection page, and the heavier authenticated `CollectionResponseDto` —
 * via the adapters below.
 */
export interface CollectionDisplayData {
  id: number;
  name: string;
  slug: string;
  totalLinks: number;
  ownerUsername: string;
  previewLinks: CollectionDisplayPreviewLink[];
}

const PREVIEW_LIMIT = 4;

const toPreviewFile = (file: FileResponseDto): LookupLinkFileDto => {
  const out: LookupLinkFileDto = {
    id: file.id,
    url: file.url,
    mimeType: file.mimeType,
  };
  if (file.purpose !== undefined) out.purpose = file.purpose;
  if (file.width !== undefined) out.width = file.width;
  if (file.height !== undefined) out.height = file.height;
  return out;
};

const previewFromLink = (
  link: LinkResponseDto,
): CollectionDisplayPreviewLink => {
  const out: CollectionDisplayPreviewLink = {
    id: link.id,
    url: link.url,
    domain: link.domain,
    title: link.title,
    files: (link.files ?? []).map(toPreviewFile),
  };
  if (link.ogTitle !== undefined) out.ogTitle = link.ogTitle;
  if (link.productName !== undefined) out.productName = link.productName;
  if (link.productPrice !== undefined) out.productPrice = link.productPrice;
  if (link.productPriceCurrency !== undefined)
    out.productPriceCurrency = link.productPriceCurrency;
  if (link.platformPostTitle !== undefined)
    out.platformPostTitle = link.platformPostTitle;
  if (link.platformUserName !== undefined)
    out.platformUserName = link.platformUserName;
  return out;
};

const previewFromLookup = (
  link: LookupPreviewLinkDto,
): CollectionDisplayPreviewLink => {
  const out: CollectionDisplayPreviewLink = {
    id: link.id,
    url: link.url,
    domain: link.domain,
    title: link.title,
    files: link.files,
  };
  if (link.ogTitle !== undefined) out.ogTitle = link.ogTitle;
  if (link.productName !== undefined) out.productName = link.productName;
  if (link.productPrice !== undefined) out.productPrice = link.productPrice;
  if (link.productPriceCurrency !== undefined)
    out.productPriceCurrency = link.productPriceCurrency;
  if (link.platformPostTitle !== undefined)
    out.platformPostTitle = link.platformPostTitle;
  if (link.platformUserName !== undefined)
    out.platformUserName = link.platformUserName;
  return out;
};

/**
 * Adapt a public-lookup child collection (`LookupChildCollectionDto`) into
 * the normalized view-model. The parent's owner username is used as the
 * navigation root since lookup children don't carry their own user.
 */
export const fromLookupChild = (
  child: LookupChildCollectionDto,
  parentUsername: string,
): CollectionDisplayData => ({
  id: child.id,
  name: child.name,
  slug: child.slug,
  totalLinks: child.totalLinks,
  ownerUsername: parentUsername,
  previewLinks: child.previewLinks.slice(0, PREVIEW_LIMIT).map(previewFromLookup),
});

/**
 * Adapt an authenticated `CollectionResponseDto` into the normalized
 * view-model. Previews are derived from the first few links the API
 * already returned alongside the collection.
 */
export const fromCollectionResponse = (
  collection: CollectionResponseDto,
): CollectionDisplayData => ({
  id: collection.id,
  name: collection.name,
  slug: collection.slug,
  totalLinks: collection.totalLinks,
  ownerUsername: collection.user?.username ?? "",
  previewLinks: (collection.links ?? [])
    .slice(0, PREVIEW_LIMIT)
    .map(previewFromLink),
});
