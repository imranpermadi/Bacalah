import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { container } from '../../../core/di/container';

const { width, height } = Dimensions.get('window');
const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💛', '💙', '💚'];

function Piece({ i }: { i: number }) {
  const y = useSharedValue(-40);
  const x = useSharedValue(0);
  const o = useSharedValue(1);
  const startX = (i * 53) % (width - 30);
  useEffect(() => {
    const delay = (i % 8) * 90;
    y.value = withDelay(delay, withTiming(height * 0.85, { duration: 1800 + (i % 5) * 250, easing: Easing.in(Easing.quad) }));
    x.value = withDelay(delay, withTiming(((i % 2 ? 1 : -1) * (20 + (i % 4) * 12)), { duration: 2200 }));
    o.value = withDelay(delay + 1400, withTiming(0, { duration: 700 }));
  }, [i, y, x, o]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { translateX: x.value }, { rotate: `${y.value / 2}deg` }], opacity: o.value }));
  return <Animated.Text style={[styles.piece, { left: startX }, style]}>{EMOJIS[i % EMOJIS.length]}</Animated.Text>;
}

/** Efek perayaan: konfeti bintang (Reanimated) + kilau Lottie. */
export function Celebration({ visible, withClap = true }: { visible: boolean; withClap?: boolean }) {
  useEffect(() => {
    if (!visible) return;
    container.sound.sfx('chime');
    if (withClap) setTimeout(() => container.sound.sfx('clap'), 350);
  }, [visible, withClap]);

  if (!visible) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 28 }, (_, i) => (
        <Piece key={i} i={i} />
      ))}
      <LottieView source={require('../../../../assets/lottie/sparkle.json')} autoPlay loop style={[styles.lottie, { left: width * 0.1, top: 80 }]} />
      <LottieView source={require('../../../../assets/lottie/sparkle.json')} autoPlay loop style={[styles.lottie, { right: width * 0.1, top: 160 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, fontSize: 28 },
  lottie: { position: 'absolute', width: 120, height: 120 },
});

