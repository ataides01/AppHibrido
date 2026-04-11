import { Link } from 'expo-router';
import { type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ACCENT = '#2A9D8F';
const ACCENT_MUTED = 'rgba(255,255,255,0.88)';

type Props = {
  /** Conteúdo do formulário (lado branco / principal). */
  children: ReactNode;
  /** Título no painel colorido. */
  sideTitle: string;
  sideDescription: string;
  /** Texto do botão fantasma (outline). */
  sideCtaLabel: string;
  href: '/login' | '/register';
};

export function AuthScreenLayout({
  children,
  sideTitle,
  sideDescription,
  sideCtaLabel,
  href,
}: Props) {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const isWide = width >= 720;

  const cardShadow =
    Platform.OS === 'web'
      ? ({
          boxShadow: '0 16px 48px rgba(15, 23, 42, 0.12)',
        } as object)
      : Platform.OS === 'ios'
        ? {
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 28,
          }
        : { elevation: 10 };

  const sidePanel = (
    <View style={[styles.side, { backgroundColor: ACCENT }]}>
      <Text style={styles.sideTitle}>{sideTitle}</Text>
      <Text style={styles.sideDesc}>{sideDescription}</Text>
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.outlineBtn,
            { opacity: pressed ? 0.85 : 1, borderColor: 'rgba(255,255,255,0.95)' },
          ]}>
          <Text style={styles.outlineBtnText}>{sideCtaLabel}</Text>
        </Pressable>
      </Link>
    </View>
  );

  const formPanel = (
    <ThemedView
      type="background"
      style={[
        styles.formPane,
        isWide && {
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderLeftColor:
            theme.background === '#000000' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        },
        !isWide && styles.formPaneMobile,
      ]}>
      {children}
    </ThemedView>
  );

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: theme.background === '#000000' ? '#0a0a0a' : '#E8ECEF' },
      ]}>
      <View style={[styles.center, isWide && styles.centerWide]}>
        <View
          style={[
            styles.card,
            cardShadow,
            isWide ? styles.cardRow : styles.cardCol,
          ]}>
          {isWide ? (
            <>
              {sidePanel}
              {formPanel}
            </>
          ) : (
            <>
              {formPanel}
              {sidePanel}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    width: '100%',
  },
  centerWide: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 880,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 440,
  },
  cardCol: {
    flexDirection: 'column',
    maxWidth: 440,
    alignSelf: 'center',
  },
  side: {
    flex: 1,
    minWidth: 260,
    padding: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  formPane: {
    flex: 1,
    minWidth: 280,
    maxWidth: 460,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  formPaneMobile: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    maxWidth: '100%',
  },
  sideTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sideDesc: {
    color: ACCENT_MUTED,
    fontSize: 15,
    lineHeight: 22,
  },
  outlineBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});
