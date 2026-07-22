import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRecipeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createRecipeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, ingredients, steps, servings, totalTime, sourceUrl, imageUrl, folderId } = parsed.data;

  const recipe = await prisma.recipe.create({
    data: {
      name,
      ingredients,
      steps,
      servings: servings || null,
      totalTime: totalTime || null,
      sourceUrl: sourceUrl || null,
      imageUrl: imageUrl || null,
      folderId,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
