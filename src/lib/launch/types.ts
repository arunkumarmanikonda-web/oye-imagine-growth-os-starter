export type LaunchState = 'not_started' | 'in_progress' | 'ready' | 'blocked';

export type LaunchRole =
  | 'Engineering'
  | 'Product'
  | 'Design'
  | 'Marketing'
  | 'Legal'
  | 'Operations';

export interface LaunchChecklistItem {
  id: string;
  label: string;
  status: LaunchState;
  launchBlocking: boolean;
  evidenceSource: string;
  notes?: string;
}

export interface LaunchChecklistSection {
  id: string;
  title: string;
  description: string;
  sourceBatches: string[];
  ownerSuggestions: LaunchRole[];
  signoffRoles: LaunchRole[];
  status: LaunchState;
  items: LaunchChecklistItem[];
}

export interface LaunchSignoffRecord {
  sectionId: string;
  role: LaunchRole;
  signerName: string;
  signerEmail: string;
  signedAtIso: string;
  attestationText: string;
  signatureDigest: string;
  ipHash?: string;
  userAgentHash?: string;
  evidenceUrls: string[];
  notes?: string;
}