import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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

/** Tombol timbul 3D taktil dengan Golden Rules (pure withSpring, 0.92 scale, haptics). */
export function BigButton({
  label,
  onPress,
  color = colors.sky,
  edge = colors.skyDark,
  textColor = colors.ink,
  style,
  small,
  disabled,
}: BigButtonProps) {
  const press = useSharedValue(0);
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: press.value * 4 },
      { scale: scale.value },
    ],
    borderBottomWidth: disabled ? 3 : Math.max(1, 5 - press.value * 4),
    shadowOpacity: 0.18 - press.value * 0.12,
    shadowOffset: { width: 0, height: Math.max(1, 4 - press.value * 3) },
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 350 });
        scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
        if (!disabled) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
      }}
      onPressOut={() => {
        press.value = withSpring(0, { damping: 12, stiffness: 220 });
        scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
      }}
      onPress={() => {
        if (!disabled) {
          container.sound.sfx('pop');
          onPress();
        }
      }}
      style={style}
    >
      <Animated.View
        style={[
          styles.btn,
          small && styles.btnSmall,
          {
            backgroundColor: disabled ? '#E2E8F0' : color,
            borderBottomColor: disabled ? '#CBD5E1' : edge,
          },
          anim,
        ]}
      >
        {/* Subtle Neumorphic Top Highlight */}
        <View style={styles.btnHighlight} pointerEvents="none" />
        <Text style={[styles.btnText, small && { fontSize: 15 }, { color: disabled ? '#94A3B8' : textColor }]}>
          {label}
        </Text>
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
    borderBottomWidth: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#0F172A',
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  btnText: { fontFamily: fonts.black, fontSize: 17, textAlign: 'center' },
  hearRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  title: { fontFamily: fonts.black, fontSize: 30, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.inkSoft },
});

