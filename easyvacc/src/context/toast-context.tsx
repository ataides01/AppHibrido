import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type ToastKind = 'success' | 'error' | 'info';

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<ToastKind>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setVisible(false)
    );
  }, [opacity]);

  const show = useCallback(
    (msg: string, k: ToastKind = 'info') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      setKind(k);
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        hide();
      }, 3200);
    },
    [hide, opacity]
  );

  const value = useMemo(() => ({ show }), [show]);

  const bg =
    kind === 'success'
      ? '#1b5e20'
      : kind === 'error'
        ? '#b71c1c'
        : theme.backgroundElement;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrap, { opacity, paddingBottom: Platform.OS === 'ios' ? 36 : 24 }]}>
          <Pressable
            onPress={hide}
            style={[styles.bar, { backgroundColor: bg, borderColor: theme.textSecondary }]}>
            <Text style={[styles.text, { color: kind === 'info' ? theme.text : '#fff' }]}>
              {message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  bar: {
    maxWidth: 560,
    width: '100%',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
