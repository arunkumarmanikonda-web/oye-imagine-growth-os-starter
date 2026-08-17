import { getWorkspaceBrandingDiagnostics } from '@/lib/admin/workspace-branding'
import { createClient } from '@supabase/supabase-js'
import { adminError, adminJson } from '@/lib/admin-api'

export async function GET() {
  const timestamp = new Date().toISOString()
  const branding = getWorkspaceBrandingDiagnostics()
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

  const missingEnv = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter((value): value is string => Boolean(value))

  if (missingEnv.length > 0) {
    return adminError(500, 'Admin health check failed', `Missing required environment configuration: ${missingEnv.join(', ')}`)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  try {
    const { data, error } = await supabase
      .from('workspace_settings')
      .select('id, tenant_id, brand_id, workspace_id, key, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
    if (error) return adminError(500, 'Admin health check failed', error.message)

    return adminJson({
      branding,
      ok: true,
      workspaceDisplayName: branding.workspaceDisplayName,
      timestamp,
      auth: { ok: true, boundary: 'admin-aal2-proxy' },
      checks: { env: { ok: true }, db: { ok: true, latestWorkspaceSetting: Array.isArray(data) && data.length ? data[0] : null } },
      links: { adminHome: '/admin', summary: '/admin/summary', strategy: '/admin/strategy', execution: '/admin/execution' },
    })
  } catch (error) {
    return adminError(500, 'Admin health check failed', error instanceof Error ? error.message : 'Unknown admin health error')
  }
}
