import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { linkKeys } from "@/lib/queryKeys";
import type { LinkResponseDto } from "@/types/api";

/**
 * Window after a link's createdAt during which we'll keep polling even if the
 * server already reports `status === "analyzed"` but `files[]` is still empty.
 *
 * Generic websites (e.g. news articles) skip the scraper queue and are
 * persisted as `analyzed` immediately, but the OG image is uploaded to S3
 * asynchronously by the file-upload pipeline. Without this window the card
 * mounts as "analyzed + no media" and renders the empty placeholder forever
 * (until the user F5s). 60s is generous enough to cover slow uploads while
 * still bounding wasted polling for genuinely media-less links.
 */
const MEDIA_BACKFILL_WINDOW_MS = 60_000;

const POLL_INTERVAL_MS = 5_000;

/**
 * True when we should keep polling for an updated copy of the link — either
 * because the scraper is still working on it, or because the server reported
 * "analyzed" but the OG image hasn't shown up in `files[]` yet and the link
 * is still young enough that one is plausibly inbound.
 *
 * Used both by `usePendingLinkPolling` (to drive the React Query refetch
 * interval) and by every card component (to decide whether to swap the media
 * slot for `<PendingMediaSkeleton />`).
 */
export function isLinkPendingMedia(link: LinkResponseDto): boolean {
  if (link.status === "pending" || link.status === "analyzing") return true;
  if (link.status === "error") return false;

  const hasMedia = (link.files?.length ?? 0) > 0;
  if (hasMedia) return false;

  if (!link.createdAt) return false;
  const ageMs = Date.now() - new Date(link.createdAt).getTime();
  return ageMs < MEDIA_BACKFILL_WINDOW_MS;
}

/**
 * Polls a link's detail endpoint every 5s while `isLinkPendingMedia` is true,
 * and stops once the link has either finished analyzing OR has at least one
 * file populated OR has aged out of the backfill window.
 *
 * Returns the freshest version of the link — polled data when active, the
 * incoming prop otherwise.
 *
 * Mirror of seekitup-app's hook of the same name. Multiple consumers for the
 * same link.id share a single network request via React Query's dedup on
 * `linkKeys.byId(id)`, so the dispatcher and any platform-variant card can
 * both call this hook safely.
 */
export function usePendingLinkPolling(link: LinkResponseDto): LinkResponseDto {
  const isPending = isLinkPendingMedia(link);

  const { data } = useQuery<LinkResponseDto>({
    queryKey: linkKeys.byId(link.id),
    queryFn: () => api.links.getById(link.id),
    enabled: isPending,
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current) return false;
      return isLinkPendingMedia(current) ? POLL_INTERVAL_MS : false;
    },
    placeholderData: link,
    gcTime: 60 * 1000,
    staleTime: 5 * 1000,
    refetchOnMount: "always",
  });

  if (!isPending) return link;
  return data ?? link;
}
