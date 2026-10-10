import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { container } from '../../../core/di/container';

interface KeyProps {
  label: string;
  colorIndex: number;
  size: number;
  highlight?: boolean;
  /** Ubah nilai ini (mis. counter) untuk memicu goyangan lembut. */
  wobbleToken?: number;
  disabled?: boolean;
  onPress: (label: string) => void;
}

export function BubbleKey({ label, colorIndex, size, highlight, wobbleToken, disabled, onPress }: KeyProps) {
  const [bg, edge] = bubblePalette[colorIndex % bubblePalette.length];
  const scale = useSharedValue(1);
  const press = useSharedValue(0);
  const rot = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!wobbleToken) return;
    rot.value = withSequence(
      withSpring(-10, { damping: 4, stiffness: 500 }),
      withSpring(10, { damping: 4, stiffness: 500 }),
      withSpring(-6, { damping: 5, stiffness: 450 }),
      withSpring(6, { damping: 5, stiffness: 450 }),
      withSpring(0, { damping: 8, stiffness: 400 })
    );
  }, [wobbleToken, rot]);

  useEffect(() => {
    glow.value = highlight
      ? withRepeat(
          withSequence(
            withSpring(1, { damping: 10, stiffness: 150 }),
            withSpring(0.2, { damping: 10, stiffness: 150 })
          ),
          -1,
          true
        )
      : withSpring(0, { damping: 12, stiffness: 200 });
  }, [highlight, glow]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * (1 + glow.value * 0.1) },
      { translateY: press.value * 3 },
      { rotate: `${rot.value}deg` },
    ],
    borderBottomWidth: Math.max(1, 4 - press.value * 3),
    shadowOpacity: 0.15 + glow.value * 0.6,
    borderColor: glow.value > 0.5 ? colors.ink : 'rgba(255,255,255,0.0)',
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 350 });
        scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        container.sound.sfx('tap');
      }}
      onPressOut={() => {
        press.value = withSpring(0, { damping: 12, stiffness: 220 });
        scale.value = withSequence(
          withSpring(1.12, { damping: 5, stiffness: 280 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
      }}
      onPress={() => onPress(label)}
      accessibilityRole="button"
      accessibilityLabel={`Huruf ${label}`}
    >
      <Animated.View
        style={[
          styles.key,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderBottomColor: edge,
            shadowColor: colors.sunnyDark,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.shine,
            {
              width: size * 0.3,
              height: size * 0.18,
              borderRadius: size * 0.1,
              left: size * 0.17,
              top: size * 0.12,
            },
          ]}
        />
        <Text style={[styles.label, { fontSize: size * 0.5 }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

interface Props {
  /** Huruf yang ditampilkan. Kosong/undefined = seluruh A–Z (Mode Mandiri). */
  letters?: string[];
  onPress: (letter: string) => void;
  highlightLetter?: string | null;
  wobbleLetter?: string | null;
  wobbleToken?: number;
  disabled?: boolean;
  width: number;
}

const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ROWS = [7, 7, 7, 5];

export function BubbleKeyboard({ letters, onPress, highlightLetter, wobbleLetter, wobbleToken, disabled, width }: Props) {
  const list = letters && letters.length ? letters : ALL;
  const full = list.length > 6;

  if (!full) {
    const size = Math.min(88, (width - 24) / list.length - 12);
    return (
      <View style={styles.rowCenter}>
        {list.map((l) => (
          <View key={l} style={{ margin: 6 }}>
            <BubbleKey
              label={l}
              colorIndex={ALL.indexOf(l)}
              size={size}
              highlight={highlightLetter === l}
              wobbleToken={wobbleLetter === l ? wobbleToken : 0}
              disabled={disabled}
              onPress={onPress}
            />
          </View>
        ))}
      </View>
    );
  }

  const size = Math.min(54, (width - 16) / 7 - 6);
  let idx = 0;
  return (
    <View style={{ alignItems: 'center' }}>
      {ROWS.map((n, r) => {
        const row = list.slice(idx, idx + n);
        idx += n;
        return (
          <View key={r} style={styles.rowCenter}>
            {row.map((l) => (
              <View key={l} style={{ margin: 3 }}>
                <BubbleKey
                  label={l}
                  colorIndex={ALL.indexOf(l)}
                  size={size}
                  highlight={highlightLetter === l}
                  wobbleToken={wobbleLetter === l ? wobbleToken : 0}
                  disabled={disabled}
                  onPress={onPress}
                />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 3,
  },
  shine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ rotate: '-25deg' }] },
  label: { fontFamily: fonts.black, color: colors.ink },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});
