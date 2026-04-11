import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PAGE_BG_LIGHT, SHELL_BLUE, SIDEBAR_BREAKPOINT, SIDEBAR_WIDTH } from '@/components/shell/constants';
import { useAuth } from '@/context/auth-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NavItem = { href: string; label: string; icon: keyof typeof Ionicons.glyphMap; adminOnly?: boolean };

const MENU: NavItem[] = [
  { href: '/home', label: 'Dashboard', icon: 'grid-outline' },
  { href: '/vacinas', label: 'Vacinas', icon: 'medkit-outline' },
  { href: '/postos', label: 'Postos de saúde', icon: 'location-outline' },
  { href: '/funcionarios', label: 'Gestão da equipe', icon: 'briefcase-outline', adminOnly: true },
  { href: '/perfil', label: 'Perfil', icon: 'person-outline' },
  { href: '/info', label: 'Sobre / FAQ', icon: 'help-circle-outline' },
];

function SidebarNav({
  isAdmin,
  pathname,
  onNavigate,
}: {
  isAdmin: boolean;
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  const items = useMemo(() => MENU.filter((m) => !m.adminOnly || isAdmin), [isAdmin]);

  return (
    <View style={styles.sidebarInner}>
      <View style={styles.brand}>
        <View style={styles.brandRow}>
          <View style={styles.syringeBg}>
            <Ionicons name="medical-outline" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>EasyVacc</Text>
            <Text style={styles.brandSub}>{isAdmin ? 'Admin' : 'Portal'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.menuLabel}>Menu principal</Text>
      <ScrollView style={styles.navScroll} contentContainerStyle={styles.navScrollContent} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/home' && pathname.startsWith(item.href));
          return (
            <Pressable
              key={item.href}
              onPress={() => onNavigate(item.href)}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && { opacity: 0.88 },
              ]}>
              <Ionicons name={item.icon} size={20} color={active ? SHELL_BLUE : 'rgba(255,255,255,0.92)'} />
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => onNavigate('__logout__')}
        style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.85 }]}>
        <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.9)" />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

export function MainShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname() ?? '';
  const { isAdmin, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isWide = width >= SIDEBAR_BREAKPOINT;

  const contentBg =
    theme.background === '#ffffff' ? PAGE_BG_LIGHT : theme.background;

  const onNavigate = useCallback(
    (href: string) => {
      setDrawerOpen(false);
      if (href === '__logout__') {
        void logout();
        return;
      }
      router.push(href as Href);
    },
    [logout]
  );

  const sidebar = (
    <SidebarNav isAdmin={isAdmin} pathname={pathname} onNavigate={onNavigate} />
  );

  return (
    <View style={[styles.root, { backgroundColor: contentBg }]}>
      {isWide ? (
        <View style={[styles.sidebarDesktop, { width: SIDEBAR_WIDTH }]}>{sidebar}</View>
      ) : (
        <Modal visible={drawerOpen} animationType="slide" transparent onRequestClose={() => setDrawerOpen(false)}>
          <View style={styles.modalRow}>
            <Pressable style={styles.modalBackdrop} onPress={() => setDrawerOpen(false)} />
            <SafeAreaView edges={['top', 'bottom']} style={[styles.sidebarDesktop, { width: Math.min(SIDEBAR_WIDTH, width * 0.88) }]}>
              {sidebar}
            </SafeAreaView>
          </View>
        </Modal>
      )}

      <SafeAreaView style={[styles.main, { backgroundColor: contentBg }]} edges={['top', 'right', 'bottom']}>
        <View style={[styles.topBar, { backgroundColor: theme.background, borderBottomColor: theme.backgroundSelected }]}>
          {!isWide ? (
            <Pressable onPress={() => setDrawerOpen(true)} hitSlop={12} style={styles.menuBtn}>
              <Ionicons name="menu-outline" size={26} color={theme.text} />
            </Pressable>
          ) : (
            <View style={styles.menuBtn} />
          )}
          <Text style={[styles.topTitle, { color: theme.text }]}>EasyVacc</Text>
          <View style={styles.menuBtn} />
        </View>
        <View style={styles.slot}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  sidebarDesktop: {
    backgroundColor: SHELL_BLUE,
    alignSelf: 'stretch',
    borderRightWidth: Platform.OS === 'web' ? 0 : StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(0,0,0,0.06)',
  },
  sidebarInner: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  brand: { marginBottom: Spacing.five },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  syringeBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  menuLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  navScroll: { flex: 1 },
  navScrollContent: { paddingBottom: Spacing.two },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: { backgroundColor: '#fff' },
  navText: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '600' },
  navTextActive: { color: SHELL_BLUE },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '600' },
  main: { flex: 1, minWidth: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700' },
  slot: { flex: 1, minHeight: 0 },
  modalRow: { flex: 1, flexDirection: 'row' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
});
