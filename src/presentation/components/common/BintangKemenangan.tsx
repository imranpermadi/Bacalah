import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { container } from '../../../core/di/container';

interface Props {
  size?: number;
  label?: string;
  onFinish?: () => void;
}

/**
 * 🌟 BintangKemenangan (Victory Pop Star)
 * Terinspirasi dari Golden Rules & Bouncy Supercell Physics:
 * - Bintang melompat keluar dengan spring physics (damping: 5, stiffness: 200)
 * - Halo cahaya emas berputar lembut
 * - Ledakan sparkle Lottie
 * - Multisensory haptic & sound tada magic
 */
export function BintangKemenangan({ size = 70, label = 'HEBAT!', onFinish }: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(20);
  const rotate = useSharedValue(-15);
  const haloScale = useSharedValue(0.4);

  useEffect(() => {
    // Multisensory trigger
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      container.sound.sfx('tada_magic');
    } catch {}

    // 1. Bintang melompat keluar dengan spring physics super bouncy
    scale.value = withSpring(1.4, { damping: 5, stiffness: 200 });
    translateY.value = withSpring(-45, { damping: 6, stiffness: 220 });
    rotate.value = withSpring(0, { damping: 8, stiffness: 180 });
    haloScale.value = withSpring(1.6, { damping: 7, stiffness: 150 });

    // 2. Fade out perlahan setelah apresiasi terlihat
    opacity.value = withDelay(
      1500,
      withSequence(
        withSpring(0.7, { damping: 10, stiffness: 100 }),
        withSpring(0, { damping: 12, stiffness: 90 })
      )
    );

    const timer = setTimeout(() => {
      onFinish?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: opacity.value * 0.7,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Halo Cahaya Emas */}
      <Animated.View style={[styles.haloWrapper, haloAnimatedStyle]}>
        <LinearGradient
          colors={['#FDE047', '#F59E0B', 'transparent']}
          style={styles.haloGradient}
        />
      </Animated.View>

      {/* Lottie Sparkles Meledak */}
      <LottieView
        source={require('../../../../assets/lottie/sparkle.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />

      {/* Bintang Utama Melompat */}
      <Animated.View style={[styles.starBox, starAnimatedStyle]}>
        <Text style={{ fontSize: size }}>⭐</Text>
        {label ? <Text style={styles.labelText}>{label}</Text> : null}
      </Animated.View>
    </View>
  );
}

export default BintangKemenangan;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  haloWrapper: {
    position: 'absolute',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.6,
  },
  lottie: {
    position: 'absolute',
    width: 240,
    height: 240,
  },
  starBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: '#D97706',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginTop: 2,
    letterSpacing: 1.5,
  },
});

