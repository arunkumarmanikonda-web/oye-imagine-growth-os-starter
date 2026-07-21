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

    const { data, error } = await admin
      .from("admin_audit_events")
      .select("id, actor_user_id, actor_email, action, target_type, target_id, tenant_id, brand_id, workspace_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      events: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown audit route error",
      },
      { status: 500 }
    );
  }
}