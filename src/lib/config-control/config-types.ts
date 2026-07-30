export type ProviderKey =
  | 'google_ads'
  | 'meta_marketing'
  | 'linkedin_marketing'
  | 'youtube'
  | 'ga4'
  | 'search_console'
  | 'google_business_profile'
  | 'payment_gateway'
  | 'esign'
  | 'whatsapp';

export type ConfigTarget = 'supabase_vault' | 'vercel_env' | 'runtime_adapter';

export type ProviderCatalogEntry = {
  provider: ProviderKey;
  label: string;
  requiredKeys: string[];
  optionalKeys: string[];
  syncTargets: ConfigTarget[];
  notes: string[];
};

export type ProviderSyncPlan = {
  provider: ProviderKey;
  status: 'ready' | 'partial' | 'missing';
  configuredKeys: string[];
  missingRequired: string[];
  targets: ConfigTarget[];
};

export type GlobalSyncSummary = {
  readyCount: number;
  partialCount: number;
  missingCount: number;
  blockedProviders: ProviderKey[];
};

export type RuntimeProviderResolution = {
  provider: ProviderKey;
  ready: boolean;
  values: Record<string, string>;
  missingRequired: string[];
};