import { createId } from '@/lib/id';
import { getJSON, setJSON } from '@/lib/persist';
import { STORAGE } from '@/lib/storage-keys';
import type { CarteiraDose, User, Vaccine, VaccineApplicationRecord } from '@/types/models';

type WalletStored = {
  completed: CarteiraDose[];
};

const SEED_APPLICATIONS: Omit<VaccineApplicationRecord, 'id'>[] = [
  {
    vaccineId: 'v1',
    vaccineName: 'COVID-19',
    patientUserId: 'u-pac',
    patientName: 'Maria Paciente',
    appliedAt: new Date(2025, 0, 8, 9, 30).toISOString(),
    lote: 'PFZ-2025-A01',
  },
  {
    vaccineId: 'v2',
    vaccineName: 'Influenza',
    patientUserId: null,
    patientName: 'José da Silva (demo)',
    appliedAt: new Date(2025, 2, 14, 14, 0).toISOString(),
    lote: 'BUT-2025-IN',
  },
  {
    vaccineId: 'v3',
    vaccineName: 'Hepatite B',
    patientUserId: null,
    patientName: 'Ana Costa (demo)',
    appliedAt: new Date(2024, 8, 3, 10, 15).toISOString(),
    lote: 'FIO-HB-8821',
  },
];

function defaultWalletForCatalog(vaccines: Vaccine[]): WalletStored {
  const ids = vaccines.map((v) => v.id);
  const pick = (i: number) => ids[Math.min(i, ids.length - 1)];

  const completed: CarteiraDose[] = [];
  if (ids.length >= 2) {
    completed.push({
      vaccineId: pick(1),
      appliedAt: new Date(2024, 4, 10).toISOString(),
      lote: 'LOT-BR-9981',
    });
  }
  if (ids.length >= 4) {
    completed.push({
      vaccineId: pick(3),
      appliedAt: new Date(2023, 10, 15).toISOString(),
      lote: 'LOT-BR-4410',
    });
  }

  return { completed: completed.filter((c) => ids.includes(c.vaccineId)) };
}

export function pendingFromCatalog(vaccines: Vaccine[], completed: CarteiraDose[]): Vaccine[] {
  const done = new Set(completed.map((c) => c.vaccineId));
  return vaccines.filter((v) => !done.has(v.id));
}

export async function loadWallet(userId: string, vaccines: Vaccine[]): Promise<WalletStored> {
  const key = `${STORAGE.WALLET_PREFIX}${userId}`;
  const raw = await getJSON<WalletStored | null>(key, null);
  if (raw?.completed && Array.isArray(raw.completed)) {
    return raw;
  }
  const seed = defaultWalletForCatalog(vaccines);
  await setJSON(key, seed);
  return seed;
}

export async function saveWallet(userId: string, wallet: WalletStored): Promise<void> {
  await setJSON(`${STORAGE.WALLET_PREFIX}${userId}`, wallet);
}

/** Adiciona dose na carteira do paciente (ex.: após registrar aplicação). */
export async function addDoseToWallet(
  patientUserId: string,
  dose: CarteiraDose,
  vaccines: Vaccine[]
): Promise<void> {
  const w = await loadWallet(patientUserId, vaccines);
  const withoutDup = w.completed.filter((c) => c.vaccineId !== dose.vaccineId);
  await saveWallet(patientUserId, { completed: [dose, ...withoutDup] });
}

export async function loadApplications(): Promise<VaccineApplicationRecord[]> {
  const list = await getJSON<VaccineApplicationRecord[] | null>(STORAGE.VACCINE_APPLICATIONS, null);
  if (list?.length) return list;
  const seeded: VaccineApplicationRecord[] = SEED_APPLICATIONS.map((r) => ({
    ...r,
    id: createId(),
  }));
  await setJSON(STORAGE.VACCINE_APPLICATIONS, seeded);
  return seeded;
}

export async function saveApplications(rows: VaccineApplicationRecord[]): Promise<void> {
  await setJSON(STORAGE.VACCINE_APPLICATIONS, rows);
}

/** Pacientes cadastrados no app (modo local) para o formulário de aplicação. */
export async function listPacientesUsers(): Promise<{ id: string; name: string }[]> {
  const users = await getJSON<User[]>(STORAGE.USERS, []);
  return users.filter((u) => u.role === 'paciente').map((u) => ({ id: u.id, name: u.name }));
}

export async function registerApplication(params: {
  vaccine: Vaccine;
  patientUserId: string | null;
  patientName: string;
  lote?: string;
  vaccinesCatalog: Vaccine[];
}): Promise<VaccineApplicationRecord> {
  const row: VaccineApplicationRecord = {
    id: createId(),
    vaccineId: params.vaccine.id,
    vaccineName: params.vaccine.name,
    patientUserId: params.patientUserId,
    patientName: params.patientName.trim(),
    appliedAt: new Date().toISOString(),
    lote: params.lote?.trim() || undefined,
  };
  const prev = await loadApplications();
  await saveApplications([row, ...prev]);

  if (params.patientUserId) {
    await addDoseToWallet(
      params.patientUserId,
      {
        vaccineId: params.vaccine.id,
        appliedAt: row.appliedAt,
        lote: row.lote,
      },
      params.vaccinesCatalog
    );
  }

  return row;
}
