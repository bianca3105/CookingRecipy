"use client";

import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { MEAL_LABELS, type MealType } from "@/lib/week";
import type { ChipRecipe } from "./RecipeChip";

export type SlotValue = { entryId: string; recipe: ChipRecipe };

export function slotKey(dayIndex: number, mealType: string): string {
  return `${dayIndex}-${mealType}`;
}

export function MenuSlot({
  dayIndex,
  mealType,
  entries,
  pendingEntryIds,
  onTap,
  onClear,
  variant,
}: {
  dayIndex: number;
  mealType: MealType;
  entries: SlotValue[];
  pendingEntryIds: Set<string>;
  onTap: () => void;
  onClear: (entryId: string) => void;
  variant: "row" | "grid";
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotKey(dayIndex, mealType) });

  if (variant === "row") {
    return (
      <div
        ref={setNodeRef}
        className={clsx(
          "flex min-h-[3.25rem] flex-col gap-1.5 rounded-xl border px-3 py-2",
          isOver ? "border-accent bg-surface-hover" : "border-border bg-surface"
        )}
      >
        <span className="text-xs font-medium text-text-muted">{MEAL_LABELS[mealType]}</span>
        {entries.map((entry) => (
          <div
            key={entry.entryId}
            className={clsx(
              "flex min-w-0 items-center gap-2",
              pendingEntryIds.has(entry.entryId) && "opacity-60"
            )}
          >
            <Link href={`/recetas/receta/${entry.recipe.id}`} className="flex min-w-0 flex-1 items-center gap-2">
              {entry.recipe.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.recipe.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-lg bg-surface-hover" />
              )}
              <span className="truncate text-sm font-medium text-text">{entry.recipe.name}</span>
            </Link>
            <button
              type="button"
              onClick={() => onClear(entry.entryId)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted"
              aria-label="Quitar"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={onTap} className="text-left text-xs text-text-muted">
          {entries.length === 0 ? "Arrastra o toca una receta…" : "+ Agregar otro plato"}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex min-h-[4.5rem] flex-col gap-0.5 overflow-hidden rounded-lg border p-1",
        isOver ? "border-accent bg-surface-hover" : "border-border bg-surface"
      )}
    >
      {entries.map((entry) => (
        <div
          key={entry.entryId}
          className={clsx(
            "flex items-center gap-1 rounded bg-bg/60",
            pendingEntryIds.has(entry.entryId) && "opacity-60"
          )}
        >
          <Link href={`/recetas/receta/${entry.recipe.id}`} className="min-w-0 flex-1 truncate px-1 py-0.5 text-[9px] font-medium text-text">
            {entry.recipe.name}
          </Link>
          <button
            type="button"
            onClick={() => onClear(entry.entryId)}
            className="shrink-0 px-1 text-[10px] text-text-muted"
            aria-label="Quitar"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={onTap} className="px-1 text-left text-[9px] text-text-muted">
        {entries.length === 0 ? "Vacío" : "+ agregar"}
      </button>
    </div>
  );
}
