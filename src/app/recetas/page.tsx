import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RecetasPage() {
  const folders = await prisma.folder.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { recipes: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <h1 className="mb-1 text-2xl font-semibold text-text">Mis Recetas</h1>
      <p className="mb-6 text-sm text-text-muted">Elige una carpeta para ver tus recetas</p>

      <div className="grid grid-cols-2 gap-3">
        {folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/recetas/${folder.key}`}
            className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 transition active:scale-[0.98]"
          >
            <span className="text-base font-medium text-text">{folder.name}</span>
            <span className="text-xs text-text-muted">
              {folder._count.recipes} {folder._count.recipes === 1 ? "receta" : "recetas"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
