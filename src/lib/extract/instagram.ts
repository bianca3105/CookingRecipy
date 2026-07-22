export function isInstagramUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "instagram.com" || host.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

const GENERIC_TITLE = "instagram";
const TITLE_PATTERN = /^.+? on Instagram: "([\s\S]*)"$/;

/** Instagram's <title> tag is `{author} on Instagram: "{caption}"` — strip
 * that wrapper so the caption itself becomes the name. When there's no
 * caption at all, the tag is just the site name. */
export function cleanInstagramName(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed || trimmed.toLowerCase() === GENERIC_TITLE) return null;

  const match = TITLE_PATTERN.exec(trimmed);
  return match ? match[1].trim() : trimmed;
}
