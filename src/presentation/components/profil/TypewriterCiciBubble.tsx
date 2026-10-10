import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';

interface Props {
  fullText: string;
  charDelayMs?: number;
  mascotEmoji?: string;
  onFinished?: () => void;
}

/**
 * Requirement 3: Balon Kata Cici dengan Typewriter Effect
 * - Teks muncul per huruf disertai suara ketikan pelan playSound('tap.wav').
 * - Spring entrance bounce pada gelembung percakapan.
 * - Multisensori: Sentuhan memantulkan gelembung kata dengan spring physics.
 */
export function TypewriterCiciBubble({
  fullText,
  charDelayMs = 38,
  mascotEmoji = '🐱',
  onFinished,
}: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Reanimated Spring Bounce Values
  const bubbleScale = useSharedValue(0.85);
  const mascotScale = useSharedValue(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  // Start typewriter effect and spring entrance
  useEffect(() => {
    // Spring pop entrance
    bubbleScale.value = withSpring(1, { damping: 10, stiffness: 160 });

    setDisplayedText('');
    setIsTyping(true);
    indexRef.current = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      indexRef.current += 1;
      const currentIdx = indexRef.current;

      if (currentIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIdx));

        // Suara ketikan pelan & getaran mikro taktil per 3 karakter agar nyaman didengar
        if (currentIdx % 3 === 0) {
          container.sound.sfx('tap');
          Haptics.selectionAsync();
        }
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTyping(false);
        onFinished?.();
      }
    }, charDelayMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fullText, charDelayMs]);

  const handlePressIn = () => {
    bubbleScale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
    mascotScale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handlePressOut = () => {
    bubbleScale.value = withSpring(1, { damping: 8, stiffness: 180 });
    mascotScale.value = withSpring(1, { damping: 8, stiffness: 180 });
  };

  const handleReplay = () => {
    // Jika ditekan saat selesai, tampilkan kembali dengan animasi pantul
    if (!isTyping) {
      bubbleScale.value = withSpring(1.08, { damping: 6, stiffness: 160 }, () => {
        bubbleScale.value = withSpring(1, { damping: 8, stiffness: 180 });
      });
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleReplay}
      style={styles.container}
    >
      {/* Mascot Cici with spring breathing */}
      <Animated.View style={[styles.mascotBox, mascotAnimatedStyle]}>
        <LinearGradient
          colors={['#FFFBEB', '#FDE68A']}
          style={styles.mascotBg}
        >
          <Text style={styles.mascotEmoji}>{mascotEmoji}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Speech Balloon Bubble with Typewriter */}
      <Animated.View style={[styles.bubbleWrapper, bubbleAnimatedStyle]}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubbleGradient}
        >
          {/* Subtle top border highlight */}
          <View style={styles.bubbleTopHighlight} />

          <Text style={styles.speechText}>
            {displayedText}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>

          {/* Pointer tail pointing toward Cici */}
          <View style={styles.pointerTail} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
    paddingHorizontal: 2,
  },
  mascotBox: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mascotBg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  mascotEmoji: {
    fontSize: 34,
  },
  bubbleWrapper: {
    flex: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: radius.xl,
  },
  bubbleGradient: {
    borderRadius: radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    position: 'relative',
  },
  bubbleTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  speechText: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  cursor: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: colors.coral,
  },
  pointerTail: {
    position: 'absolute',
    left: -7,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#FFFFFF',
  },
});

