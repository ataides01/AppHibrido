import type { Employee, Posto, User, Vaccine } from '@prisma/client';

export type UserPublic = {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword?: boolean;
  employeeId?: string;
  avatarUri?: string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

export function userToPublic(
  u: User & { employee?: Employee | null }
): UserPublic {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    mustChangePassword: u.mustChangePassword,
    employeeId: u.employee?.id,
    avatarUri: u.avatarUri ?? undefined,
    cep: u.cep ?? undefined,
    logradouro: u.logradouro ?? undefined,
    bairro: u.bairro ?? undefined,
    cidade: u.cidade ?? undefined,
    uf: u.uf ?? undefined,
  };
}

export type VaccineDto = {
  id: string;
  name: string;
  manufacturer: string;
  doses: string;
  category: string;
  status: string;
};

export function vaccineToDto(v: Vaccine): VaccineDto {
  return {
    id: v.id,
    name: v.name,
    manufacturer: v.manufacturer,
    doses: v.doses,
    category: v.category,
    status: v.status,
  };
}

export type PostoDto = {
  id: string;
  name: string;
  address: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  vaccineIds: string[];
};

export function postoToDto(
  p: Posto & { vaccines: { vaccineId: string }[] }
): PostoDto {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    cidade: p.cidade,
    uf: p.uf,
    lat: p.lat,
    lng: p.lng,
    vaccineIds: p.vaccines.map((x) => x.vaccineId),
  };
}

export type EmployeeDto = {
  id: string;
  name: string;
  cargo: string;
  cpf: string;
  phone: string;
  createdAt: string;
  userId?: string;
  loginEmail?: string;
};

export function employeeToDto(e: Employee): EmployeeDto {
  return {
    id: e.id,
    name: e.name,
    cargo: e.cargo,
    cpf: e.cpf,
    phone: e.phone,
    createdAt: e.createdAt.toISOString(),
    userId: e.userId ?? undefined,
    loginEmail: e.loginEmail ?? undefined,
  };
}

export type HistoryEntryDto = {
  id: string;
  userId: string;
  label: string;
  at: string;
};

export function historyToDto(h: {
  id: string;
  userId: string;
  label: string;
  at: Date;
}): HistoryEntryDto {
  return {
    id: h.id,
    userId: h.userId,
    label: h.label,
    at: h.at.toISOString(),
  };
}
