import { NextResponse } from 'next/server'
import { getPublishedPage } from '@/lib/cms/governed-cms'

export const dynamic='force-dynamic'
type Context={params:Promise<{slug:string}>}
export async function GET(_request:Request,context:Context){const {slug}=await context.params;try{const page=await getPublishedPage(slug);if(!page)return NextResponse.json({ok:false,code:'not_found'},{status:404});return NextResponse.json({ok:true,page},{headers:{'Cache-Control':'public, max-age=60, stale-while-revalidate=300'}})}catch{return NextResponse.json({ok:false,code:'cms_public_read_failed'},{status:500})}}
