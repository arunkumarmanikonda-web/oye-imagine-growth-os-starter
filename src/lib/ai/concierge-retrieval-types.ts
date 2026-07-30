export const CONCIERGE_AUDIENCES=['client','marketplace_client','admin'] as const
export const CONCIERGE_SURFACES=['client_dashboard','marketplace_surface','help_panel','support_center'] as const
export const CONCIERGE_RESOURCE_KINDS=['invoice','ledger','agreement','signed_document','report','performance_summary','campaign_status','onboarding_state','support_message','marketplace_request','proposal','approved_deliverable','setting','help_article'] as const
export const CONCIERGE_VISIBILITIES=['client','marketplace_client','admin','internal','shared'] as const
export type ConciergeAudience=(typeof CONCIERGE_AUDIENCES)[number]
export type ConciergeSurface=(typeof CONCIERGE_SURFACES)[number]
export type ConciergeResourceKind=(typeof CONCIERGE_RESOURCE_KINDS)[number]
export type ConciergeVisibility=(typeof CONCIERGE_VISIBILITIES)[number]
export type ConciergeMetaValue=string|number|boolean|null
export interface ConciergeScope{actorId:string;tenantId:string;workspaceId?:string;brandId?:string;audience:ConciergeAudience;permissions:string[]}
export interface ConciergeLink{label:string;href:string}
export interface ConciergeResource{id:string;kind:ConciergeResourceKind;title:string;summary:string;href:string;tenantId?:string;workspaceId?:string;brandId?:string;visibility:ConciergeVisibility;audiences:ConciergeAudience[];surfaces:ConciergeSurface[];tags:string[];keywords:string[];status?:string;overdue?:boolean;meta?:Record<string,ConciergeMetaValue>;links:ConciergeLink[]}
export interface ConciergeSearchMatch{resource:ConciergeResource;score:number;matchedTerms:string[]}
export interface ConciergeAnswer{query:string;intent:string;narrative:string;permissionScoped:boolean;resultCount:number;deniedCount:number;results:ConciergeResource[];citations:Array<{label:string;href:string;kind:ConciergeResourceKind}>;shortcuts:Array<{label:string;href:string;action:string}>;nextActions:string[]}
export interface ConciergeWorkspaceSnapshot{totalResources:number;overdueInvoices:number;pendingApprovals:number;openSupportThreads:number;openMarketplaceRequests:number;byKind:Record<ConciergeResourceKind,number>}