import {NextResponse} from 'next/server'
import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoMarketplaceConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

export async function GET(request:Request){
  const {searchParams}=new URL(request.url)
  const q=searchParams.get('q') ?? 'proposal status specialist availability approved deliverables'
  const surface=(searchParams.get('surface') as 'marketplace_surface'|'help_panel'|'support_center'|null) ?? 'marketplace_surface'
  const scope=buildDemoMarketplaceConciergeScope()
  return NextResponse.json({scope:{audience:scope.audience,tenantId:scope.tenantId,workspaceId:scope.workspaceId},snapshot:buildConciergeWorkspaceSnapshot(scope,surface),answer:answerConciergeQuery(scope,q,surface)})
}