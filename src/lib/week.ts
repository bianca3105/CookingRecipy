import { startOfWeek, addWeeks, addDays, format } from "date-fns";
import { es } from "date-fns/locale";

export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
};

export const DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function mondayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parses a "YYYY-MM-DD" key into a local-midnight Date. Must always be paired
 * with local-based formatting (mondayKey/format) so the round trip is stable. */
export function parseMondayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function currentMondayKey(): string {
  return mondayKey(mondayOf(new Date()));
}

export function addWeeksToKey(key: string, amount: number): string {
  return mondayKey(addWeeks(parseMondayKey(key), amount));
}

export function isValidMondayKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return mondayKey(mondayOf(parseMondayKey(key))) === key;
}

export function dayDateLabel(key: string, dayIndex: number): string {
  return format(addDays(parseMondayKey(key), dayIndex), "d", { locale: es });
}

export function weekRangeLabel(key: string): string {
  const monday = parseMondayKey(key);
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear = monday.getFullYear() === sunday.getFullYear();

  if (sameMonth) {
    return `${format(monday, "d")} – ${format(sunday, "d 'de' MMMM yyyy", { locale: es })}`;
  }
  if (sameYear) {
    return `${format(monday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`;
  }
  return `${format(monday, "d MMM yyyy", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`;
}
