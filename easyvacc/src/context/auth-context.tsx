import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createId } from '@/lib/id';
import { generateProvisionalPassword } from '@/lib/password';
import { getJSON, setJSON } from '@/lib/persist';
import { ensureSeedData } from '@/lib/seed';
import { STORAGE } from '@/lib/storage-keys';
import type { Employee, HistoryEntry, Posto, User, Vaccine } from '@/types/models';

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (patch: Partial<Omit<User, 'id' | 'role'>>) => Promise<void>;
  /** Troca senha no primeiro acesso (senha provisória de funcionário). */
  completeFirstLoginPasswordChange: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  /** Admin: cria funcionário + usuário com senha provisória (e-mail simulado no app). */
  createEmployeeWithLogin: (params: {
    name: string;
    cargo: string;
    cpf: string;
    phone: string;
    email: string;
  }) => Promise<{ ok: boolean; error?: string; provisionalPassword?: string }>;
  removeEmployee: (employeeId: string) => Promise<void>;
  isAdmin: boolean;
  /** Dados */
  vaccines: Vaccine[];
  postos: Posto[];
  employees: Employee[];
  refreshData: () => Promise<void>;
  saveVaccines: (list: Vaccine[]) => Promise<void>;
  savePostos: (list: Posto[]) => Promise<void>;
  saveEmployees: (list: Employee[]) => Promise<void>;
  favoritesPostoIds: string[];
  toggleFavoritePosto: (postoId: string) => Promise<void>;
  addHistory: (label: string) => Promise<void>;
  history: HistoryEntry[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUsers(): Promise<User[]> {
  return getJSON<User[]>(STORAGE.USERS, []);
}

async function saveUsers(users: User[]): Promise<void> {
  await setJSON(STORAGE.USERS, users);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [favoritesPostoIds, setFavoritesPostoIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const refreshData = useCallback(async () => {
    const [v, p, e] = await Promise.all([
      getJSON<Vaccine[]>(STORAGE.VACCINES, []),
      getJSON<Posto[]>(STORAGE.POSTOS, []),
      getJSON<Employee[]>(STORAGE.EMPLOYEES, []),
    ]);
    setVaccines(v);
    setPostos(p);
    setEmployees(e);
  }, []);

  const loadUserHistory = useCallback(async (userId: string) => {
    const h = await getJSON<HistoryEntry[]>(`${STORAGE.HISTORY_PREFIX}${userId}`, []);
    setHistory(h);
  }, []);

  const loadSession = useCallback(async () => {
    await ensureSeedData();
    const userId = await getJSON<string | null>(STORAGE.SESSION_USER_ID, null);
    const users = await loadUsers();
    if (userId) {
      const u = users.find((x) => x.id === userId) ?? null;
      if (!u) {
        await setJSON(STORAGE.SESSION_USER_ID, null);
      }
      setUser(u);
      if (u) {
        const fav = await getJSON<string[]>(`${STORAGE.FAVORITES_PREFIX}${u.id}`, []);
        setFavoritesPostoIds(fav);
        await loadUserHistory(u.id);
      } else {
        setFavoritesPostoIds([]);
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
    await refreshData();
    setReady(true);
  }, [refreshData, loadUserHistory]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const persistFavorites = useCallback(async (uid: string, ids: string[]) => {
    await setJSON(`${STORAGE.FAVORITES_PREFIX}${uid}`, ids);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = await loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.password !== password) {
      return { ok: false, error: 'E-mail ou senha inválidos.' };
    }
    await setJSON(STORAGE.SESSION_USER_ID, found.id);
    setUser(found);
    const fav = await getJSON<string[]>(`${STORAGE.FAVORITES_PREFIX}${found.id}`, []);
    setFavoritesPostoIds(fav);
    await loadUserHistory(found.id);
    await refreshData();
    return { ok: true, mustChangePassword: found.mustChangePassword === true };
  }, [refreshData, loadUserHistory]);

  const logout = useCallback(async () => {
    await setJSON(STORAGE.SESSION_USER_ID, null);
    setUser(null);
    setFavoritesPostoIds([]);
    setHistory([]);
    /** Próximo frame: evita corrida com o layout em grupo (tabs) ao sair para trocar de conta. */
    const go = () => router.replace('/login');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(go);
    } else {
      setTimeout(go, 0);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = await loadUsers();
    const em = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === em)) {
      return { ok: false, error: 'Este e-mail já está cadastrado.' };
    }
    const nu: User = {
      id: createId(),
      email: em,
      password,
      name: name.trim(),
      role: 'paciente',
      mustChangePassword: false,
    };
    const next = [...users, nu];
    await saveUsers(next);
    await setJSON(STORAGE.SESSION_USER_ID, nu.id);
    setUser(nu);
    setFavoritesPostoIds([]);
    setHistory([]);
    await refreshData();
    return { ok: true };
  }, [refreshData]);

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, 'id' | 'role'>>) => {
      if (!user) return;
      const users = await loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx < 0) return;
      const updated = { ...users[idx], ...patch };
      const next = [...users];
      next[idx] = updated;
      await saveUsers(next);
      setUser(updated);
    },
    [user]
  );

  const saveVaccines = useCallback(async (list: Vaccine[]) => {
    await setJSON(STORAGE.VACCINES, list);
    setVaccines(list);
  }, []);

  const savePostos = useCallback(async (list: Posto[]) => {
    await setJSON(STORAGE.POSTOS, list);
    setPostos(list);
  }, []);

  const saveEmployees = useCallback(async (list: Employee[]) => {
    await setJSON(STORAGE.EMPLOYEES, list);
    setEmployees(list);
  }, []);

  const completeFirstLoginPasswordChange = useCallback(
    async (newPassword: string) => {
      if (!user?.mustChangePassword) {
        return { ok: false, error: 'Não é necessário alterar a senha agora.' };
      }
      if (newPassword.length < 6) {
        return { ok: false, error: 'Use pelo menos 6 caracteres.' };
      }
      const users = await loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx < 0) return { ok: false, error: 'Usuário não encontrado.' };
      const updated: User = {
        ...users[idx],
        password: newPassword,
        mustChangePassword: false,
      };
      const next = [...users];
      next[idx] = updated;
      await saveUsers(next);
      setUser(updated);
      return { ok: true };
    },
    [user]
  );

  const createEmployeeWithLogin = useCallback(
    async (params: {
      name: string;
      cargo: string;
      cpf: string;
      phone: string;
      email: string;
    }) => {
      const em = params.email.trim().toLowerCase();
      if (!em || !em.includes('@')) {
        return { ok: false, error: 'Informe um e-mail válido para o acesso.' };
      }
      const users = await loadUsers();
      if (users.some((u) => u.email.toLowerCase() === em)) {
        return { ok: false, error: 'Este e-mail já está cadastrado.' };
      }
      const empId = createId();
      const usrId = createId();
      const provisional = generateProvisionalPassword();

      const employee: Employee = {
        id: empId,
        name: params.name.trim(),
        cargo: params.cargo.trim(),
        cpf: params.cpf.trim() || '—',
        phone: params.phone.trim() || '—',
        createdAt: new Date().toISOString(),
        userId: usrId,
        loginEmail: em,
      };

      const newUser: User = {
        id: usrId,
        email: em,
        password: provisional,
        name: params.name.trim(),
        role: 'funcionario',
        mustChangePassword: true,
        employeeId: empId,
      };

      const emplist = await getJSON<Employee[]>(STORAGE.EMPLOYEES, []);
      await saveUsers([...users, newUser]);
      await saveEmployees([employee, ...emplist]);
      return { ok: true, provisionalPassword: provisional };
    },
    [saveEmployees]
  );

  const removeEmployee = useCallback(
    async (employeeId: string) => {
      const emplist = await getJSON<Employee[]>(STORAGE.EMPLOYEES, []);
      const e = emplist.find((x) => x.id === employeeId);
      if (!e) return;
      const next = emplist.filter((x) => x.id !== employeeId);
      await saveEmployees(next);
      if (e.userId) {
        const users = await loadUsers();
        await saveUsers(users.filter((u) => u.id !== e.userId));
      }
    },
    [saveEmployees]
  );

  const toggleFavoritePosto = useCallback(
    async (postoId: string) => {
      if (!user) return;
      const set = new Set(favoritesPostoIds);
      if (set.has(postoId)) set.delete(postoId);
      else set.add(postoId);
      const arr = [...set];
      setFavoritesPostoIds(arr);
      await persistFavorites(user.id, arr);
    },
    [user, favoritesPostoIds, persistFavorites]
  );

  const addHistory = useCallback(async (label: string) => {
    if (!user) return;
    const key = `${STORAGE.HISTORY_PREFIX}${user.id}`;
    const prev = await getJSON<HistoryEntry[]>(key, []);
    const entry: HistoryEntry = {
      id: createId(),
      userId: user.id,
      label,
      at: new Date().toISOString(),
    };
    const next = [entry, ...prev].slice(0, 40);
    setHistory(next);
    await setJSON(key, next);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      login,
      logout,
      register,
      updateProfile,
      completeFirstLoginPasswordChange,
      createEmployeeWithLogin,
      removeEmployee,
      isAdmin: user?.role === 'admin',
      vaccines,
      postos,
      employees,
      refreshData,
      saveVaccines,
      savePostos,
      saveEmployees,
      favoritesPostoIds,
      toggleFavoritePosto,
      addHistory,
      history,
    }),
    [
      ready,
      user,
      login,
      logout,
      register,
      updateProfile,
      completeFirstLoginPasswordChange,
      createEmployeeWithLogin,
      removeEmployee,
      vaccines,
      postos,
      employees,
      refreshData,
      saveVaccines,
      savePostos,
      saveEmployees,
      favoritesPostoIds,
      toggleFavoritePosto,
      addHistory,
      history,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
