import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getJSON, setJSON } from '@/lib/persist';
import { STORAGE } from '@/lib/storage-keys';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemePref = 'system' | 'light' | 'dark';

type Ctx = {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  /** Esquema efetivo para componentes temáticos */
  scheme: 'light' | 'dark';
};

const ThemePreferenceContext = createContext<Ctx | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    getJSON<ThemePref>(STORAGE.THEME_PREF, 'system').then(setPrefState);
  }, []);

  const setPref = useCallback(async (p: ThemePref) => {
    setPrefState(p);
    await setJSON(STORAGE.THEME_PREF, p);
  }, []);

  const scheme = useMemo<'light' | 'dark'>(() => {
    if (pref === 'system') {
      return system === 'dark' ? 'dark' : 'light';
    }
    return pref;
  }, [pref, system]);

  const value = useMemo(() => ({ pref, setPref, scheme }), [pref, setPref, scheme]);

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference(): Ctx {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return ctx;
}

/** Para hooks que precisam funcionar fora do provider (fallback). */
export function useThemePreferenceOptional(): Ctx | null {
  return useContext(ThemePreferenceContext);
}
