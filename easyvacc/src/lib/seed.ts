import type { Employee, Posto, User, Vaccine } from '@/types/models';
import { getJSON, setJSON } from '@/lib/persist';
import { STORAGE } from '@/lib/storage-keys';

const DEFAULT_VACCINES: Vaccine[] = [
  {
    id: 'v1',
    name: 'COVID-19',
    manufacturer: 'Pfizer',
    doses: 'Reforço conforme calendário',
    category: 'geral',
    status: 'disponivel',
  },
  {
    id: 'v2',
    name: 'Influenza',
    manufacturer: 'Butantan',
    doses: 'Anual',
    category: 'idoso',
    status: 'disponivel',
  },
  {
    id: 'v3',
    name: 'Hepatite B',
    manufacturer: 'Fiocruz',
    doses: '3 doses',
    category: 'infantil',
    status: 'disponivel',
  },
  {
    id: 'v4',
    name: 'Febre amarela',
    manufacturer: 'Bio-Manguinhos',
    doses: 'Dose única + reforço se necessário',
    category: 'geral',
    status: 'disponivel',
  },
  {
    id: 'v5',
    name: 'Tríplice viral',
    manufacturer: 'SUS',
    doses: '2 doses',
    category: 'infantil',
    status: 'esgotado',
  },
];

/** Unidades inspiradas em postos reais de Saquarema/RJ (nomes e logradouros públicos; coordenadas aproximadas para o mapa). */
const DEFAULT_POSTOS: Posto[] = [
  {
    id: 'p1',
    name: 'ESF Barra Nova',
    address: 'Av. Litorânea, s/n — Barra Nova',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9292,
    lng: -42.5035,
    vaccineIds: ['v1', 'v2', 'v3', 'v4'],
  },
  {
    id: 'p2',
    name: 'ESF Bacaxá',
    address: 'Rua Alfredo Menezes, 980 — Bacaxá',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9195,
    lng: -42.5178,
    vaccineIds: ['v1', 'v2', 'v4'],
  },
  {
    id: 'p3',
    name: 'UBS Geraldo Ferreira de Souza',
    address: 'Rua Alfredo Menezes, 981 — Bacaxá',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9193,
    lng: -42.5181,
    vaccineIds: ['v2', 'v3', 'v5'],
  },
  {
    id: 'p4',
    name: 'ESF Jaconé (José Pereira de Brito)',
    address: 'Rua 97, 798 — Jaconé',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.9405,
    lng: -42.489,
    vaccineIds: ['v1', 'v2', 'v3', 'v4'],
  },
  {
    id: 'p5',
    name: 'ESF Vilatur',
    address: 'Av. Praia Ponta de Itapajé — Vilatur',
    cidade: 'Saquarema',
    uf: 'RJ',
    lat: -22.908,
    lng: -42.528,
    vaccineIds: ['v1', 'v2', 'v3', 'v5'],
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'admin@easyvacc.br',
    password: 'admin123',
    name: 'Administrador EasyVacc',
    role: 'admin',
  },
  {
    id: 'u-pac',
    email: 'paciente@easyvacc.br',
    password: '123456',
    name: 'Maria Paciente',
    role: 'paciente',
    cidade: 'Saquarema',
    uf: 'RJ',
  },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'João Silva',
    cargo: 'Enfermeiro',
    cpf: '000.000.000-00',
    phone: '(22) 90000-0001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    name: 'Ana Souza',
    cargo: 'Técnica de enfermagem',
    cpf: '111.111.111-11',
    phone: '(22) 90000-0002',
    createdAt: new Date().toISOString(),
  },
];

/** Aumentar quando os postos padrão mudarem (ex.: novo recorte geográfico). */
const CURRENT_POSTOS_VERSION = 2;

export async function ensureSeedData(): Promise<void> {
  const done = await getJSON<string | null>(STORAGE.INIT, null);
  if (done !== '1') {
    await setJSON(STORAGE.USERS, DEFAULT_USERS);
    await setJSON(STORAGE.VACCINES, DEFAULT_VACCINES);
    await setJSON(STORAGE.POSTOS, DEFAULT_POSTOS);
    await setJSON(STORAGE.EMPLOYEES, DEFAULT_EMPLOYEES);
    await setJSON(STORAGE.INIT, '1');
    await setJSON(STORAGE.POSTOS_VERSION, CURRENT_POSTOS_VERSION);
  } else {
    const pv = await getJSON<number>(STORAGE.POSTOS_VERSION, 0);
    if (pv < CURRENT_POSTOS_VERSION) {
      await setJSON(STORAGE.POSTOS, DEFAULT_POSTOS);
      await setJSON(STORAGE.POSTOS_VERSION, CURRENT_POSTOS_VERSION);
    }
  }
}
