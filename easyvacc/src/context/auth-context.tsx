import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isApiMode } from '@/lib/api-config';
import { createId } from '@/lib/id';
import { generateProvisionalPassword } from '@/lib/password';
import { getJSON, setJSON } from '@/lib/persist';
import { ensureSeedData } from '@/lib/seed';
import { STORAGE } from '@/lib/storage-keys';
import {
  apiCreateEmployeeSolo,
  apiCreateEmployeeWithLogin,
  apiDeleteEmployee,
  apiFetchEmployees,
  apiFetchPostos,
  apiFetchVaccines,
  apiFirstPassword,
  apiGetFavorites,
  apiGetHistory,
  apiGetMe,
  apiLogin,
  apiPatchMe,
  apiPostHistory,
  apiPutPostos,
  apiPutVaccines,
  apiRegister,
  apiToggleFavorite,
  setApiToken,
} from '@/services/easyvacc-api';
import type { Employee, HistoryEntry, Posto, User, UserRole, Vaccine } from '@/types/models';

type AuthContextValue = {
  ready: boolean;
  /** true quando `EXPO_PUBLIC_API_URL` está definido — dados vêm da easyvacc-api. */
  apiMode: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (patch: Partial<Omit<User, 'id' | 'role'>>) => Promise<void>;
  completeFirstLoginPasswordChange: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  createEmployeeWithLogin: (params: {
    name: string;
    cargo: string;
    cpf: string;
    phone: string;
    email: string;
  }) => Promise<{ ok: boolean; error?: string; provisionalPassword?: string }>;
  /** Cadastra profissional sem login (equivale ao fluxo “só lista” no modo local). */
  addEmployeeSolo: (params: {
    name: string;
    cargo: string;
    cpf: string;
    phone: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  removeEmployee: (employeeId: string) => Promise<void>;
  isAdmin: boolean;
  vaccines: Vaccine[];
  postos: Posto[];
  employees: Employee[];
  /** Opcional: força papel (ex.: logo após login). */
  refreshData: (roleOverride?: UserRole | null) => Promise<void>;
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
  const apiMode = isApiMode();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [favoritesPostoIds, setFavoritesPostoIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const refreshData = useCallback(
    async (roleOverride?: UserRole | null) => {
      if (apiMode) {
        const effectiveRole = roleOverride !== undefined ? roleOverride : user?.role ?? null;
        try {
          const [v, p] = await Promise.all([apiFetchVaccines(), apiFetchPostos()]);
          setVaccines(v);
          setPostos(p);
          if (effectiveRole === 'admin') {
            const e = await apiFetchEmployees();
            setEmployees(e);
          } else {
            setEmployees([]);
          }
        } catch {
          setVaccines([]);
          setPostos([]);
          setEmployees([]);
        }
        return;
      }
      const [v, p, e] = await Promise.all([
        getJSON<Vaccine[]>(STORAGE.VACCINES, []),
        getJSON<Posto[]>(STORAGE.POSTOS, []),
        getJSON<Employee[]>(STORAGE.EMPLOYEES, []),
      ]);
      setVaccines(v);
      setPostos(p);
      setEmployees(e);
    },
    [apiMode, user?.role]
  );

  const loadUserHistory = useCallback(async (userId: string) => {
    const h = await getJSON<HistoryEntry[]>(`${STORAGE.HISTORY_PREFIX}${userId}`, []);
    setHistory(h);
  }, []);

  const loadSession = useCallback(async () => {
    if (apiMode) {
      const token = await getJSON<string | null>(STORAGE.API_TOKEN, null);
      let u: User | null = null;
      if (token) {
        try {
          u = await apiGetMe();
          setUser(u);
          const [fav, hist] = await Promise.all([apiGetFavorites(), apiGetHistory()]);
          setFavoritesPostoIds(fav);
          setHistory(hist);
        } catch {
          await setApiToken(null);
          setUser(null);
          setFavoritesPostoIds([]);
          setHistory([]);
        }
      } else {
        setUser(null);
        setFavoritesPostoIds([]);
        setHistory([]);
      }
      await refreshData(u?.role ?? null);
      setReady(true);
      return;
    }

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
  }, [apiMode, refreshData, loadUserHistory]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const persistFavorites = useCallback(async (uid: string, ids: string[]) => {
    await setJSON(`${STORAGE.FAVORITES_PREFIX}${uid}`, ids);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (apiMode) {
        try {
          const { user: u, mustChangePassword } = await apiLogin(email, password);
          await setJSON(STORAGE.SESSION_USER_ID, null);
          setUser(u);
          const [fav, hist] = await Promise.all([apiGetFavorites(), apiGetHistory()]);
          setFavoritesPostoIds(fav);
          setHistory(hist);
          await refreshData(u.role);
          return { ok: true as const, mustChangePassword };
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Não foi possível entrar.';
          return { ok: false as const, error: msg };
        }
      }
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
    },
    [apiMode, refreshData, loadUserHistory]
  );

  const logout = useCallback(async () => {
    if (apiMode) {
      await setApiToken(null);
    }
    await setJSON(STORAGE.SESSION_USER_ID, null);
    setUser(null);
    setFavoritesPostoIds([]);
    setHistory([]);
    const go = () => router.replace('/login');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(go);
    } else {
      setTimeout(go, 0);
    }
  }, [apiMode]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (apiMode) {
        try {
          const u = await apiRegister(name, email, password);
          setUser(u);
          setFavoritesPostoIds([]);
          setHistory([]);
          await refreshData(u.role);
          return { ok: true as const };
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Não foi possível cadastrar.';
          return { ok: false as const, error: msg };
        }
      }
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
    },
    [apiMode, refreshData]
  );

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, 'id' | 'role'>>) => {
      if (!user) return;
      if (apiMode) {
        const u = await apiPatchMe(patch);
        setUser(u);
        return;
      }
      const users = await loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx < 0) return;
      const updated = { ...users[idx], ...patch };
      const next = [...users];
      next[idx] = updated;
      await saveUsers(next);
      setUser(updated);
    },
    [user, apiMode]
  );

  const saveVaccines = useCallback(
    async (list: Vaccine[]) => {
      if (apiMode) {
        const next = await apiPutVaccines(list);
        setVaccines(next);
        return;
      }
      await setJSON(STORAGE.VACCINES, list);
      setVaccines(list);
    },
    [apiMode]
  );

  const savePostos = useCallback(
    async (list: Posto[]) => {
      if (apiMode) {
        const next = await apiPutPostos(list);
        setPostos(next);
        return;
      }
      await setJSON(STORAGE.POSTOS, list);
      setPostos(list);
    },
    [apiMode]
  );

  const saveEmployees = useCallback(
    async (list: Employee[]) => {
      if (apiMode) {
        await refreshData(user?.role ?? null);
        return;
      }
      await setJSON(STORAGE.EMPLOYEES, list);
      setEmployees(list);
    },
    [apiMode, user?.role, refreshData]
  );

  const completeFirstLoginPasswordChange = useCallback(
    async (newPassword: string) => {
      if (apiMode) {
        if (!user?.mustChangePassword) {
          return { ok: false, error: 'Não é necessário alterar a senha agora.' };
        }
        if (newPassword.length < 6) {
          return { ok: false, error: 'Use pelo menos 6 caracteres.' };
        }
        try {
          const u = await apiFirstPassword(newPassword);
          setUser(u);
          return { ok: true };
        } catch (e: unknown) {
          return { ok: false, error: e instanceof Error ? e.message : 'Falha ao alterar senha.' };
        }
      }
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
    [user, apiMode]
  );

  const createEmployeeWithLogin = useCallback(
    async (params: {
      name: string;
      cargo: string;
      cpf: string;
      phone: string;
      email: string;
    }) => {
      if (apiMode) {
        try {
          const { provisionalPassword } = await apiCreateEmployeeWithLogin({
            name: params.name.trim(),
            cargo: params.cargo.trim(),
            cpf: params.cpf,
            phone: params.phone,
            email: params.email.trim(),
          });
          await refreshData('admin');
          return { ok: true as const, provisionalPassword };
        } catch (e: unknown) {
          return {
            ok: false as const,
            error: e instanceof Error ? e.message : 'Não foi possível criar o acesso.',
          };
        }
      }
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
      await setJSON(STORAGE.EMPLOYEES, [employee, ...emplist]);
      setEmployees([employee, ...emplist]);
      return { ok: true, provisionalPassword: provisional };
    },
    [apiMode, refreshData]
  );

  const addEmployeeSolo = useCallback(
    async (params: { name: string; cargo: string; cpf: string; phone: string }) => {
      if (apiMode) {
        try {
          await apiCreateEmployeeSolo({
            name: params.name.trim(),
            cargo: params.cargo.trim(),
            cpf: params.cpf,
            phone: params.phone,
          });
          await refreshData('admin');
          return { ok: true as const };
        } catch (e: unknown) {
          return {
            ok: false as const,
            error: e instanceof Error ? e.message : 'Não foi possível salvar.',
          };
        }
      }
      const e: Employee = {
        id: createId(),
        name: params.name.trim(),
        cargo: params.cargo.trim(),
        cpf: params.cpf.trim() || '—',
        phone: params.phone.trim() || '—',
        createdAt: new Date().toISOString(),
      };
      const emplist = await getJSON<Employee[]>(STORAGE.EMPLOYEES, []);
      const next = [e, ...emplist];
      await setJSON(STORAGE.EMPLOYEES, next);
      setEmployees(next);
      return { ok: true };
    },
    [apiMode, refreshData]
  );

  const removeEmployee = useCallback(
    async (employeeId: string) => {
      if (apiMode) {
        await apiDeleteEmployee(employeeId);
        await refreshData('admin');
        return;
      }
      const emplist = await getJSON<Employee[]>(STORAGE.EMPLOYEES, []);
      const e = emplist.find((x) => x.id === employeeId);
      if (!e) return;
      const next = emplist.filter((x) => x.id !== employeeId);
      await setJSON(STORAGE.EMPLOYEES, next);
      setEmployees(next);
      if (e.userId) {
        const users = await loadUsers();
        await saveUsers(users.filter((u) => u.id !== e.userId));
      }
    },
    [apiMode, refreshData]
  );

  const toggleFavoritePosto = useCallback(
    async (postoId: string) => {
      if (!user) return;
      if (apiMode) {
        const ids = await apiToggleFavorite(postoId);
        setFavoritesPostoIds(ids);
        return;
      }
      const set = new Set(favoritesPostoIds);
      if (set.has(postoId)) set.delete(postoId);
      else set.add(postoId);
      const arr = [...set];
      setFavoritesPostoIds(arr);
      await persistFavorites(user.id, arr);
    },
    [user, favoritesPostoIds, persistFavorites, apiMode]
  );

  const addHistory = useCallback(
    async (label: string) => {
      if (!user) return;
      if (apiMode) {
        const h = await apiPostHistory(label);
        setHistory(h);
        return;
      }
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
    },
    [user, apiMode]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      apiMode,
      user,
      login,
      logout,
      register,
      updateProfile,
      completeFirstLoginPasswordChange,
      createEmployeeWithLogin,
      addEmployeeSolo,
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
      apiMode,
      user,
      login,
      logout,
      register,
      updateProfile,
      completeFirstLoginPasswordChange,
      createEmployeeWithLogin,
      addEmployeeSolo,
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
