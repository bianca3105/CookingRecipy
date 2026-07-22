import { NextResponse } from "next/server";
import { extractRequestSchema } from "@/lib/validation";
import { extractRecipeFromUrl } from "@/lib/extract";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = extractRequestSchema.safeParse(json);
  if (!parsed.success || !/^https?:\/\//i.test(parsed.data.url)) {
    return NextResponse.json({ status: "failed", reason: "invalid_url", data: null }, { status: 400 });
  }

  const result = await extractRecipeFromUrl(parsed.data.url);
  return NextResponse.json(result);
}
