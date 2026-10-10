import React, { useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { fonts, radius } from '../../../core/theme';
import { container } from '../../../core/di/container';

export type BlockFeedbackState = 'idle' | 'correct' | 'wrong';

interface InteractiveLetterBlockProps {
  label: string;
  feedbackState?: BlockFeedbackState;
  onSelect: (label: string) => void;
  disabled?: boolean;
}

/**
 * Balok Huruf Pilihan (BA, KI, JE) Interaktif dengan Golden Rules:
 * 1. Draggable (bisa digeser ke atas ke slot jawaban) ATAU Tappable (bisa langsung diketuk).
 * 2. Interaksi Salah:
 *    - Layar bergetar kuat: Haptics.notificationAsync(Error)
 *    - Animasi Shake cepat kiri-kanan
 *    - Balok berkedip merah sekilas
 *    - Audio: playSound('error_buzz.wav')
 * 3. Interaksi Benar:
 *    - Layar bergetar halus: Haptics.notificationAsync(Success)
 *    - Balok melompat gembira (translasi Y ke atas sedikit dan kembali)
 *    - Warna berubah gradasi emas / hijau zamrud
 *    - Animasi Lottie (bintang / konfeti meledak) di atas balok
 *    - Audio: playSound('tada_magic.wav')
 */
export const InteractiveLetterBlock: React.FC<InteractiveLetterBlockProps> = ({
  label,
  feedbackState = 'idle',
  onSelect,
  disabled = false,
}) => {
  const [internalState, setInternalState] = useState<BlockFeedbackState>('idle');
  const [showLottie, setShowLottie] = useState(false);

  // Reanimated Physics Values
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const jumpY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Sync dengan feedbackState dari parent bila ada perubahan
  useEffect(() => {
    if (feedbackState === 'wrong') {
      triggerWrong();
    } else if (feedbackState === 'correct') {
      triggerCorrect();
    }
  }, [feedbackState]);

  const triggerWrong = () => {
    setInternalState('wrong');
    setShowLottie(false);

    // 1. Getaran Kuat Error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // 2. Animasi Shake (Kocok kiri-kanan cepat dengan spring)
    shakeX.value = withSequence(
      withSpring(-20, { damping: 3, stiffness: 500 }),
      withSpring(20, { damping: 3, stiffness: 500 }),
      withSpring(-14, { damping: 4, stiffness: 450 }),
      withSpring(14, { damping: 4, stiffness: 450 }),
      withSpring(0, { damping: 6, stiffness: 400 })
    );

    // 3. Audio error_buzz.wav
    container.sound.sfx('error_buzz');

    // Kembalikan warna setelah 500ms
    setTimeout(() => {
      setInternalState('idle');
    }, 550);
  };

  const triggerCorrect = () => {
    setInternalState('correct');
    setShowLottie(true);

    // 1. Getaran Halus Success
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Balok melompat gembira (translasi Y ke atas sedikit lalu mendarat)
    jumpY.value = withSequence(
      withSpring(-32, { damping: 6, stiffness: 350 }),
      withSpring(0, { damping: 8, stiffness: 220 })
    );
    scale.value = withSequence(
      withSpring(1.15, { damping: 5, stiffness: 320 }),
      withSpring(1.0, { damping: 8, stiffness: 200 })
    );

    // 3. Audio tada_magic.wav
    container.sound.sfx('tada_magic');

    // Hilangkan efek lottie setelah 1200ms
    setTimeout(() => {
      setShowLottie(false);
      setInternalState('idle');
    }, 1200);
  };

  // PanResponder untuk mendukung DRAGGABLE + TAPPABLE
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (disabled) return false;
        return Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6;
      },
      onPanResponderGrant: () => {
        scale.value = withSpring(0.92, { damping: 10, stiffness: 500 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gesture) => {
        dragX.value = gesture.dx;
        dragY.value = gesture.dy;
        scale.value = withSpring(1.06, { damping: 12, stiffness: 300 });
      },
      onPanResponderRelease: (_, gesture) => {
        const isUpwardDrag = gesture.dy < -35;
        const isQuickTap = Math.abs(gesture.dx) < 12 && Math.abs(gesture.dy) < 12;

        // Reset drag physics
        dragX.value = withSpring(0, { damping: 12, stiffness: 300 });
        dragY.value = withSpring(0, { damping: 12, stiffness: 300 });
        scale.value = withSpring(1.0, { damping: 8, stiffness: 300 });

        if (isUpwardDrag || isQuickTap) {
          onSelect(label);
        }
      },
      onPanResponderTerminate: () => {
        dragX.value = withSpring(0, { damping: 12, stiffness: 300 });
        dragY.value = withSpring(0, { damping: 12, stiffness: 300 });
        scale.value = withSpring(1.0, { damping: 8, stiffness: 300 });
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: dragX.value + shakeX.value },
        { translateY: dragY.value + jumpY.value },
        { scale: scale.value },
      ],
      zIndex: internalState === 'correct' ? 50 : 1,
    };
  });

  // Warna gradasi berdasarkan status interaksi (Idle vs Merah vs Hijau/Emas)
  const getGradientColors = (): [string, string, ...string[]] => {
    if (internalState === 'wrong') {
      return ['#FCA5A5', '#EF4444', '#B91C1C']; // Berkedip Merah
    }
    if (internalState === 'correct') {
      return ['#6EE7B7', '#10B981', '#047857']; // Gradasi Hijau Zamrud / Emas
    }
    return ['#FFFFFF', '#FEF3C7', '#FDE047']; // Warna balok normal
  };

  const getBorderBottomColor = () => {
    if (internalState === 'wrong') return '#991B1B';
    if (internalState === 'correct') return '#065F46';
    return '#D97706'; // Emas kayu tebal
  };

  const getTextColor = () => {
    if (internalState === 'wrong' || internalState === 'correct') return '#FFFFFF';
    return '#78350F';
  };

  return (
    <Animated.View
      style={[styles.wrapper, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.toyBlockContainer,
          { borderBottomColor: getBorderBottomColor() },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientSurface}
        >
          {/* Lego / Toy Peg Highlight */}
          <View
            style={[
              styles.toyPeg,
              {
                backgroundColor:
                  internalState === 'wrong'
                    ? '#F87171'
                    : internalState === 'correct'
                    ? '#A7F3D0'
                    : '#FEF08A',
              },
            ]}
          />
          <Text style={[styles.letterText, { color: getTextColor() }]}>
            {label}
          </Text>
        </LinearGradient>
      </View>

      {/* Animasi Lottie (Konfeti / Bintang Meledak) di atas balok saat BENAR */}
      {showLottie && (
        <View pointerEvents="none" style={styles.lottieOverlay}>
          <LottieView
            source={require('../../../assets/lottie/sparkle.json')}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 4,
    margin: 6,
  },
  toyBlockContainer: {
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    // Efek Balok Mainan Tebal 3D
    borderBottomWidth: 7,
    overflow: 'hidden',
    minWidth: 88,
    minHeight: 80,
  },
  gradientSurface: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toyPeg: {
    position: 'absolute',
    top: 4,
    width: 32,
    height: 4.5,
    borderRadius: 2.5,
    opacity: 0.85,
  },
  letterText: {
    fontFamily: fonts.black,
    fontSize: 28,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  lottieOverlay: {
    position: 'absolute',
    top: -55,
    left: -35,
    right: -35,
    bottom: -35,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  lottieAnimation: {
    width: 160,
    height: 160,
  },
});
