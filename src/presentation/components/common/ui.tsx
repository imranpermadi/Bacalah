import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts } from '../../../core/theme';
import { container } from '../../../core/di/container';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  edge?: string;
  textColor?: string;
  style?: ViewStyle;
  small?: boolean;
  disabled?: boolean;
}

/** Tombol timbul 3D taktil. */
export function BigButton({ label, onPress, color = colors.sky, edge = colors.skyDark, textColor = colors.ink, style, small, disabled }: BigButtonProps) {
  const press = useSharedValue(0);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * 3 }, { scale: scale.value }],
    borderBottomWidth: 4 - press.value * 3,
  }));
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 60 });
        scale.value = withSpring(0.96);
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: 90 });
        scale.value = withSpring(1, { damping: 6 });
      }}
      onPress={() => {
        container.sound.sfx('pop');
        onPress();
      }}
      style={style}
    >
      <Animated.View
        style={[styles.btn, small && styles.btnSmall, { backgroundColor: disabled ? '#DDD' : color, borderBottomColor: disabled ? '#BBB' : edge }, anim]}
      >
        <Text style={[styles.btnText, small && { fontSize: 15 }, { color: textColor }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** Tombol "Dengar Cici" (0.85) & "Cici Pelan-Pelan" (0.6). */
export function HearButtons({ text, slowParts }: { text: string; slowParts?: string[] }) {
  return (
    <View style={styles.hearRow}>
      <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} onPress={() => container.sound.hear(text)} style={{ flex: 1 }} />
      <BigButton label="🐢 Cici Pelan-Pelan" color={colors.peach} edge={colors.peachDark} onPress={() => container.sound.hearSlow(slowParts ?? [text])} style={{ flex: 1 }} />
    </View>
  );
}

export function Stars({ count, max = 3, size = 36 }: { count: number; max?: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <Text key={i} style={{ fontSize: size, opacity: i < count ? 1 : 0.25 }}>
          ⭐
        </Text>
      ))}
    </View>
  );
}

export function ScreenTitle({
  children,
  sub,
  rightAction,
}: {
  children: string;
  sub?: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[styles.title, rightAction ? { flex: 1 } : null]} numberOfLines={1}>
          {children}
        </Text>
        {rightAction ? <View style={{ marginLeft: 8 }}>{rightAction}</View> : null}
      </View>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  btnText: { fontFamily: fonts.black, fontSize: 17, textAlign: 'center' },
  hearRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  title: { fontFamily: fonts.black, fontSize: 30, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.inkSoft },
});

