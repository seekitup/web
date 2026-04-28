export function formatUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(formatUrl(input));
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname;
    if (!hostname.includes(".")) return false;

    const parts = hostname.split(".");
    const tld = parts[parts.length - 1] ?? "";
    if (tld.length < 2) return false;

    return true;
  } catch {
    return false;
  }
}
