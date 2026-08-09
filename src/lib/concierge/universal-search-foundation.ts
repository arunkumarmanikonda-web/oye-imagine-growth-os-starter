export type GovernedSourceType =
  | 'invoice'
  | 'agreement'
  | 'annexure'
  | 'signed_doc'
  | 'report'
  | 'ledger_entry'
  | 'balance'
  | 'support_thread'
  | 'approval'
  | 'note'
  | 'deliverable'
  | 'policy'
  | 'help'
  | 'service_catalog';

export interface UniversalSourceRecord {
  id: string;
  type: GovernedSourceType;
  title: string;
  content: string;
  keywords?: string[];
  permissionScope: string[];
  openTarget: string;
  groundedSources?: string[];
}

export interface UniversalSearchResult {
  id: string;
  type: GovernedSourceType;
  title: string;
  snippet: string;
  score: number;
  permissionScope: string[];
  openTarget: string;
  groundedSources: string[];
}

export interface UniversalSearchIndex {
  records: UniversalSourceRecord[];
  searchableText: Array<{
    id: string;
    haystack: string;
  }>;
}

export interface RetrievalContext {
  allowedScopes: string[];
}

export interface RetrievalOpenResult {
  allowed: boolean;
  reason: 'ok' | 'forbidden' | 'not_found';
  target?: string;
}

export interface FusionSummary {
  query: string;
  resultCount: number;
  groundedSourceTypes: string[];
  groundedRecordIds: string[];
  actionRoute: string;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return normalize(value).split(/\s+/).filter(Boolean);
}

export function buildUniversalSearchIndex(
  records: UniversalSourceRecord[],
): UniversalSearchIndex {
  return {
    records,
    searchableText: records.map((record) => ({
      id: record.id,
      haystack: normalize(
        [
          record.title,
          record.content,
          ...(record.keywords ?? []),
          ...(record.groundedSources ?? []),
          record.type,
        ].join(' '),
      ),
    })),
  };
}

export function searchUniversalKnowledge(
  index: UniversalSearchIndex,
  query: string,
  allowedScopes: string[],
): UniversalSearchResult[] {
  const queryTokens = tokenize(query);
  const allowedSet = new Set(allowedScopes);

  return index.records
    .map((record) => {
      const searchable = index.searchableText.find((item) => item.id === record.id);
      if (!searchable) return null;

      const scopeAllowed = record.permissionScope.some((scope) => allowedSet.has(scope));
      if (!scopeAllowed) return null;

      let score = 0;
      for (const token of queryTokens) {
        if (searchable.haystack.includes(token)) {
          score += 1;
        }
      }

      if (score === 0) return null;

      const snippetBase = record.content || record.title;
      const snippet = snippetBase.length > 120 ? `${snippetBase.slice(0, 117)}...` : snippetBase;

      return {
        id: record.id,
        type: record.type,
        title: record.title,
        snippet,
        score,
        permissionScope: record.permissionScope,
        openTarget: record.openTarget,
        groundedSources: record.groundedSources ?? [record.type],
      } satisfies UniversalSearchResult;
    })
    .filter((item): item is UniversalSearchResult => item !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function openGovernedResult(
  index: UniversalSearchIndex,
  recordId: string,
  context: RetrievalContext,
): RetrievalOpenResult {
  const record = index.records.find((item) => item.id === recordId);
  if (!record) {
    return { allowed: false, reason: 'not_found' };
  }

  const allowed = record.permissionScope.some((scope) =>
    context.allowedScopes.includes(scope),
  );

  if (!allowed) {
    return { allowed: false, reason: 'forbidden' };
  }

  return {
    allowed: true,
    reason: 'ok',
    target: record.openTarget,
  };
}

export function fuseKnowledgeRecords(
  results: UniversalSearchResult[],
  query: string,
): FusionSummary {
  const groundedSourceTypes = [...new Set(results.map((result) => result.type))];
  const groundedRecordIds = results.map((result) => result.id);

  let actionRoute = 'open_search_results';
  if (results.some((result) => result.type === 'invoice')) {
    actionRoute = 'open_invoice';
  } else if (results.some((result) => result.type === 'agreement')) {
    actionRoute = 'open_agreement';
  } else if (results.some((result) => result.type === 'report')) {
    actionRoute = 'download_report';
  } else if (results.some((result) => result.type === 'support_thread')) {
    actionRoute = 'open_support_history';
  }

  return {
    query,
    resultCount: results.length,
    groundedSourceTypes,
    groundedRecordIds,
    actionRoute,
  };
}