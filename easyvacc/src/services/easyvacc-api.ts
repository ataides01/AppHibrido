import { getJSON, setJSON } from '@/lib/persist';
import { STORAGE } from '@/lib/storage-keys';
import { getApiBaseUrl } from '@/lib/api-config';
import type { Employee, HistoryEntry, Posto, User, UserRole, Vaccine } from '@/types/models';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiUser = {
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

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    password: '',
    name: u.name,
    role: u.role as UserRole,
    mustChangePassword: u.mustChangePassword,
    employeeId: u.employeeId,
    avatarUri: u.avatarUri,
    cep: u.cep,
    logradouro: u.logradouro,
    bairro: u.bairro,
    cidade: u.cidade,
    uf: u.uf,
  };
}

async function getToken(): Promise<string | null> {
  return getJSON<string | null>(STORAGE.API_TOKEN, null);
}

export async function setApiToken(token: string | null): Promise<void> {
  if (token == null) {
    await setJSON(STORAGE.API_TOKEN, null);
  } else {
    await setJSON(STORAGE.API_TOKEN, token);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API não configurada (EXPO_PUBLIC_API_URL).');

  const headers = new Headers(init?.headers);
  const token = await getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body: BodyInit | undefined = init?.body ?? undefined;
  if (init?.json !== undefined) {
    body = JSON.stringify(init.json);
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${base}/api${path}`, {
      ...init,
      headers,
      body,
    });
  } catch {
    throw new Error(
      `Não foi possível conectar na API em ${base}. Verifique se a easyvacc-api está rodando e, no celular, use o IP da máquina em EXPO_PUBLIC_API_URL (não 127.0.0.1).`
    );
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(msg || `Erro HTTP ${res.status}`, res.status);
  }

  return data as T;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ user: User; mustChangePassword: boolean }> {
  const data = await request<{
    token: string;
    user: ApiUser;
    mustChangePassword?: boolean;
  }>('/auth/login', { method: 'POST', json: { email, password } });
  await setApiToken(data.token);
  return {
    user: mapApiUser(data.user),
    mustChangePassword: data.mustChangePassword === true,
  };
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const data = await request<{ token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    json: { name, email, password },
  });
  await setApiToken(data.token);
  return mapApiUser(data.user);
}

export async function apiGetMe(): Promise<User> {
  const data = await request<{ user: ApiUser }>('/me', { method: 'GET' });
  return mapApiUser(data.user);
}

export async function apiPatchMe(
  patch: Partial<
    Pick<User, 'name' | 'avatarUri' | 'cep' | 'logradouro' | 'bairro' | 'cidade' | 'uf'>
  >
): Promise<User> {
  const data = await request<{ user: ApiUser }>('/me', { method: 'PATCH', json: patch });
  return mapApiUser(data.user);
}

export async function apiFirstPassword(newPassword: string): Promise<User> {
  const data = await request<{ user: ApiUser }>('/me/first-password', {
    method: 'POST',
    json: { newPassword },
  });
  return mapApiUser(data.user);
}

export async function apiFetchVaccines(): Promise<Vaccine[]> {
  const data = await request<{ vaccines: Vaccine[] }>('/vaccines', { method: 'GET' });
  return data.vaccines;
}

export async function apiFetchPostos(): Promise<Posto[]> {
  const data = await request<{ postos: Posto[] }>('/postos', { method: 'GET' });
  return data.postos;
}

export async function apiFetchEmployees(): Promise<Employee[]> {
  const data = await request<{ employees: Employee[] }>('/employees', { method: 'GET' });
  return data.employees;
}

export async function apiPutVaccines(list: Vaccine[]): Promise<Vaccine[]> {
  const data = await request<{ vaccines: Vaccine[] }>('/vaccines', {
    method: 'PUT',
    json: list,
  });
  return data.vaccines;
}

export async function apiPutPostos(list: Posto[]): Promise<Posto[]> {
  const data = await request<{ postos: Posto[] }>('/postos', {
    method: 'PUT',
    json: list,
  });
  return data.postos;
}

export async function apiCreateEmployeeSolo(params: {
  name: string;
  cargo: string;
  cpf: string;
  phone: string;
}): Promise<Employee> {
  const data = await request<{ employee: Employee }>('/employees', {
    method: 'POST',
    json: params,
  });
  return data.employee;
}

export async function apiCreateEmployeeWithLogin(params: {
  name: string;
  cargo: string;
  cpf: string;
  phone: string;
  email: string;
}): Promise<{ employee: Employee; provisionalPassword: string }> {
  const data = await request<{ employee: Employee; provisionalPassword: string }>(
    '/employees/with-login',
    { method: 'POST', json: params }
  );
  return data;
}

export async function apiDeleteEmployee(id: string): Promise<void> {
  await request<unknown>(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function apiGetFavorites(): Promise<string[]> {
  const data = await request<{ ids: string[] }>('/me/favorites', { method: 'GET' });
  return data.ids;
}

export async function apiToggleFavorite(postoId: string): Promise<string[]> {
  const data = await request<{ ids: string[] }>('/me/favorites/toggle', {
    method: 'POST',
    json: { postoId },
  });
  return data.ids;
}

export async function apiGetHistory(): Promise<HistoryEntry[]> {
  const data = await request<{ history: HistoryEntry[] }>('/me/history', { method: 'GET' });
  return data.history;
}

export async function apiPostHistory(label: string): Promise<HistoryEntry[]> {
  const data = await request<{ history: HistoryEntry[] }>('/me/history', {
    method: 'POST',
    json: { label },
  });
  return data.history;
}
