import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
 * - Karakter utama melompat/berjalan/bernapas secara dinamis.
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

  useEffect(() => {
    // 1. Karakter bergerak aktif (bouncing / breathing animation)
    characterY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 650 }),
        withTiming(0, { duration: 650 })
      ),
      -1,
      true
    );

    characterScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 650 }),
        withTiming(0.98, { duration: 650 })
      ),
      -1,
      true
    );

    characterRotate.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 750 }),
        withTiming(4, { duration: 750 })
      ),
      -1,
      true
    );

    // 2. Objek yang dibawa / item cerita bergerak
    itemFloatX.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 900 }),
        withTiming(-10, { duration: 900 })
      ),
      -1,
      true
    );

    itemFloatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 550 }),
        withTiming(0, { duration: 550 })
      ),
      -1,
      true
    );

    // 3. Awan dan sinar bergerak perlahan di latar
    cloudX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 2500 }),
        withTiming(-20, { duration: 2500 })
      ),
      -1,
      true
    );

    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 800 }),
        withTiming(0.85, { duration: 800 })
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

  // Deteksi khusus jika cerita tentang semut (Soni si Semut Hitam)
  const isAntStory = storyId.includes('semut') || coverEmoji === '🐜';
  const mainHero = isAntStory ? '🐜' : coverEmoji;
  const companionOrProp = illustrationEmoji;

  return (
    <View style={[styles.canvas, { borderColor: themeColor }]}>
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
          /* Semut membawa remah roti di kepalanya */
          <View style={styles.antCarryingBreadStage}>
            {/* Roti di atas semut */}
            <Animated.View style={[styles.heldItem, animatedItemStyle]}>
              <Text style={{ fontSize: 54 }}>{companionOrProp || '🍞'}</Text>
            </Animated.View>
            {/* Semut berjalan dengan kakinya */}
            <Animated.View style={[styles.heroAnt, animatedCharacterStyle]}>
              <Text style={{ fontSize: 68 }}>🐜</Text>
            </Animated.View>
          </View>
        ) : (
          /* Karakter umum berinteraksi dengan objek cerita */
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
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 195,
    backgroundColor: '#F0FDF4',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 3,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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

