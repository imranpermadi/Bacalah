import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';

const { width } = Dimensions.get('window');

interface Props {
  storyId: string;
  pageIndex: number;
  coverEmoji: string;
  illustrationEmoji: string;
  characterMood: string;
  themeColor: string;
}

/**
 * 🎬 AnimatedStoryScene
 * Menampilkan adegan kartun beranimasi hidup yang bergerak sesuai alur cerita anak:
 * - Karakter utama melompat/berjalan/bernapas dengan Supercell/Duolingo Spring Physics.
 * - Objek cerita (roti, madu, sungai, bunga) bergerak bersama karakter.
 * - Elemen alam sekitar (awan melayang, rumput bergoyang, sinar matahari berkilau).
 */
export function AnimatedStoryScene({
  storyId,
  pageIndex,
  coverEmoji,
  illustrationEmoji,
  characterMood,
  themeColor,
}: Props) {
  // Animasi nafas / lompat karakter utama
  const characterY = useSharedValue(0);
  const characterScale = useSharedValue(1);
  const characterRotate = useSharedValue(0);

  // Animasi objek pelengkap / jalan
  const itemFloatX = useSharedValue(0);
  const itemFloatY = useSharedValue(0);

  // Animasi atmosfer (awan, daun, cahaya)
  const cloudX = useSharedValue(0);
  const sparkleScale = useSharedValue(0.9);

  // Tap bounce effect
  const tapScale = useSharedValue(1);

  useEffect(() => {
    // 1. Karakter bergerak aktif (spring bouncing / breathing animation)
    characterY.value = withRepeat(
      withSequence(
        withSpring(-14, { damping: 4, stiffness: 120 }),
        withSpring(0, { damping: 5, stiffness: 120 })
      ),
      -1,
      true
    );

    characterScale.value = withRepeat(
      withSequence(
        withSpring(1.08, { damping: 6, stiffness: 140 }),
        withSpring(0.96, { damping: 6, stiffness: 140 })
      ),
      -1,
      true
    );

    characterRotate.value = withRepeat(
      withSequence(
        withSpring(-5, { damping: 8, stiffness: 90 }),
        withSpring(5, { damping: 8, stiffness: 90 })
      ),
      -1,
      true
    );

    // 2. Objek cerita bergerak
    itemFloatX.value = withRepeat(
      withSequence(
        withSpring(12, { damping: 7, stiffness: 100 }),
        withSpring(-12, { damping: 7, stiffness: 100 })
      ),
      -1,
      true
    );

    itemFloatY.value = withRepeat(
      withSequence(
        withSpring(-10, { damping: 5, stiffness: 130 }),
        withSpring(0, { damping: 5, stiffness: 130 })
      ),
      -1,
      true
    );

    // 3. Awan dan sinar bergerak perlahan di latar
    cloudX.value = withRepeat(
      withSequence(
        withSpring(24, { damping: 10, stiffness: 40 }),
        withSpring(-24, { damping: 10, stiffness: 40 })
      ),
      -1,
      true
    );

    sparkleScale.value = withRepeat(
      withSequence(
        withSpring(1.3, { damping: 6, stiffness: 160 }),
        withSpring(0.85, { damping: 6, stiffness: 160 })
      ),
      -1,
      true
    );
  }, [storyId, pageIndex]);

  const animatedCharacterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: characterY.value },
      { scale: characterScale.value },
      { rotate: `${characterRotate.value}deg` },
    ],
  }));

  const animatedItemStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: itemFloatX.value },
      { translateY: itemFloatY.value },
    ],
  }));

  const animatedCloudStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudX.value }],
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  const animatedStageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const handleStagePress = () => {
    tapScale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 400 }),
      withSpring(1.0, { damping: 8, stiffness: 220 })
    );
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      container.sound.sfx('pop');
    } catch {}
  };

  const isAntStory = storyId.includes('semut') || coverEmoji === '🐜';
  const mainHero = isAntStory ? '🐜' : coverEmoji;
  const companionOrProp = illustrationEmoji;

  return (
    <Animated.View style={animatedStageStyle}>
      <Pressable onPress={handleStagePress} style={[styles.canvas, { borderColor: themeColor }]}>
        {/* Background Nature Backdrop */}
        <View style={styles.skyLayer}>
          <Animated.View style={[styles.cloudBox, animatedCloudStyle]}>
            <Text style={{ fontSize: 28 }}>☁️</Text>
          </Animated.View>
          <Animated.View style={[styles.sunBox, animatedSparkleStyle]}>
            <Text style={{ fontSize: 32 }}>☀️</Text>
          </Animated.View>
          <Animated.View style={[styles.sparkleBox, animatedSparkleStyle]}>
            <Text style={{ fontSize: 20 }}>✨</Text>
          </Animated.View>
        </View>

        {/* Main Animated Cartoon Action Stage */}
        <View style={styles.stage}>
          {isAntStory ? (
            <View style={styles.antCarryingBreadStage}>
              <Animated.View style={[styles.heldItem, animatedItemStyle]}>
                <Text style={{ fontSize: 54 }}>{companionOrProp || '🍞'}</Text>
              </Animated.View>
              <Animated.View style={[styles.heroAnt, animatedCharacterStyle]}>
                <Text style={{ fontSize: 68 }}>🐜</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.generalDuoStage}>
              <Animated.View style={[styles.heroBox, animatedCharacterStyle]}>
                <Text style={{ fontSize: 72 }}>{mainHero}</Text>
              </Animated.View>
              {companionOrProp && companionOrProp !== mainHero && (
                <Animated.View style={[styles.propBox, animatedItemStyle]}>
                  <Text style={{ fontSize: 52 }}>{companionOrProp}</Text>
                </Animated.View>
              )}
            </View>
          )}
        </View>

        {/* Ground Grass / Trail Layer */}
        <View style={styles.groundLayer}>
          <Text style={styles.groundDetails}>🌿 🌱 🌸 🌾 🌱 🌿</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 195,
    backgroundColor: '#F0FDF4',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 3,
    borderBottomWidth: 6,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  skyLayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 1,
  },
  cloudBox: {
    opacity: 0.85,
  },
  sunBox: {
    position: 'absolute',
    right: 24,
    top: 8,
  },
  sparkleBox: {
    position: 'absolute',
    left: width * 0.45,
    top: 14,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  antCarryingBreadStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heldItem: {
    marginBottom: -10,
    zIndex: 3,
  },
  heroAnt: {
    zIndex: 2,
  },
  generalDuoStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  heroBox: {
    zIndex: 2,
  },
  propBox: {
    zIndex: 2,
  },
  groundLayer: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#BBF7D0',
    zIndex: 1,
  },
  groundDetails: {
    fontSize: 16,
    letterSpacing: 6,
  },
});
