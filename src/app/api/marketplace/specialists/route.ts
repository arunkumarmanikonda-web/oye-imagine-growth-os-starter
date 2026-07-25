import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
const workspaceDisplayName = getWorkspaceDisplayName();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("marketplace_specialists")
      .select("id, slug, full_name, title, primary_category, bio, skills, languages, verified, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("full_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { ok: true,
      workspaceDisplayName, specialists: data ?? [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load specialists.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
