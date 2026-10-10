import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, radius } from '../../../core/theme';

interface Props {
  avatarEmoji?: string;
  onPress?: () => void;
  size?: number;
}

/**
 * Requirement 1: Avatar Kelinci Mengambang Perlahan
 * - Animasi looping up and down sekitar 5px menggunakan spring physics.
 * - Multisensori: Scale down ke 0.92 on press, haptic impact, audio SFX.
 * - Depth & Neumorphism: Halo LinearGradient, transparent border, dynamic shadow.
 */
export function FloatingBunnyAvatar({
  avatarEmoji = '🐰',
  onPress,
  size = 72,
}: Props) {
  // Looping float up and down (-5px to 0px)
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(6);

  useEffect(() => {
    // Spring physics looping float
    floatY.value = withRepeat(
      withSequence(
        withSpring(-5, { damping: 6, stiffness: 40, mass: 1 }),
        withSpring(0, { damping: 6, stiffness: 40, mass: 1 })
      ),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    // Golden Rule: Scale down ke 0.92 dengan spring physics
    scale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
    elevation.value = withSpring(2, { damping: 12, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handlePressOut = () => {
    // Memantul kembali dengan spring physics
    scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    elevation.value = withSpring(6, { damping: 10, stiffness: 180 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
    shadowRadius: elevation.value * 1.5,
    elevation: elevation.value,
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        container.sound.sfx('chime');
        onPress?.();
      }}
    >
      <Animated.View style={[styles.wrapper, { width: size + 16, height: size + 16 }, animatedStyle]}>
        {/* Soft LinearGradient Halo Ring */}
        <LinearGradient
          colors={['#FFF5EB', '#FFE0B2', '#FFCC80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientRing, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }]}
        >
          {/* Inner Avatar Bubble */}
          <View style={[styles.innerBubble, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.58 }]}>
              {avatarEmoji}
            </Text>
          </View>
        </LinearGradient>

        {/* Small floating status badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
  },
  gradientRing: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  innerBubble: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  avatarText: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 11,
  },
});

