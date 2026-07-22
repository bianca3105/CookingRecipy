import type { CheerioAPI } from "cheerio";

function flattenGraph(nodes: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj["@graph"])) {
      out.push(...flattenGraph(obj["@graph"] as unknown[]));
    } else {
      out.push(obj);
    }
  }
  return out;
}

function isRecipeType(type: unknown): boolean {
  if (typeof type === "string") return type === "Recipe";
  if (Array.isArray(type)) return type.includes("Recipe");
  return false;
}

export function findRecipeJsonLd($: CheerioAPI): Record<string, unknown> | null {
  const candidates: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw?.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      candidates.push(...flattenGraph(nodes));
    } catch {
      // malformed JSON-LD block — skip it, don't let it block other scripts
    }
  });

  return candidates.find((node) => isRecipeType(node["@type"])) ?? null;
}
