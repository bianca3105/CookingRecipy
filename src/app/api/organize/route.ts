import { NextResponse } from "next/server";
import { z } from "zod";
import { organizeRecipeText } from "@/lib/extract/organize";

const bodySchema = z.object({ text: z.string().trim().min(1) });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ status: "failed", reason: "invalid_text", data: null }, { status: 400 });
  }

  const organized = await organizeRecipeText(parsed.data.text);
  if (!organized) {
    return NextResponse.json({ status: "failed", reason: "not_a_recipe", data: null });
  }

  const data = {
    name: organized.name,
    ingredients: organized.ingredients,
    steps: organized.steps,
    servings: organized.servings,
    totalTime: organized.totalTime,
    imageUrl: null,
    sourceUrl: null,
  };

  const isComplete = !!data.name && data.ingredients.length > 0 && data.steps.length > 0;
  return NextResponse.json({ status: isComplete ? "ok" : "partial", data });
}
