import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("marketplace_services")
      .select("id, slug, title, category, description, pricing_model, price_label, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { ok: true, services: data ?? [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load marketplace services.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
