import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminContexts } from "@/lib/admin/context";
import { logAdminAuditEvent } from "@/lib/admin/audit";

type SelectContextBody = {
  workspaceId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SelectContextBody;
    const workspaceId = body.workspaceId?.trim();

    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const { active: previous, options } = await getAdminContexts();
    const selected = options.find((item) => item.workspaceId === workspaceId);

    if (!selected) {
      return NextResponse.json(
        { ok: false, error: "Invalid workspaceId" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      active: selected,
    });

    response.cookies.set("oye_admin_workspace_id", selected.workspaceId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    try {
      await logAdminAuditEvent({
        event: "admin_context_switched",
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        tenantId: selected.tenantId,
        brandId: selected.brandId,
        workspaceId: selected.workspaceId,
        payload: {
          previousWorkspaceId: previous?.workspaceId ?? null,
          previousWorkspaceSlug: previous?.workspaceSlug ?? null,
          previousTenantSlug: previous?.tenantSlug ?? null,
          nextWorkspaceId: selected.workspaceId,
          nextWorkspaceSlug: selected.workspaceSlug,
          nextTenantSlug: selected.tenantSlug,
        },
      });
    } catch (auditError) {
      console.error("Failed to write admin context switch audit event", auditError);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}