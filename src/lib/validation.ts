import { z } from "zod";
import { MEAL_TYPES } from "@/lib/week";

export const extractRequestSchema = z.object({
  url: z.string().url(),
});

export const createRecipeSchema = z.object({
  name: z.string().trim().min(1),
  ingredients: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  servings: z.string().trim().nullish(),
  totalTime: z.string().trim().nullish(),
  sourceUrl: z.string().trim().nullish(),
  imageUrl: z.string().trim().nullish(),
  folderId: z.string().min(1),
});

export const moveRecipeSchema = z.object({
  folderId: z.string().min(1),
});

export const createMenuEntrySchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  mealType: z.enum(MEAL_TYPES),
  recipeId: z.string().min(1),
});
