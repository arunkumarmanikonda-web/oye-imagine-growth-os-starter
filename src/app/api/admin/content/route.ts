import { NextResponse } from 'next/server'
import {
  getContentControllerPanels,
  getContentStudioSnapshot,
  listAiContentOperations,
  listContentPromotions,
  listFaqEntries,
  listPeopleProfiles,
} from '@/lib/recovery/content-controller'

export async function GET() {
  return NextResponse.json({
    snapshot: getContentStudioSnapshot(),
    panels: getContentControllerPanels(),
    aiOperations: listAiContentOperations(),
    promotions: listContentPromotions(),
    peopleProfiles: listPeopleProfiles(),
    faqEntries: listFaqEntries(),
  })
}