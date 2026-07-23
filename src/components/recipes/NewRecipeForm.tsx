"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ListEditor } from "@/components/ui/ListEditor";

type Folder = { id: string; key: string; name: string };
type Mode = "link" | "text";

const FAILED_BANNER = "No pudimos abrir ese link. Puedes intentar con otro o escribir la receta a mano.";
const PARTIAL_BANNER = "Encontramos parte de la receta. Revisa y completa lo que falte antes de guardar.";
const NOT_A_RECIPE_BANNER = "No pudimos organizar eso como receta. Puedes completarla a mano.";

export function NewRecipeForm({
  folders,
  initialFolderId,
}: {
  folders: Folder[];
  initialFolderId: string;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("link");
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [servings, setServings] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [folderId, setFolderId] = useState(initialFolderId);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function applyResult(
    result: {
      status: "ok" | "partial" | "failed";
      data?: {
        name: string | null;
        imageUrl: string | null;
        servings: string | null;
        totalTime: string | null;
        sourceUrl: string | null;
        ingredients: string[];
        steps: string[];
      } | null;
    },
    fallbackSourceUrl: string,
    failedBanner: string
  ) {
    if (result.status === "failed") {
      setBanner(failedBanner);
    } else if (result.status === "partial") {
      setBanner(PARTIAL_BANNER);
    }

    if (result.data) {
      setName(result.data.name ?? "");
      setImageUrl(result.data.imageUrl ?? "");
      setServings(result.data.servings ?? "");
      setTotalTime(result.data.totalTime ?? "");
      setSourceUrl(result.data.sourceUrl ?? fallbackSourceUrl);
      setIngredients(result.data.ingredients?.length ? result.data.ingredients : [""]);
      setSteps(result.data.steps?.length ? result.data.steps : [""]);
    } else {
      setSourceUrl(fallbackSourceUrl);
    }
  }

  async function handleExtract() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setExtracting(true);
    setBanner(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const result = await res.json();
      applyResult(result, trimmed, FAILED_BANNER);
    } catch {
      setBanner(FAILED_BANNER);
      setSourceUrl(trimmed);
    } finally {
      setExtracting(false);
      setShowForm(true);
    }
  }

  async function handleOrganize() {
    const trimmed = pastedText.trim();
    if (!trimmed) return;
    setExtracting(true);
    setBanner(null);
    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const result = await res.json();
      applyResult(result, "", NOT_A_RECIPE_BANNER);
    } catch {
      setBanner(NOT_A_RECIPE_BANNER);
    } finally {
      setExtracting(false);
      setShowForm(true);
    }
  }

  function handleManualEntry() {
    setSourceUrl(mode === "link" ? url.trim() : "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim() || !folderId) return;
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ingredients: ingredients.map((i) => i.trim()).filter(Boolean),
          steps: steps.map((s) => s.trim()).filter(Boolean),
          servings: servings.trim() || null,
          totalTime: totalTime.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          imageUrl: imageUrl.trim() || null,
          folderId,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      const recipe = await res.json();
      router.push(`/recetas/receta/${recipe.id}`);
    } catch {
      setSaveError("No se pudo guardar la receta. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const canSave = name.trim().length > 0 && !!folderId && !saving;

  if (!showForm) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 rounded-full bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={clsx(
              "flex-1 rounded-full py-2 text-sm font-medium transition",
              mode === "link" ? "bg-accent text-white" : "text-text-muted"
            )}
          >
            Desde un link
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={clsx(
              "flex-1 rounded-full py-2 text-sm font-medium transition",
              mode === "text" ? "bg-accent text-white" : "text-text-muted"
            )}
          >
            Pegar el texto
          </button>
        </div>

        {mode === "link" ? (
          <div className="flex flex-col gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              inputMode="url"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={!url.trim() || extracting}
              className="h-12 rounded-full bg-accent text-sm font-medium text-white disabled:opacity-50"
            >
              {extracting ? "Buscando receta…" : "Buscar receta"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">
              Pega el texto de la receta (ej. el caption de un video, o una receta copiada de cualquier lado) y la organizamos en ingredientes y pasos.
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Ej. Tortilla española: 4 huevos, 3 papas, 1 cebolla... pelar y cortar las papas, freír a fuego lento..."
              rows={6}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text"
            />
            <button
              type="button"
              onClick={handleOrganize}
              disabled={!pastedText.trim() || extracting}
              className="h-12 rounded-full bg-accent text-sm font-medium text-white disabled:opacity-50"
            >
              {extracting ? "Organizando…" : "Organizar receta"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleManualEntry}
          className="self-center text-sm text-text-muted underline underline-offset-2"
        >
          Escribir la receta manualmente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {banner && <p className="rounded-xl bg-surface-hover px-3 py-2 text-sm text-text-muted">{banner}</p>}

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-40 w-full rounded-xl object-cover" />
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">Link de origen (opcional)</span>
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          inputMode="url"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text">Porciones</span>
          <input
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text">Tiempo</span>
          <input
            value={totalTime}
            onChange={(e) => setTotalTime(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">Carpeta</span>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
        >
          <option value="" disabled>
            Elige una carpeta
          </option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <ListEditor label="Ingredientes" items={ingredients} onChange={setIngredients} placeholder="Ej. 2 tazas de harina" />
      <ListEditor label="Pasos" items={steps} onChange={setSteps} placeholder="Ej. Precalentar el horno a 180°C" />

      {saveError && <p className="text-sm text-danger">{saveError}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="h-12 rounded-full bg-accent text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar receta"}
      </button>
    </div>
  );
}
