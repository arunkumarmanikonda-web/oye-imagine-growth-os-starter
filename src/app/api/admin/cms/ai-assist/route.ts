import { NextRequest, NextResponse } from "next/server";
import { buildCmsAiSuggestionBundle, listCmsAiCapabilities } from "@/lib/cms/ai-assist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    capabilities: listCmsAiCapabilities(),
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    entityType?: "page" | "promotion" | "person" | "faq" | "cta";
    prompt?: string;
  };

  const entityType = payload.entityType ?? "page";
  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";

  return NextResponse.json({
    ok: true,
    suggestion: buildCmsAiSuggestionBundle({
      entityType,
      prompt,
    }),
  });
}