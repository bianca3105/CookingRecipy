"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

export type ChipRecipe = { id: string; name: string; imageUrl: string | null };

export function RecipeChip({
  recipe,
  armed,
  onTap,
}: {
  recipe: ChipRecipe;
  armed: boolean;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { recipe },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={clsx(
        "w-24 shrink-0 overflow-hidden rounded-xl border text-left transition touch-none",
        armed ? "border-accent ring-2 ring-accent" : "border-border",
        isDragging && "opacity-60"
      )}
    >
      {recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.imageUrl} alt="" className="h-14 w-full object-cover" />
      ) : (
        <div className="h-14 w-full bg-surface-hover" />
      )}
      <span className="block truncate px-2 py-1.5 text-[11px] font-medium text-text">{recipe.name}</span>
    </button>
  );
}
