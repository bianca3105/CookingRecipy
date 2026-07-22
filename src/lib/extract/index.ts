import * as cheerio from "cheerio";
import { findRecipeJsonLd } from "./parseJsonLd";
import { normalizeRecipeNode } from "./normalizeRecipe";
import { extractOpenGraph } from "./openGraphFallback";

const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

export type ExtractedData = {
  name: string | null;
  ingredients: string[];
  steps: string[];
  servings: string | null;
  totalTime: string | null;
  imageUrl: string | null;
  sourceUrl: string;
};

export type ExtractResult =
  | { status: "ok" | "partial"; reason?: string; data: ExtractedData }
  | { status: "failed"; reason: string; data: null };

export async function extractRecipeFromUrl(url: string): Promise<ExtractResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!res.ok) {
      return { status: "failed", reason: `http_${res.status}`, data: null };
    }
    html = await res.text();
  } catch {
    return { status: "failed", reason: "fetch_blocked", data: null };
  }

  const $ = cheerio.load(html);
  const recipeNode = findRecipeJsonLd($);
  const og = extractOpenGraph($);

  if (recipeNode) {
    const normalized = normalizeRecipeNode(recipeNode);
    const data: ExtractedData = {
      name: normalized.name ?? og.name,
      ingredients: normalized.ingredients,
      steps: normalized.steps,
      servings: normalized.servings,
      totalTime: normalized.totalTime,
      imageUrl: normalized.imageUrl ?? og.imageUrl,
      sourceUrl: url,
    };
    const isComplete = !!data.name && data.ingredients.length > 0 && data.steps.length > 0;
    return isComplete
      ? { status: "ok", data }
      : { status: "partial", reason: "incomplete_jsonld", data };
  }

  return {
    status: "partial",
    reason: "no_recipe_jsonld",
    data: {
      name: og.name,
      ingredients: [],
      steps: [],
      servings: null,
      totalTime: null,
      imageUrl: og.imageUrl,
      sourceUrl: url,
    },
  };
}
