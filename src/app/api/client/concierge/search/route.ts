import {NextResponse} from 'next/server'
import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoClientConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request:Request){
  const {searchParams}=new URL(request.url)
  const q=searchParams.get('q') ?? 'where is my overdue invoice and latest report'
  const surface=(searchParams.get('surface') as 'client_dashboard'|'help_panel'|'support_center'|null) ?? 'client_dashboard'
  const scope=buildDemoClientConciergeScope()
  return NextResponse.json({scope:{audience:scope.audience,tenantId:scope.tenantId,workspaceId:scope.workspaceId},snapshot:buildConciergeWorkspaceSnapshot(scope,surface),answer:answerConciergeQuery(scope,q,surface)})
}