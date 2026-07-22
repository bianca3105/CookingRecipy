"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import clsx from "clsx";
import {
  MEAL_TYPES,
  MEAL_LABELS,
  DAY_LABELS,
  addWeeksToKey,
  weekRangeLabel,
  currentMondayKey,
  dayDateLabel,
  type MealType,
} from "@/lib/week";
import { MenuSlot, slotKey, type SlotValue } from "./MenuSlot";
import { RecipeChip, type ChipRecipe } from "./RecipeChip";

type Entry = { id: string; dayIndex: number; mealType: MealType; recipe: ChipRecipe };
type Folder = { id: string; key: string; name: string; recipes: ChipRecipe[] };

export function CalendarBoard({
  weekKey,
  entries,
  folders,
}: {
  weekKey: string;
  entries: Entry[];
  folders: Folder[];
}) {
  const [slots, setSlots] = useState<Record<string, SlotValue>>(() => {
    const initial: Record<string, SlotValue> = {};
    for (const e of entries) initial[slotKey(e.dayIndex, e.mealType)] = { entryId: e.id, recipe: e.recipe };
    return initial;
  });
  const [pendingSlots, setPendingSlots] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [armedRecipeId, setArmedRecipeId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const allRecipes = useMemo(
    () => folders.flatMap((f) => f.recipes.map((r) => ({ ...r, folderKey: f.key }))),
    [folders]
  );
  const trayRecipes = folderFilter === "all" ? allRecipes : allRecipes.filter((r) => r.folderKey === folderFilter);

  async function assign(dayIndex: number, mealType: MealType, recipe: ChipRecipe) {
    const key = slotKey(dayIndex, mealType);
    const prevSlot = slots[key];
    setSlots((s) => ({ ...s, [key]: { entryId: prevSlot?.entryId ?? "pending", recipe } }));
    setPendingSlots((p) => new Set(p).add(key));
    setError(null);

    try {
      const res = await fetch(`/api/weeks/${weekKey}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayIndex, mealType, recipeId: recipe.id }),
      });
      if (!res.ok) throw new Error("assign_failed");
      const entry = await res.json();
      setSlots((s) => ({ ...s, [key]: { entryId: entry.id, recipe: entry.recipe } }));
    } catch {
      setSlots((s) => {
        const next = { ...s };
        if (prevSlot) next[key] = prevSlot;
        else delete next[key];
        return next;
      });
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setPendingSlots((p) => {
        const next = new Set(p);
        next.delete(key);
        return next;
      });
    }
  }

  async function clear(dayIndex: number, mealType: MealType) {
    const key = slotKey(dayIndex, mealType);
    const prevSlot = slots[key];
    if (!prevSlot) return;
    setSlots((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });
    setError(null);

    try {
      const res = await fetch(`/api/weeks/${weekKey}/entries/${prevSlot.entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("clear_failed");
    } catch {
      setSlots((s) => ({ ...s, [key]: prevSlot }));
      setError("No se pudo quitar. Intenta de nuevo.");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setArmedRecipeId(null);
    if (!over) return;
    const recipe = active.data.current?.recipe as ChipRecipe | undefined;
    if (!recipe) return;
    const [dayIndexStr, mealType] = String(over.id).split("-") as [string, MealType];
    assign(Number(dayIndexStr), mealType, recipe);
  }

  function handleSlotTap(dayIndex: number, mealType: MealType) {
    if (!armedRecipeId) return;
    const recipe = allRecipes.find((r) => r.id === armedRecipeId);
    if (!recipe) return;
    assign(dayIndex, mealType, recipe);
    setArmedRecipeId(null);
  }

  const prevKey = addWeeksToKey(weekKey, -1);
  const nextKey = addWeeksToKey(weekKey, 1);
  const isCurrentWeek = weekKey === currentMondayKey();

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-bg/95 px-4 pb-3 pt-6 backdrop-blur">
        <h1 className="mb-3 text-2xl font-semibold text-text">Menú semanal</h1>
        <div className="flex items-center justify-between">
          <Link
            href={`/calendario/${prevKey}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text"
          >
            ‹
          </Link>
          <div className="text-center">
            <p className="text-sm font-medium text-text">{weekRangeLabel(weekKey)}</p>
            {!isCurrentWeek && (
              <Link href={`/calendario/${currentMondayKey()}`} className="text-xs text-accent">
                Ir a hoy
              </Link>
            )}
          </div>
          <Link
            href={`/calendario/${nextKey}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text"
          >
            ›
          </Link>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="px-4 pt-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            <FilterChip active={folderFilter === "all"} onClick={() => setFolderFilter("all")} label="Todas" />
            {folders.map((f) => (
              <FilterChip key={f.id} active={folderFilter === f.key} onClick={() => setFolderFilter(f.key)} label={f.name} />
            ))}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
            {trayRecipes.length === 0 && (
              <p className="py-2 text-sm text-text-muted">No hay recetas en esta carpeta todavía.</p>
            )}
            {trayRecipes.map((r) => (
              <RecipeChip
                key={r.id}
                recipe={r}
                armed={armedRecipeId === r.id}
                onTap={() => setArmedRecipeId((id) => (id === r.id ? null : r.id))}
              />
            ))}
          </div>
          {armedRecipeId && (
            <p className="mb-2 text-xs text-text-muted">Toca ahora la casilla del menú donde quieres poner esta receta.</p>
          )}
          {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        </div>

        {/* Mobile: lista día por día, más fácil de leer en el celular */}
        <div className="flex flex-col gap-4 px-4 pb-8 sm:hidden">
          {DAY_LABELS.map((label, dayIndex) => (
            <div key={label}>
              <p className="mb-2 text-sm font-semibold text-text">
                {label} <span className="text-text-muted">{dayDateLabel(weekKey, dayIndex)}</span>
              </p>
              <div className="flex flex-col gap-2">
                {MEAL_TYPES.map((meal) => (
                  <MenuSlot
                    key={slotKey(dayIndex, meal)}
                    variant="row"
                    dayIndex={dayIndex}
                    mealType={meal}
                    slot={slots[slotKey(dayIndex, meal)]}
                    pending={pendingSlots.has(slotKey(dayIndex, meal))}
                    onTap={() => handleSlotTap(dayIndex, meal)}
                    onClear={() => clear(dayIndex, meal)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Escritorio: grilla compacta de un vistazo */}
        <div className="hidden px-4 pb-8 sm:block">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1.5">
            <div />
            {DAY_LABELS.map((d) => (
              <div key={d} className="pb-1 text-center text-[11px] font-medium text-text-muted">
                {d.slice(0, 3)}
              </div>
            ))}
            {MEAL_TYPES.map((meal) => (
              <Fragment key={meal}>
                <div className="flex items-center justify-end pr-1 text-[11px] font-medium text-text-muted">
                  {MEAL_LABELS[meal]}
                </div>
                {DAY_LABELS.map((_, dayIndex) => (
                  <MenuSlot
                    key={slotKey(dayIndex, meal)}
                    variant="grid"
                    dayIndex={dayIndex}
                    mealType={meal}
                    slot={slots[slotKey(dayIndex, meal)]}
                    pending={pendingSlots.has(slotKey(dayIndex, meal))}
                    onTap={() => handleSlotTap(dayIndex, meal)}
                    onClear={() => clear(dayIndex, meal)}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
        active ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-muted"
      )}
    >
      {label}
    </button>
  );
}
