"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function RecipeActions({
  recipeId,
  currentFolderId,
  folders,
  menuEntryCount,
}: {
  recipeId: string;
  currentFolderId: string;
  folders: { id: string; name: string }[];
  menuEntryCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMove(folderId: string) {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error("move_failed");
      router.refresh();
    } catch {
      setError("No se pudo mover la receta. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    setError(null);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
      router.push("/recetas");
    } catch {
      setError("No se pudo eliminar la receta. Intenta de nuevo.");
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5">
      {error && <p className="text-sm text-danger">{error}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm text-text-muted">Mover a otra carpeta</span>
        <select
          defaultValue={currentFolderId}
          onChange={(e) => handleMove(e.target.value)}
          disabled={pending}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
        >
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="h-11 rounded-full border border-danger/40 text-sm font-medium text-danger"
      >
        Eliminar receta
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar esta receta?"
        description={
          menuEntryCount > 0
            ? `Está usada en ${menuEntryCount} ${menuEntryCount === 1 ? "casilla" : "casillas"} del menú semanal; también se quitará de ahí.`
            : "Esta acción no se puede deshacer."
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
