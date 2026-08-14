import { commercialMutationFrozenResponse } from '@/lib/commercial/production-mutation-gate'

export async function POST() {
  return commercialMutationFrozenResponse('media_balance.reserve')
}
