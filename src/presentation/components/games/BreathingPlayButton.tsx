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
import { fonts, radius } from '../../../core/theme';
import { container } from '../../../core/di/container';

interface BreathingPlayButtonProps {
  label?: string;
  color?: string;
  edge?: string;
  onPress: () => void;
  style?: any;
}

/**
 * Tombol 'Main 🚀' 3D Tactile dengan:
 * 1. Breathing animation looping (membesar/mengecil 1-2% sangat halus tanpa linear timing)
 * 2. Visual: 3D push-in saat ditekan (scale down ke 0.92, translateY +4px, shadow hilang seolah masuk ke dalam)
 * 3. Taktil: Haptics.impactAsync(Light)
 * 4. Audio: Memutar suara luncuran 'swoosh.wav' via container.sound.sfx('swoosh')
 * 5. Depth: LinearGradient tipis dengan bevel border bawah 3D yang tebal
 */
export const BreathingPlayButton: React.FC<BreathingPlayButtonProps> = ({
  label = 'Main 🚀',
  color = '#FF7A59',
  edge = '#D94E28',
  onPress,
  style,
}) => {
  // Shared values untuk breathing animation & press-in physics
  const breathScale = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const pressY = useSharedValue(0);
  const shadowDrop = useSharedValue(1);

  // 1. Breathing animation looping (sangat halus 1-2% menggunakan spring sequence tanpa Animated.timing)
  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withSpring(1.022, { damping: 5, stiffness: 22, mass: 1.1 }),
        withSpring(1.0, { damping: 5, stiffness: 22, mass: 1.1 })
      ),
      -1,
      true
    );
  }, [breathScale]);

  const handlePressIn = () => {
    // 2. Visual: Masuk ke dalam (scale down 0.92, translasi Y ke bawah, bayangan hilang)
    pressScale.value = withSpring(0.92, { damping: 14, stiffness: 240 });
    pressY.value = withSpring(4, { damping: 14, stiffness: 240 });
    shadowDrop.value = withSpring(0, { damping: 12, stiffness: 200 });

    // 3. Taktil: Haptic feedback Light
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 4. Audio: Putar swoosh.wav
    container.sound.sfx('swoosh');
  };

  const handlePressOut = () => {
    // Memantul kembali saat dilepas
    pressScale.value = withSpring(1.0, { damping: 10, stiffness: 180 });
    pressY.value = withSpring(0, { damping: 10, stiffness: 180 });
    shadowDrop.value = withSpring(1, { damping: 10, stiffness: 180 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: pressY.value },
        { scale: breathScale.value * pressScale.value },
      ],
      shadowOpacity: 0.35 * shadowDrop.value,
      elevation: 4 * shadowDrop.value,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.pressableContainer, { borderBottomColor: edge }]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <LinearGradient
          colors={['#FFFFFF25', '#00000010']}
          style={[styles.gradientLayer, { backgroundColor: color }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: '#C05621',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  pressableContainer: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#FFFFFF60',
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  gradientLayer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  buttonText: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
});

