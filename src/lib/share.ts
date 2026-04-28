import { toast } from "sonner";
import i18n from "@/i18n";
import type { CollectionResponseDto, LookupUserDto } from "@/types/api";

/**
 * Build the canonical share URL for a collection. Public collections live at
 * `https://<host>/:username/:slug`. The owner's username is needed because it
 * is part of the slug path on web — collections embed the owner via
 * `collection.user`.
 */
export function getCollectionShareUrl(
  collection: Pick<CollectionResponseDto, "slug"> & {
    user: Pick<LookupUserDto, "username"> | { username: string };
  },
): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://seekitup.com";
  return `${origin}/${collection.user.username}/${collection.slug}`;
}

/**
 * Try the Web Share API first (mobile + Safari + Edge). Falls back to clipboard
 * with a success toast when not available — both paths are first-class.
 */
export async function shareUrl(url: string, title?: string): Promise<void> {
  if (typeof navigator === "undefined") return;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ url, title: title ?? "" });
      return;
    } catch (err) {
      // User cancelled — be silent.
      const e = err as { name?: string; message?: string };
      if (e?.name === "AbortError") return;
      // Fall through to clipboard fallback on real failures.
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success(i18n.t("share.copiedToClipboard"));
      return;
    }
  } catch {
    // ignore — surface a generic error below
  }
  toast.error(i18n.t("share.failed"));
}
