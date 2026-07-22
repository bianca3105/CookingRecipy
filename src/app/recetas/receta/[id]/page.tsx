import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeActions } from "@/components/recipes/RecipeActions";
import { asStringArray } from "@/lib/json";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { folder: true, _count: { select: { menuEntries: true } } },
  });

  if (!recipe) notFound();

  const folders = await prisma.folder.findMany({ orderBy: { order: "asc" } });
  const ingredients = asStringArray(recipe.ingredients);
  const steps = asStringArray(recipe.steps);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <Link href={`/recetas/${recipe.folder.key}`} className="text-xs text-text-muted">
        ← {recipe.folder.name}
      </Link>

      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt=""
          className="mt-3 h-48 w-full rounded-2xl object-cover"
        />
      )}

      <h1 className="mt-3 text-2xl font-semibold text-text">{recipe.name}</h1>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
        {recipe.servings && <span>{recipe.servings}</span>}
        {recipe.totalTime && <span>{recipe.totalTime}</span>}
        {recipe.sourceUrl && (
          <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent">
            Ver receta original
          </a>
        )}
      </div>

      {ingredients.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-semibold text-text">Ingredientes</h2>
          <ul className="flex flex-col gap-1.5">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-text">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {ingredient}
              </li>
            ))}
          </ul>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-semibold text-text">Pasos</h2>
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-text">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-text-muted">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ingredients.length === 0 && steps.length === 0 && (
        <p className="mt-6 text-sm text-text-muted">
          Esta receta todavía no tiene ingredientes ni pasos guardados.
        </p>
      )}

      <RecipeActions
        recipeId={recipe.id}
        currentFolderId={recipe.folderId}
        folders={folders}
        menuEntryCount={recipe._count.menuEntries}
      />
    </div>
  );
}
