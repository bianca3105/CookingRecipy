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
  slot,
  pending,
  onTap,
  onClear,
  variant,
}: {
  dayIndex: number;
  mealType: MealType;
  slot?: SlotValue;
  pending: boolean;
  onTap: () => void;
  onClear: () => void;
  variant: "row" | "grid";
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotKey(dayIndex, mealType) });

  if (variant === "row") {
    return (
      <div
        ref={setNodeRef}
        className={clsx(
          "flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-3 py-2",
          isOver ? "border-accent bg-surface-hover" : "border-border bg-surface",
          pending && "opacity-60"
        )}
      >
        <span className="w-16 shrink-0 text-xs font-medium text-text-muted">{MEAL_LABELS[mealType]}</span>
        {slot ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link href={`/recetas/receta/${slot.recipe.id}`} className="flex min-w-0 flex-1 items-center gap-2">
              {slot.recipe.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slot.recipe.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-lg bg-surface-hover" />
              )}
              <span className="truncate text-sm font-medium text-text">{slot.recipe.name}</span>
            </Link>
            <button
              type="button"
              onClick={onClear}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted"
              aria-label="Quitar"
            >
              ×
            </button>
          </div>
        ) : (
          <button type="button" onClick={onTap} className="flex-1 text-left text-xs text-text-muted">
            Arrastra o toca una receta…
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "relative aspect-square overflow-hidden rounded-lg border",
        isOver ? "border-accent bg-surface-hover" : "border-border bg-surface",
        pending && "opacity-60"
      )}
    >
      {slot ? (
        <>
          <Link href={`/recetas/receta/${slot.recipe.id}`} className="absolute inset-0 flex items-end p-1">
            {slot.recipe.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.recipe.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span className="relative z-10 w-full truncate rounded bg-black/45 px-1 text-[10px] font-medium text-white">
              {slot.recipe.name}
            </span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClear();
            }}
            className="absolute right-0.5 top-0.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-[9px] text-white"
            aria-label="Quitar"
          >
            ×
          </button>
        </>
      ) : (
        <button type="button" onClick={onTap} className="h-full w-full" aria-label="Vacío" />
      )}
    </div>
  );
}
