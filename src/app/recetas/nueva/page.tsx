import { prisma } from "@/lib/prisma";
import { NewRecipeForm } from "@/components/recipes/NewRecipeForm";

export const dynamic = "force-dynamic";

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const { folder } = await searchParams;
  const folders = await prisma.folder.findMany({ orderBy: { order: "asc" } });
  const preselected = folders.find((f) => f.key === folder)?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <h1 className="mb-1 text-2xl font-semibold text-text">Agregar receta</h1>
      <p className="mb-6 text-sm text-text-muted">Pega el link de la receta y la buscamos por ti.</p>
      <NewRecipeForm folders={folders} initialFolderId={preselected} />
    </div>
  );
}
