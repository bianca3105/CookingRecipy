/**
 * schema.org recipeInstructions can be a single string, an array of strings,
 * an array of HowToStep objects, or an array of HowToSection objects that
 * nest their own itemListElement — this handles all of those shapes.
 */
export function normalizeInstructions(raw: unknown): string[] {
  if (!raw) return [];

  if (typeof raw === "string") {
    const lines = raw
      .split(/\r?\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length > 1) return lines;
    return raw
      .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(raw)) {
    const steps: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        steps.push(item.trim());
        continue;
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        if (Array.isArray(obj.itemListElement)) {
          steps.push(...normalizeInstructions(obj.itemListElement));
          continue;
        }
        const text = obj.text ?? obj.name;
        if (typeof text === "string" && text.trim()) steps.push(text.trim());
      }
    }
    return steps;
  }

  return [];
}
