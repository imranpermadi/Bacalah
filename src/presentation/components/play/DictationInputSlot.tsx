import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts } from '../../../core/theme';

function Slot({ char, active, wobble }: { char: string; active: boolean; wobble: number }) {
  const blink = useSharedValue(0);
  const pop = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    blink.value = active
      ? withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })), -1)
      : withTiming(0);
  }, [active, blink]);

  useEffect(() => {
    if (char) pop.value = withSequence(withSpring(1.3, { damping: 5 }), withSpring(1));
  }, [char, pop]);

  useEffect(() => {
    if (!wobble || !active) return;
    shake.value = withSequence(withTiming(-6, { duration: 60 }), withRepeat(withTiming(6, { duration: 90 }), 4, true), withTiming(0, { duration: 60 }));
  }, [wobble, active, shake]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateX: shake.value }],
    backgroundColor: active ? `rgba(255, 217, 61, ${0.25 + blink.value * 0.5})` : char ? '#E7FFF3' : '#FFFFFF',
    borderColor: active ? colors.sunnyDark : char ? colors.mintDark : colors.line,
  }));

  return (
    <Animated.View style={[styles.slot, style]}>
      <Text style={styles.char}>{char}</Text>
    </Animated.View>
  );
}

export function DictationInputSlot({
  target,
  typed,
  wobbleToken,
  emoji,
}: {
  target: string;
  typed: string;
  wobbleToken: number;
  emoji?: string;
}) {
  return (
    <View style={styles.container}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <View style={styles.row}>
        {target.split('').map((_, i) => (
          <Slot key={i} char={typed[i] ?? ''} active={i === typed.length} wobble={wobbleToken} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  emoji: { fontSize: 44, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: 52,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: { fontFamily: fonts.black, fontSize: 34, color: colors.ink },
});

