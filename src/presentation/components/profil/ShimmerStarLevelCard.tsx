import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';

interface Props {
  stars: number;
  level: number;
  onPress?: () => void;
}

/**
 * Requirement 2: Card '13 Bintang & Level 2' dengan Shimmer Effect
 * - Berkilau dari kiri ke kanan setiap 3 detik.
 * - Depth & Neumorphism: LinearGradient halus, translucent border, dynamic drop shadow.
 * - Multisensori: Scale down ke 0.92, Haptic Feedback, Audio pop saat ditekan.
 */
export function ShimmerStarLevelCard({ stars, level, onPress }: Props) {
  const [cardWidth, setCardWidth] = useState(300);

  // Press animation values
  const pressScale = useSharedValue(1);
  const shadowDepth = useSharedValue(8);

  // Shimmer beam position (-150 to cardWidth + 150)
  const shimmerTranslateX = useSharedValue(-200);

  useEffect(() => {
    // Shimmer beam loops every 3000ms using spring motion
    shimmerTranslateX.value = withRepeat(
      withSequence(
        withSpring(-200, { damping: 15, stiffness: 100 }),
        withDelay(
          1200,
          withSpring(cardWidth + 200, { damping: 14, stiffness: 60 })
        ),
        withDelay(1800, withSpring(-200, { damping: 15, stiffness: 100 }))
      ),
      -1,
      false
    );
  }, [cardWidth]);

  const handlePressIn = () => {
    pressScale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
    shadowDepth.value = withSpring(3, { damping: 12, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 8, stiffness: 180 });
    shadowDepth.value = withSpring(8, { damping: 10, stiffness: 180 });
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    shadowRadius: shadowDepth.value * 1.5,
    elevation: shadowDepth.value,
  }));

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shimmerTranslateX.value },
      { skewX: '-22deg' },
    ],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setCardWidth(w);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        container.sound.sfx('chime');
        onPress?.();
      }}
      style={{ width: '100%' }}
    >
      <Animated.View
        onLayout={handleLayout}
        style={[styles.container, animatedCardStyle]}
      >
        {/* Soft Tactile Linear Gradient (Supercell / Duolingo Style Warm Gold) */}
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Top highlight line for depth */}
          <View style={styles.topHighlight} />

          {/* Left: Star Badge */}
          <View style={styles.itemCol}>
            <View style={styles.iconCircle}>
              <Text style={styles.starEmoji}>⭐</Text>
            </View>
            <View>
              <Text style={styles.valText}>{stars}</Text>
              <Text style={styles.lblText}>Bintang Emas</Text>
            </View>
          </View>

          {/* Divider with subtle depth */}
          <View style={styles.divider} />

          {/* Right: Level Badge */}
          <View style={styles.itemCol}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
            <View>
              <Text style={[styles.valText, { color: '#1E40AF' }]}>Level {level}</Text>
              <Text style={styles.lblText}>Pencapaian Belajar</Text>
            </View>
          </View>

          {/* Shimmer light sweep beam */}
          <Animated.View
            pointerEvents="none"
            style={[styles.shimmerBeam, animatedShimmerStyle]}
          >
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0)',
                'rgba(255, 255, 255, 0.65)',
                'rgba(255, 255, 255, 0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  itemCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  starEmoji: {
    fontSize: 26,
  },
  trophyEmoji: {
    fontSize: 26,
  },
  valText: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: '#92400E',
    lineHeight: 26,
  },
  lblText: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: '#B45309',
  },
  divider: {
    width: 1.5,
    height: 42,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    marginHorizontal: 12,
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
});

