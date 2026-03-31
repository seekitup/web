export const APP_STORE_URL =
  'https://apps.apple.com/app/seekitup/id6757165497';

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.seekitup.app';

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return true;
  // iPadOS 13+ reports as Macintosh but has multi-touch support
  if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    return true;
  return false;
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Returns the store URL matching the visitor's OS, or null if unknown.
 */
export function getStoreUrl(): string | null {
  if (isIOS()) return APP_STORE_URL;
  if (isAndroid()) return PLAY_STORE_URL;
  return null;
}
