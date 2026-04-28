import type {
  LinkResponseDto,
  FileResponseDto,
  LookupPreviewLinkDto,
} from "@/types/api";

/**
 * Check if a link is a MercadoLibre product with price data.
 */
export const isMercadoLibreProduct = (link: LinkResponseDto): boolean => {
  if (!link.domain) return false;
  const domain = link.domain.toLowerCase();
  const isMeli =
    domain.includes("mercadolibre") || domain.includes("mercadolivre");
  return isMeli && !!link.productPrice && link.productPrice > 0;
};

/**
 * Check if a link is a LinkedIn profile or company page.
 */
export const isLinkedInProfile = (link: LinkResponseDto): boolean => {
  if (!link.domain) return false;
  const domain = link.domain.toLowerCase();
  if (!domain.includes("linkedin.com")) return false;
  return (
    /\/in\/[A-Za-z0-9-]+/.test(link.url) ||
    /\/company\/[A-Za-z0-9-]+/.test(link.url)
  );
};

/**
 * Get the LinkedIn profile picture file (profile_picture purpose, fallback to image/og_image).
 */
export const getLinkedInProfilePicture = (
  link: LinkResponseDto,
): FileResponseDto | undefined => {
  return (
    link.files?.find((f) => f.purpose === "profile_picture") ||
    link.files?.find((f) => f.purpose === "image" || f.purpose === "og_image")
  );
};

/**
 * Get the LinkedIn cover/background image file.
 */
export const getLinkedInCoverImage = (
  link: LinkResponseDto,
): FileResponseDto | undefined => {
  return link.files?.find((f) => f.purpose === "cover_image");
};

/**
 * Get the display title for a link.
 * Priority order when title === ogTitle:
 * 1. platformPostTitle
 * 2. productName
 * Falls back to title, ogTitle, then URL.
 */
export const getLinkDisplayTitle = (link: LinkResponseDto): string => {
  const titlesMatch = link?.title?.trim() === link?.ogTitle?.trim();

  if (titlesMatch) {
    if (link?.platformPostTitle?.trim()) {
      return link.platformPostTitle.trim();
    }
    if (link?.productName?.trim()) {
      return link.productName.trim();
    }
  }

  return link.title || link.ogTitle || link.url;
};

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".m4v",
  ".wmv",
  ".flv",
  ".3gp",
];
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".ico",
  ".heic",
  ".heif",
  ".avif",
];

const hasVideoExtension = (url: string | undefined): boolean => {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lowercaseUrl.endsWith(ext));
};

const hasImageExtension = (url: string | undefined): boolean => {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lowercaseUrl.endsWith(ext));
};

const isFileValid = (file: FileResponseDto): boolean => {
  if (file.purpose === "video") {
    return hasVideoExtension(file.url);
  }
  if (file.purpose === "image" || file.purpose === "og_image") {
    return hasImageExtension(file.url);
  }
  return true;
};

export const getValidFiles = (
  files: FileResponseDto[] | undefined,
): FileResponseDto[] => {
  if (!files) return [];
  return files.filter(isFileValid);
};

export type MediaType = "video" | "image" | "unknown";

export const getMediaType = (file: FileResponseDto): MediaType => {
  if (file.purpose === "video") return "video";
  if (file.purpose === "image" || file.purpose === "og_image") return "image";
  if (file.mimeType?.startsWith("video/")) return "video";
  if (file.mimeType?.startsWith("image/")) return "image";
  return "unknown";
};

export const shouldLoadThumbnail = (file: FileResponseDto): boolean =>
  file.status === "analyzed";

// Insert "/thumbnail/" before the filename and force .jpg.
// e.g. https://x/media/abc/foo.mp4 -> https://x/media/abc/thumbnail/foo.jpg
export const deriveThumbnailUrl = (url: string): string | null => {
  if (!url) return null;
  const lastSlash = url.lastIndexOf("/");
  if (lastSlash === -1) return null;
  const dir = url.substring(0, lastSlash);
  const filename = url.substring(lastSlash + 1);
  const dot = filename.lastIndexOf(".");
  const stem = dot === -1 ? filename : filename.substring(0, dot);
  return `${dir}/thumbnail/${stem}.jpg`;
};

export const getFileThumbnailUrl = (
  file: FileResponseDto,
): string | null => {
  if (!shouldLoadThumbnail(file) || !file.url) return null;
  return deriveThumbnailUrl(file.url);
};

// Videos first, then images. Mirrors mobile sortMediaFiles.
export const sortMediaFiles = (
  files: FileResponseDto[],
): FileResponseDto[] => {
  const videos = files.filter((f) => f.purpose === "video");
  const images = files.filter(
    (f) => f.purpose === "image" || f.purpose === "og_image",
  );
  return [...videos, ...images];
};

/**
 * Get the primary media file from a link.
 * Video takes priority over image on web, but we prefer images for static display.
 */
