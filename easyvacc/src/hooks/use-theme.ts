import { Colors } from '@/constants/theme';
import { useThemePreferenceOptional } from '@/context/theme-preference-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const pref = useThemePreferenceOptional();
  const fallback = useColorScheme();
  const scheme =
    pref?.scheme ??
    (fallback === 'dark' ? 'dark' : fallback === 'light' ? 'light' : 'light');
  return Colors[scheme];
}
