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

  // Upsert on (week, day, meal, recipe): dropping the same recipe twice on the
  // same slot is a no-op instead of a duplicate row. Different recipes in the
  // same slot are separate rows — a meal can have several dishes.
  const entry = await prisma.menuEntry.upsert({
    where: { weekId_dayIndex_mealType_recipeId: { weekId: week.id, dayIndex, mealType, recipeId } },
    update: {},
    create: { weekId: week.id, dayIndex, mealType, recipeId },
    include: { recipe: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(entry, { status: 201 });
}
