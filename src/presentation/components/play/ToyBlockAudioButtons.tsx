import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { fonts, radius } from '../../../core/theme';
import { container } from '../../../core/di/container';

interface ToyBlockAudioButtonsProps {
  speakText?: string;
  slowParts?: string[];
  disabled?: boolean;
  onHear?: () => void;
  onSlow?: () => void;
}

/**
 * Komponen Tombol Dengar & Pelan-Pelan dengan desain Balok Mainan Tebal 3D.
 * Saat ditekan, terasa SANGAT MEMBAL (spring stiffness: 500) sesuai Golden Rules.
 */
export const ToyBlockAudioButtons: React.FC<ToyBlockAudioButtonsProps> = ({
  speakText,
  slowParts,
  disabled = false,
  onHear,
  onSlow,
}) => {
  // Spring values untuk tombol Dengar Cici
  const scaleHear = useSharedValue(1);
  const translateYHear = useSharedValue(0);
  const shadowHear = useSharedValue(1);

  // Spring values untuk tombol Pelan-Pelan
  const scaleSlow = useSharedValue(1);
  const translateYSlow = useSharedValue(0);
  const shadowSlow = useSharedValue(1);

  // Config spring sangat membal: stiffness 500
  const springBouncyIn = { damping: 10, stiffness: 500, mass: 0.8 };
  const springBouncyOut = { damping: 8, stiffness: 500, mass: 0.8 };

  const handleHearPressIn = () => {
    if (disabled) return;
    scaleHear.value = withSpring(0.88, springBouncyIn);
    translateYHear.value = withSpring(4, springBouncyIn);
    shadowHear.value = withSpring(0, springBouncyIn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handleHearPressOut = () => {
    if (disabled) return;
    scaleHear.value = withSpring(1.0, springBouncyOut);
    translateYHear.value = withSpring(0, springBouncyOut);
    shadowHear.value = withSpring(1.0, springBouncyOut);
  };

  const handleHearPress = () => {
    if (disabled) return;
    if (onHear) {
      onHear();
    } else if (speakText) {
      container.sound.hear(speakText);
    }
  };

  const handleSlowPressIn = () => {
    if (disabled) return;
    scaleSlow.value = withSpring(0.88, springBouncyIn);
    translateYSlow.value = withSpring(4, springBouncyIn);
    shadowSlow.value = withSpring(0, springBouncyIn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handleSlowPressOut = () => {
    if (disabled) return;
    scaleSlow.value = withSpring(1.0, springBouncyOut);
    translateYSlow.value = withSpring(0, springBouncyOut);
    shadowSlow.value = withSpring(1.0, springBouncyOut);
  };

  const handleSlowPress = () => {
    if (disabled) return;
    if (onSlow) {
      onSlow();
    } else if (slowParts && slowParts.length > 0) {
      container.sound.hearSlow(slowParts);
    } else if (speakText) {
      container.sound.speak(speakText, 0.6);
    }
  };

  const animatedHearStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateYHear.value },
      { scale: scaleHear.value },
    ],
    shadowOpacity: 0.28 * shadowHear.value,
    elevation: 5 * shadowHear.value,
  }));

  const animatedSlowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateYSlow.value },
      { scale: scaleSlow.value },
    ],
    shadowOpacity: 0.28 * shadowSlow.value,
    elevation: 5 * shadowSlow.value,
  }));

  return (
    <View style={styles.container}>
      {/* 1. Balok Mainan Tebal 3D: Dengar Cici (Emas / Kuning Cerah) */}
      <Animated.View style={[styles.blockShadowWrapper, animatedHearStyle]}>
        <Pressable
          onPressIn={handleHearPressIn}
          onPressOut={handleHearPressOut}
          onPress={handleHearPress}
          disabled={disabled}
          style={[styles.toyBlock, styles.hearToyBlock]}
          accessibilityRole="button"
          accessibilityLabel="Dengar Cici"
        >
          <LinearGradient
            colors={['#FEF3C7', '#FDE047', '#EAB308']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.blockSurface}
          >
            <View style={styles.pegTop} />
            <Text style={styles.blockEmoji}>🔊</Text>
            <Text style={styles.hearText}>Dengar Cici</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* 2. Balok Mainan Tebal 3D: Pelan-Pelan (Cyan / Mint Segar) */}
      <Animated.View style={[styles.blockShadowWrapper, animatedSlowStyle]}>
        <Pressable
          onPressIn={handleSlowPressIn}
          onPressOut={handleSlowPressOut}
          onPress={handleSlowPress}
          disabled={disabled}
          style={[styles.toyBlock, styles.slowToyBlock]}
          accessibilityRole="button"
          accessibilityLabel="Pelan-Pelan"
        >
          <LinearGradient
            colors={['#CCFBF1', '#5EEAD4', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.blockSurface}
          >
            <View style={[styles.pegTop, { backgroundColor: '#99F6E4' }]} />
            <Text style={styles.blockEmoji}>🐢</Text>
            <Text style={styles.slowText}>Pelan-Pelan</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  blockShadowWrapper: {
    flex: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  toyBlock: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Efek Balok Mainan Tebal 3D
    borderBottomWidth: 6,
    overflow: 'hidden',
  },
  hearToyBlock: {
    borderBottomColor: '#CA8A04',
  },
  slowToyBlock: {
    borderBottomColor: '#0F766E',
  },
  blockSurface: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pegTop: {
    position: 'absolute',
    top: 3,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FEF08A',
    opacity: 0.8,
  },
  blockEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  hearText: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#713F12',
    letterSpacing: 0.3,
  },
  slowText: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#134E4A',
    letterSpacing: 0.3,
  },
});

