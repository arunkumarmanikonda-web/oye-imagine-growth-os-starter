import { NextResponse } from "next/server";
import {
  buildCmsMutationPlan,
  getCmsRegistrySummary,
  listCmsRegistryCollections,
} from "@/lib/cms/control-plane";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    summary: getCmsRegistrySummary(),
    collections: listCmsRegistryCollections(),
    samplePublishPlan: buildCmsMutationPlan("promotion", "promo-growth-audit", "publish"),
  });
}