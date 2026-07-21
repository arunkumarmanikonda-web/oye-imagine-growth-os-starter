import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    if (!url || !anonKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase public env is missing." },
        { status: 500 }
      );
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
            response.cookies.set(name, value, options as any);
          });
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const userRole =
      user.user_metadata?.role ??
      user.app_metadata?.role ??
      "";

    if (userRole !== "platform_admin") {
      return NextResponse.json(
        { ok: false, error: "Platform admin role required." },
        { status: 403 }
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: tenant, error: tenantError } = await admin
      .from("tenants")
      .select("id, slug, legal_name, display_name, created_at")
      .eq("slug", "oye-imagine")
      .maybeSingle();

    if (tenantError) {
      return NextResponse.json(
        { ok: false, error: tenantError.message },
        { status: 400 }
      );
    }

    const { data: brand, error: brandError } = await admin
      .from("brands")
      .select("id, tenant_id, name, website_url, created_at")
      .eq("tenant_id", tenant?.id ?? "00000000-0000-0000-0000-000000000000")
      .eq("name", "Oye !magine")
      .maybeSingle();

    if (brandError) {
      return NextResponse.json(
        { ok: false, error: brandError.message },
        { status: 400 }
      );
    }

    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .select("id, tenant_id, brand_id, name, slug, created_at, updated_at")
      .eq("tenant_id", tenant?.id ?? "00000000-0000-0000-0000-000000000000")
      .eq("slug", "core-platform")
      .maybeSingle();

    if (workspaceError) {
      return NextResponse.json(
        { ok: false, error: workspaceError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? null,
        role: userRole,
        full_name: user.user_metadata?.full_name ?? null,
      },
      context: {
        tenant,
        brand,
        workspace,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown admin context error",
      },
      { status: 500 }
    );
  }
}