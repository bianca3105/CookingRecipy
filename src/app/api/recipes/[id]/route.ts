import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moveRecipeSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = moveRecipeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: { folderId: parsed.data.folderId },
  });

  return NextResponse.json(recipe);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
