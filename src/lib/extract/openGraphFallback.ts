import type { CheerioAPI } from "cheerio";

export function extractOpenGraph($: CheerioAPI): { name: string | null; imageUrl: string | null } {
  const title =
    $('meta[property="og:title"]').attr("content") ??
    $("title").first().text() ??
    null;
  const image = $('meta[property="og:image"]').attr("content") ?? null;

  return {
    name: title?.trim() || null,
    imageUrl: image?.trim() || null,
  };
}
