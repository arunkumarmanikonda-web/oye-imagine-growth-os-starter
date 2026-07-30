export type CommercialCurrencyCode = string;

export interface CommercialMediaBalanceAccountRecord {
  tenantId: string;
  currency: CommercialCurrencyCode;
  available: number;
  reserved: number;
  spent: number;
  updatedAt: string;
}

export interface CommercialLedgerEntryRecord {
  entryId: string;
  tenantId: string;
  entryType: string;
  direction: 'debit' | 'credit';
  amount: number;
  currency: CommercialCurrencyCode;
  operationKey: string;
  reference: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface CommercialAuditEventRecord {
  eventId: string;
  tenantId: string;
  eventType: string;
  actorId: string | null;
  beforeState: unknown;
  afterState: unknown;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface CommercialApprovalRequestRecord {
  approvalId: string;
  tenantId: string;
  approvalType: string;
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  resolutionPayload: Record<string, unknown>;
  actorId: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CommercialMutationInput {
  tenantId: string;
  amount: number;
  currency?: CommercialCurrencyCode;
  operationKey: string;
  actorId?: string | null;
  reference?: string | null;
  payload?: Record<string, unknown>;
}

export interface CommercialMutationResult {
  account: CommercialMediaBalanceAccountRecord;
  ledgerEntry: CommercialLedgerEntryRecord;
  auditEvent: CommercialAuditEventRecord;
}

export interface CommercialPersistenceRepository {
  getOrCreateMediaBalanceAccount(tenantId: string, currency?: CommercialCurrencyCode): Promise<CommercialMediaBalanceAccountRecord>;
  reserveMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult>;
  releaseMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult>;
  spendMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult>;
  listLedgerEntries(tenantId: string): Promise<CommercialLedgerEntryRecord[]>;
  listAuditEvents(tenantId: string): Promise<CommercialAuditEventRecord[]>;
  listApprovalRequests(tenantId: string): Promise<CommercialApprovalRequestRecord[]>;
}

export type {
  ActivateCommercialContractInput,
  CommercialApprovalDecision,
  CommercialWorkflowMutationInputBase,
  CommercialWorkflowPersistenceRuntimeSurface,
  MarkCommercialInvoicePaidInput,
  RenewCommercialSubscriptionInput,
  ResolveCommercialApprovalRequestInput,
} from './workflow-persistence-surface'
export { hasCommercialWorkflowPersistenceSurface } from './workflow-persistence-surface'
