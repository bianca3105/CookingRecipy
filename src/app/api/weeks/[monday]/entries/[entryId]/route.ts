import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  await prisma.menuEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ ok: true });
}
