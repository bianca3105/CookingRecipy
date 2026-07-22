"use client";

export function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text">{label}</p>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-xs text-text-muted">{index + 1}</span>
            <input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="shrink-0 px-1 text-lg leading-none text-text-muted"
              aria-label="Quitar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="mt-2 text-sm font-medium text-accent">
        + Agregar
      </button>
    </div>
  );
}
