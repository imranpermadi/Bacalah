import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

/** Goyangan lembut (bukan buzzer) saat `token` berubah. */
export function Wobble({ token, children, style }: { token: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const r = useSharedValue(0);
  useEffect(() => {
    if (!token) return;
    r.value = withSequence(withTiming(-8, { duration: 70 }), withRepeat(withTiming(8, { duration: 110 }), 4, true), withTiming(0, { duration: 70 }));
  }, [token, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Mengambang naik-turun (balon) atau kiri-kanan (ikan). */
export function Float({ children, amplitude = 8, duration = 1400, delay = 0, axis = 'y', style }: { children: React.ReactNode; amplitude?: number; duration?: number; delay?: number; axis?: 'x' | 'y'; style?: StyleProp<ViewStyle> }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withSequence(withTiming(amplitude, { duration }), withTiming(-amplitude, { duration })), -1, true));
  }, [amplitude, duration, delay, v]);
  const a = useAnimatedStyle(() => ({ transform: axis === 'y' ? [{ translateY: v.value }] : [{ translateX: v.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

