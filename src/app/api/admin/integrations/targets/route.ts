import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(){try{const access=await requireApiAccess({lane:'admin'});if(access.membership.role_key!=='platform_owner')return NextResponse.json({ok:false,code:'forbidden'},{status:403});const admin=createSupabaseAdminClient();const{data,error}=await admin.from('workspaces').select('id,name,slug,tenant_id,brand_id,tenants(slug,display_name),brands(name)').eq('status','active').order('created_at');if(error)throw error;return NextResponse.json({ok:true,workspaces:data||[]},{headers:{'Cache-Control':'private, no-store'}})}catch(error){if(error instanceof ApiAccessError)return NextResponse.json({ok:false,code:error.code},{status:error.status});return NextResponse.json({ok:false,code:'targets_read_failed'},{status:500})}}
