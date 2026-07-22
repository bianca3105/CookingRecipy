import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderKey: string }>;
}) {
  const { folderKey } = await params;

  const folder = await prisma.folder.findUnique({
    where: { key: folderKey },
    include: {
      recipes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, imageUrl: true },
      },
    },
  });

  if (!folder) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/recetas" className="text-xs text-text-muted">
            ← Todas las carpetas
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-text">{folder.name}</h1>
        </div>
        <Link
          href={`/recetas/nueva?folder=${folder.key}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-2xl leading-none text-white shadow-sm"
          aria-label="Agregar receta"
        >
          +
        </Link>
      </div>

      {folder.recipes.length === 0 ? (
        <p className="text-sm text-text-muted">
          Todavía no hay recetas aquí. Toca “+” para agregar la primera.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {folder.recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recetas/receta/${recipe.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition active:scale-[0.98]"
            >
              {recipe.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.imageUrl} alt="" className="h-24 w-full object-cover" />
              ) : (
                <div className="h-24 w-full bg-surface-hover" />
              )}
              <span className="px-3 py-2 text-sm font-medium text-text">{recipe.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
