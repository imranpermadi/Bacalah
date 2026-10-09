import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts } from '../../../core/theme';

export type Mood = 'idle' | 'talk' | 'happy' | 'hint';

const FACE: Record<Mood, string> = { idle: '🐱', talk: '😺', happy: '😸', hint: '🙀' };

/** Cici si Kucing Putih Ceria. `moodToken` memicu ulang animasi untuk mood yang sama. */
export function MascotCici({ mood, message, size = 84, moodToken = 0 }: { mood: Mood; message?: string; size?: number; moodToken?: number }) {
  const y = useSharedValue(0);
  const s = useSharedValue(1);
  const r = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(y); cancelAnimation(s); cancelAnimation(r);
    y.value = 0; s.value = 1; r.value = 0;
    if (mood === 'idle') {
      y.value = withRepeat(withSequence(withTiming(-5, { duration: 900 }), withTiming(0, { duration: 900 })), -1);
    } else if (mood === 'talk') {
      s.value = withRepeat(withSequence(withTiming(1.12, { duration: 220 }), withTiming(0.96, { duration: 220 })), -1, true);
    } else if (mood === 'happy') {
      y.value = withRepeat(withSequence(withTiming(-34, { duration: 260 }), withSpring(0, { damping: 6 })), 3);
      r.value = withRepeat(withSequence(withTiming(-12, { duration: 260 }), withTiming(12, { duration: 260 })), 3, true);
    } else {
      r.value = withSequence(withTiming(-14, { duration: 150 }), withRepeat(withTiming(14, { duration: 250 }), 3, true), withTiming(0, { duration: 150 }));
    }
  }, [mood, moodToken, y, s, r]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: s.value }, { rotate: `${r.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[{ fontSize: size }, style]}>{FACE[mood]}</Animated.Text>
      {message ? (
        <View style={styles.bubble}>
          <View style={styles.tail} />
          <Text style={styles.msg}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  bubble: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: colors.sky,
    padding: 12,
  },
  tail: {
    position: 'absolute',
    left: -12,
    top: 22,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.sky,
  },
  msg: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
});

