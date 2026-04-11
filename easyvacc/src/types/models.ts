export type UserRole = 'admin' | 'paciente' | 'funcionario';

export type VaccineCategory = 'adulto' | 'infantil' | 'idoso' | 'geral';

export type VaccineStatus = 'disponivel' | 'esgotado';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  /** Após primeiro acesso com senha provisória (funcionário), deve trocar a senha. */
  mustChangePassword?: boolean;
  /** Vínculo com registro de funcionário (quando criado pela gestão). */
  employeeId?: string;
  avatarUri?: string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  doses: string;
  category: VaccineCategory;
  status: VaccineStatus;
}

export interface Posto {
  id: string;
  name: string;
  address: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  vaccineIds: string[];
}

export interface Employee {
  id: string;
  name: string;
  cargo: string;
  cpf: string;
  phone: string;
  createdAt: string;
  /** Conta de acesso ao app, se criada pelo admin. */
  userId?: string;
  /** E-mail do login (cópia para exibição; a fonte da verdade é o User). */
  loginEmail?: string;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  label: string;
  at: string;
}

/** Dose registrada na carteira (demonstração local). */
export interface CarteiraDose {
  vaccineId: string;
  appliedAt: string;
  lote?: string;
}

/** Registro de aplicação feito pelo admin (demonstração). */
export interface VaccineApplicationRecord {
  id: string;
  vaccineId: string;
  vaccineName: string;
  patientUserId: string | null;
  patientName: string;
  appliedAt: string;
  lote?: string;
}