export const getLinkPrimaryMedia = (
  link: LinkResponseDto,
): FileResponseDto | undefined => {
  const validFiles = getValidFiles(link.files);
  // On web, prefer image over video for static display
  const primaryImage = validFiles.find(
    (file) => file.purpose === "image" || file.purpose === "og_image",
  );
  const primaryVideo = validFiles.find(
    (file) => file.purpose === "video" && hasVideoExtension(file.url),
  );
  return primaryImage || primaryVideo;
};

/**
 * Get all media files (images) for carousel display.
 */
export const getLinkMediaFiles = (link: LinkResponseDto): FileResponseDto[] => {
  const validFiles = getValidFiles(link.files);
  return validFiles.filter(
    (file) => file.purpose === "image" || file.purpose === "og_image",
  );
};

// Carousel feed for the complete view: videos sorted before images so a
// video-only link still renders as a one-slide carousel of the video itself.
export const getLinkCarouselFiles = (
  link: LinkResponseDto,
): FileResponseDto[] => sortMediaFiles(getValidFiles(link.files));

export const getLinkFavicon = (
  link: LinkResponseDto,
): FileResponseDto | undefined => {
  return link.files?.find((file) => file.purpose === "favicon");
};

export const getLinkSourceText = (link: LinkResponseDto): string => {
  return link.platformUserName ? `@${link.platformUserName}` : link.domain;
};

// YouTube utilities
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

const YOUTUBE_SHORTS_REGEX = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;

export const isYouTubeLink = (url: string): boolean => {
  if (!url) return false;
  return YOUTUBE_REGEX.test(url);
};

export const isYouTubeShort = (url: string): boolean => {
  if (!url) return false;
  return YOUTUBE_SHORTS_REGEX.test(url);
};

export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
};

export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

export const isVideoFile = (file: FileResponseDto): boolean => {
  if (file.purpose === "video") return true;
  if (file.mimeType?.startsWith("video/")) return true;
  return hasVideoExtension(file.url);
};

export const getLinkPrimaryVideo = (
  link: LinkResponseDto,
): FileResponseDto | undefined => {
  const validFiles = getValidFiles(link.files);
  return validFiles.find((file) => isVideoFile(file));
};

export const getVideoThumbnailUrl = (
  file: FileResponseDto,
): string | undefined => {
  if (file.thumbnail) return file.thumbnail;
  return deriveThumbnailUrl(file.url) ?? undefined;
};

/**
 * Get the preview image URL from a LookupPreviewLinkDto.
 * Handles YouTube thumbnails and standard image/og_image files.
 */
export const getPreviewImageUrl = (
  link: LookupPreviewLinkDto,
): string | undefined => {
  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  if (youtubeId) return getYouTubeThumbnailUrl(youtubeId);
  const imageFile = link.files.find(
    (f) => f.purpose === "image" || f.purpose === "og_image",
  );
  return imageFile?.url;
};

/**
 * Get the thumbnail URL for a full LinkResponseDto (for navigator pills).
 */
export const getLinkThumbnailUrl = (
  link: LinkResponseDto,
): string | undefined => {
  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  if (youtubeId) return getYouTubeThumbnailUrl(youtubeId);
  return getLinkPrimaryMedia(link)?.url;
};

// Favicon utilities
export const getGoogleFaviconUrl = (domain: string, size = 64): string => {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
};

// Price formatting
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  INR: "₹",
  RUB: "₽",
  BRL: "R$",
  CAD: "CA$",
  AUD: "A$",
  MXN: "MX$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  TRY: "₺",
  THB: "฿",
  SGD: "S$",
  HKD: "HK$",
  NZD: "NZ$",
  ZAR: "R",
  ARS: "$",
  CLP: "$",
  COP: "$",
  PEN: "S/",
  PHP: "₱",
  IDR: "Rp",
  MYR: "RM",
  VND: "₫",
  AED: "د.إ",
  SAR: "﷼",
  ILS: "₪",
  TWD: "NT$",
};

export const formatLinkPrice = (
  price: number | undefined | null,
  currency: string | undefined | null,
): string | null => {
  if (price === undefined || price === null || price <= 0) {
    return null;
  }

  const currencyCode = currency?.toUpperCase() || "USD";
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

  const symbol = CURRENCY_SYMBOLS[currencyCode];
  if (symbol) {
    return `${symbol}${formattedNumber} ${currencyCode}`;
  }
  return `${formattedNumber} ${currencyCode}`;
};

/**
 * Format a price for MercadoLibre display.
 * Pesos (ARS, CLP, COP, MXN, UYU): "$140.000" (symbol + number only)
 * Other currencies: "USD 140.000" (code + number, no symbol)
 */
const PESO_CURRENCIES = new Set(["ARS", "CLP", "COP", "MXN", "UYU"]);

export const formatMeliPrice = (
  price: number | undefined | null,
  currency: string | undefined | null,
): string | null => {
  if (price === undefined || price === null || price <= 0) return null;

  const currencyCode = currency?.toUpperCase() || "USD";
  const formattedNumber = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  if (PESO_CURRENCIES.has(currencyCode)) {
    return symbol ? `${symbol}${formattedNumber}` : formattedNumber;
  }
  return `${currencyCode} ${formattedNumber}`;
};
