import { parseIsoDuration, formatMinutes } from "./parseDuration";
import { normalizeInstructions } from "./normalizeInstructions";

function firstString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === "string");
    if (typeof first === "string") return first;
    const firstObj = value.find(
      (v) => v && typeof v === "object" && typeof (v as Record<string, unknown>).url === "string"
    );
    if (firstObj) return (firstObj as Record<string, unknown>).url as string;
    return null;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
  }
  return null;
}

function normalizeYield(raw: unknown): string | null {
  if (typeof raw === "string") return raw.trim() || null;
  if (typeof raw === "number") return `${raw} porciones`;
  if (Array.isArray(raw)) {
    const strs = raw.filter((v): v is string => typeof v === "string");
    return strs.length ? strs.join(" – ") : null;
  }
  return null;
}

function totalMinutesFrom(node: Record<string, unknown>): number | null {
  const total = node.totalTime;
  if (typeof total === "string") {
    const parsed = parseIsoDuration(total);
    if (parsed) return parsed;
  }
  const prep = typeof node.prepTime === "string" ? parseIsoDuration(node.prepTime) : null;
  const cook = typeof node.cookTime === "string" ? parseIsoDuration(node.cookTime) : null;
  if (prep || cook) return (prep ?? 0) + (cook ?? 0);
  return null;
}

export type NormalizedRecipe = {
  name: string | null;
  ingredients: string[];
  steps: string[];
  servings: string | null;
  totalTime: string | null;
  imageUrl: string | null;
};

export function normalizeRecipeNode(node: Record<string, unknown>): NormalizedRecipe {
  const name = typeof node.name === "string" ? node.name.trim() : null;

  const ingredients = Array.isArray(node.recipeIngredient)
    ? node.recipeIngredient
        .filter((v): v is string => typeof v === "string")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const steps = normalizeInstructions(node.recipeInstructions);
  const servings = normalizeYield(node.recipeYield);
  const minutes = totalMinutesFrom(node);
  const totalTime = minutes ? formatMinutes(minutes) : null;
  const imageUrl = firstString(node.image);

  return { name, ingredients, steps, servings, totalTime, imageUrl };
}
