import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type { LaunchRole, LaunchSignoffRecord } from './types';
import { launchAttestationText } from './signoff-statement';

type PersistedLaunchSignoffs = {
  version: 1;
  signoffs: LaunchSignoffRecord[];
};

type SaveLaunchSignoffInput = {
  sectionId: string;
  role: LaunchRole;
  signerName: string;
  signerEmail: string;
  evidenceUrls: string[];
  notes?: string;
};

const STORE_PATH = path.join(
  process.cwd(),
  'artifacts',
  'tracker-ui24',
  'launch-signoffs.json'
);

function normalizeText(value: string) {
  return value.trim();
}

function normalizeEmail(value: string) {
  return normalizeText(value).toLowerCase();
}

function normalizeEvidenceUrls(values: string[]) {
  return values
    .map((value) => normalizeText(value))
    .filter((value) => value.length > 0);
}

async function ensureStoreFile(): Promise<PersistedLaunchSignoffs> {
  const dir = path.dirname(STORE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as PersistedLaunchSignoffs;
    return {
      version: 1,
      signoffs: Array.isArray(parsed.signoffs) ? parsed.signoffs : [],
    };
  } catch {
    const initial: PersistedLaunchSignoffs = {
      version: 1,
      signoffs: [],
    };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

async function writeStoreFile(data: PersistedLaunchSignoffs) {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function getLaunchSignoffStorePath() {
  return STORE_PATH;
}

export async function listLaunchSignoffs() {
  const data = await ensureStoreFile();
  return [...data.signoffs].sort((a, b) => b.signedAtIso.localeCompare(a.signedAtIso));
}

export async function saveLaunchSignoff(input: SaveLaunchSignoffInput) {
  const signerName = normalizeText(input.signerName);
  const signerEmail = normalizeEmail(input.signerEmail);
  const evidenceUrls = normalizeEvidenceUrls(input.evidenceUrls);
  const sectionId = normalizeText(input.sectionId);
  const role = input.role;
  const notes = input.notes ? normalizeText(input.notes) : undefined;

  if (!sectionId) throw new Error('sectionId is required');
  if (!signerName) throw new Error('signerName is required');
  if (!signerEmail) throw new Error('signerEmail is required');
  if (!evidenceUrls.length) throw new Error('at least one evidence URL is required');

  const signedAtIso = new Date().toISOString();
  const digestInput = JSON.stringify({
    sectionId,
    role,
    signerName,
    signerEmail,
    signedAtIso,
    evidenceUrls,
    notes: notes ?? '',
    attestationText: launchAttestationText,
  });

  const record: LaunchSignoffRecord = {
    sectionId,
    role,
    signerName,
    signerEmail,
    signedAtIso,
    attestationText: launchAttestationText,
    signatureDigest: createHash('sha256').update(digestInput).digest('hex'),
    evidenceUrls,
    notes,
  };

  const data = await ensureStoreFile();
  const retained = data.signoffs.filter(
    (item) =>
      !(
        item.sectionId === record.sectionId &&
        item.role === record.role &&
        item.signerEmail === record.signerEmail
      )
  );

  retained.unshift(record);
  await writeStoreFile({
    version: 1,
    signoffs: retained,
  });

  return record;
}