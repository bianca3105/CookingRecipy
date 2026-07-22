import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMenuEntrySchema } from "@/lib/validation";
import { isValidMondayKey, parseMondayKey } from "@/lib/week";

export async function POST(request: Request, { params }: { params: Promise<{ monday: string }> }) {
  const { monday } = await params;
  if (!isValidMondayKey(monday)) {
    return NextResponse.json({ error: "invalid_week" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createMenuEntrySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dayIndex, mealType, recipeId } = parsed.data;
  const startDate = parseMondayKey(monday);

  const week = await prisma.week.upsert({
    where: { startDate },
    update: {},
    create: { startDate },
  });

  const entry = await prisma.menuEntry.upsert({
    where: { weekId_dayIndex_mealType: { weekId: week.id, dayIndex, mealType } },
    update: { recipeId },
    create: { weekId: week.id, dayIndex, mealType, recipeId },
    include: { recipe: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(entry, { status: 201 });
}
