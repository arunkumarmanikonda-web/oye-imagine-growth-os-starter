import {describe,it,expect} from 'vitest'
import {CONCIERGE_AUDIENCES,CONCIERGE_RESOURCE_KINDS,CONCIERGE_SURFACES} from '@/lib/ai/concierge-retrieval-types'

describe('foundation-concierge-retrieval-types',()=>{
  it('exposes locked audiences and surfaces',()=>{
    expect(CONCIERGE_AUDIENCES).toContain('client')
    expect(CONCIERGE_AUDIENCES).toContain('marketplace_client')
    expect(CONCIERGE_SURFACES).toContain('help_panel')
    expect(CONCIERGE_RESOURCE_KINDS).toContain('invoice')
    expect(CONCIERGE_RESOURCE_KINDS).toContain('proposal')
  })
})