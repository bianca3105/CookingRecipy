export function isTikTokUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

type TikTokOEmbed = {
  title?: string;
  thumbnail_url?: string;
};

/**
 * TikTok's own oEmbed endpoint — public, no auth needed. Gives the real
 * thumbnail and the caption text, but never ingredients/steps: those are
 * spoken in the video, which no text-based tool can transcribe.
 */
export async function fetchTikTokOEmbed(url: string): Promise<TikTokOEmbed | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as TikTokOEmbed;
  } catch {
    return null;
  }
}
