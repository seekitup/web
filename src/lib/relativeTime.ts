/**
 * Coarse-grained relative-time helper. Mirrors the thresholds used by the
 * mobile bottom sheets so the "Created · 5 minutes ago" / "Created by X · 2
 * hours ago" labels read identically on web.
 *
 * Returns localized strings via i18next keys under `relativeTime.*`. Falls
 * back to English-style words if the consumer hasn't loaded translations.
 */

import i18n from "@/i18n";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getRelativeTime(input: string | number | Date): string {
  const date = typeof input === "string" || typeof input === "number"
    ? new Date(input)
    : input;
  const diff = Date.now() - date.getTime();

  if (diff < MINUTE) return i18n.t("relativeTime.justNow");
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return i18n.t("relativeTime.minutesAgo", { count: m });
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return i18n.t("relativeTime.hoursAgo", { count: h });
  }
  const d = Math.floor(diff / DAY);
  return i18n.t("relativeTime.daysAgo", { count: d });
}
