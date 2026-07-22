import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isValidMondayKey, parseMondayKey, type MealType } from "@/lib/week";
import { CalendarBoard } from "@/components/calendar/CalendarBoard";

export const dynamic = "force-dynamic";

export default async function CalendarWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!isValidMondayKey(week)) notFound();

  const startDate = parseMondayKey(week);

  const [weekRow, folders] = await Promise.all([
    prisma.week.findUnique({
      where: { startDate },
      include: {
        menuEntries: {
          include: { recipe: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
    }),
    prisma.folder.findMany({
      orderBy: { order: "asc" },
      include: {
        recipes: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, imageUrl: true },
        },
      },
    }),
  ]);

  const entries = (weekRow?.menuEntries ?? []).map((e) => ({
    id: e.id,
    dayIndex: e.dayIndex,
    mealType: e.mealType as MealType,
    recipe: e.recipe,
  }));

  return <CalendarBoard weekKey={week} entries={entries} folders={folders} />;
}
