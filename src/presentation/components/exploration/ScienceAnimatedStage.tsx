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
import { NatureScienceFact } from '../../../data/content/natureScienceData';

const { width } = Dimensions.get('window');

interface Props {
  fact: NatureScienceFact;
}

/**
 * 🔬 ScienceAnimatedStage
 * Visualizer sains bergerak dengan animasi interaktif untuk anak dengan Golden Rules:
 * - Antariksa: Bulan mengorbit Bumi dengan fisika spring.
 * - Tubuh: Jantung berdetak nyata (lub-dub spring pulsation).
 * - Cuaca: Awan hujan dengan tetesan air & pelangi bersinar.
 * - Tumbuhan: Tunas tumbuh dan fotosintesis energi matahari.
 */
export function ScienceAnimatedStage({ fact }: Props) {
  const orbitX = useSharedValue(0);
  const orbitY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const rotateDeg = useSharedValue(0);
  const rainDropY = useSharedValue(0);
  const leafSway = useSharedValue(0);

  const stageScale = useSharedValue(1);

  useEffect(() => {
    // 1. Animasi Orbit Antariksa dengan Spring Physics
    orbitX.value = withRepeat(
      withSequence(
        withSpring(45, { damping: 10, stiffness: 60 }),
        withSpring(0, { damping: 10, stiffness: 60 }),
        withSpring(-45, { damping: 10, stiffness: 60 }),
        withSpring(0, { damping: 10, stiffness: 60 })
      ),
      -1,
      true
    );
    orbitY.value = withRepeat(
      withSequence(
        withSpring(-18, { damping: 10, stiffness: 60 }),
        withSpring(0, { damping: 10, stiffness: 60 }),
        withSpring(18, { damping: 10, stiffness: 60 }),
        withSpring(0, { damping: 10, stiffness: 60 })
      ),
      -1,
      true
    );

    // 2. Animasi Detak Jantung / Pulsa Tubuh (Lub-Dub rhythm dengan Spring)
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.24, { damping: 5, stiffness: 220 }),
        withSpring(1.06, { damping: 6, stiffness: 200 }),
        withSpring(1.3, { damping: 4, stiffness: 240 }),
        withSpring(1.0, { damping: 8, stiffness: 150 })
      ),
      -1,
      true
    );

    // 3. Animasi Berputar / Rotasi
    rotateDeg.value = withRepeat(
      withSequence(
        withSpring(15, { damping: 7, stiffness: 100 }),
        withSpring(-15, { damping: 7, stiffness: 100 })
      ),
      -1,
      true
    );

    // 4. Animasi Tetesan Air Hujan
    rainDropY.value = withRepeat(
      withSequence(
        withSpring(24, { damping: 5, stiffness: 180 }),
        withSpring(0, { damping: 8, stiffness: 220 })
      ),
      -1,
      false
    );

    // 5. Animasi Daun / Tumbuhan Bergoyang
    leafSway.value = withRepeat(
      withSequence(
        withSpring(10, { damping: 6, stiffness: 90 }),
        withSpring(-10, { damping: 6, stiffness: 90 })
      ),
      -1,
      true
    );
  }, [fact.id]);

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: orbitX.value },
      { translateY: orbitY.value },
    ],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateDeg.value}deg` }],
  }));

  const animatedRainStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rainDropY.value }],
  }));

  const animatedLeafStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leafSway.value}deg` }],
  }));

  const animatedStageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stageScale.value }],
  }));

  const handleStageTap = () => {
    stageScale.value = withSequence(
      withSpring(0.96, { damping: 12, stiffness: 350 }),
      withSpring(1.0, { damping: 8, stiffness: 220 })
    );
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      container.sound.sfx('chime');
    } catch {}
  };

  const renderScienceScene = () => {
    const cat = fact.category.toLowerCase();

    if (cat.includes('antariksa') || fact.id.includes('bulan') || fact.id.includes('matahari')) {
      return (
        <View style={styles.sceneContainer}>
          <Text style={styles.starsBg}>✨ 🌟 ✨ 🌌 ✨</Text>
          <View style={styles.solarCenter}>
            <Text style={{ fontSize: 72 }}>🌍</Text>
            <Animated.View style={[styles.orbitingMoon, animatedOrbitStyle]}>
              <Text style={{ fontSize: 38 }}>🌕</Text>
            </Animated.View>
          </View>
          <Text style={styles.sceneCaption}>Bulan Mengelilingi Bumi Setiap 27 Hari! 🪐</Text>
        </View>
      );
    }

    if (cat.includes('tubuh') || fact.id.includes('jantung')) {
      return (
        <View style={styles.sceneContainer}>
          <Animated.View style={[styles.heartPulseBox, animatedPulseStyle]}>
            <Text style={{ fontSize: 88 }}>❤️</Text>
          </Animated.View>
          <View style={styles.pulseWaves}>
            <Text style={{ fontSize: 24, letterSpacing: 8 }}>💓 💓 💓</Text>
          </View>
          <Text style={styles.sceneCaption}>Detak Jantung Memompa Darah Segar! 🩺</Text>
        </View>
      );
    }

    if (cat.includes('cuaca') || fact.id.includes('pelangi') || fact.id.includes('hujan')) {
      return (
        <View style={styles.sceneContainer}>
          <View style={styles.weatherTopRow}>
            <Animated.View style={animatedRotateStyle}>
              <Text style={{ fontSize: 52 }}>☀️</Text>
            </Animated.View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 60 }}>🌧️</Text>
              <Animated.View style={animatedRainStyle}>
                <Text style={{ fontSize: 20 }}>💧 💧 💧</Text>
              </Animated.View>
            </View>
          </View>
          <View style={styles.rainbowArch}>
            <Text style={{ fontSize: 56 }}>🌈</Text>
          </View>
          <Text style={styles.sceneCaption}>Cahaya Matahari Dibiaskan oleh Tetes Air! ✨</Text>
        </View>
      );
    }

    if (cat.includes('tumbuhan') || fact.id.includes('tanaman')) {
      return (
        <View style={styles.sceneContainer}>
          <View style={styles.sunBeamRow}>
            <Text style={{ fontSize: 44 }}>☀️</Text>
            <Text style={{ fontSize: 20, color: '#F59E0B' }}>✨ ✨ ✨</Text>
          </View>
          <Animated.View style={[styles.plantGrowBox, animatedLeafStyle]}>
            <Text style={{ fontSize: 78 }}>🌱</Text>
          </Animated.View>
          <Text style={styles.sceneCaption}>Fotosintesis: Mengubah Cahaya Jadi Makanan! 🍃</Text>
        </View>
      );
    }

    // Default Hewan & Sains Umum
    return (
      <View style={styles.sceneContainer}>
        <Animated.View style={[styles.animalHeroBox, animatedPulseStyle]}>
          <Text style={{ fontSize: 82 }}>{fact.emoji}</Text>
        </Animated.View>
        <View style={styles.animalPropsRow}>
          <Animated.View style={animatedRotateStyle}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </Animated.View>
          <Text style={{ fontSize: 24 }}>🌿 🌾</Text>
          <Animated.View style={animatedRotateStyle}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </Animated.View>
        </View>
        <Text style={styles.sceneCaption}>Keajaiban Alam Ciptaan Tuhan yang Luar Biasa! 🔍</Text>
      </View>
    );
  };

  return (
    <Animated.View style={animatedStageStyle}>
      <Pressable onPress={handleStageTap} style={[styles.canvasFrame, { borderColor: fact.accentColor }]}>
        {renderScienceScene()}
        <View style={styles.tapPromptRow}>
          <Text style={styles.tapPromptText}>👆 Ketuk panggung animasi untuk efek suara!</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  canvasFrame: {
    width: '100%',
    minHeight: 215,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sceneContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  starsBg: {
    fontSize: 16,
    letterSpacing: 10,
    marginBottom: 6,
    opacity: 0.8,
  },
  solarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    height: 90,
  },
  orbitingMoon: {
    position: 'absolute',
    top: -10,
  },
  heartPulseBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 95,
  },
  pulseWaves: {
    marginTop: 6,
  },
  weatherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginBottom: -8,
  },
  rainbowArch: {
    alignItems: 'center',
  },
  sunBeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: -4,
  },
  plantGrowBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalHeroBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  animalPropsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  sceneCaption: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
  },
  tapPromptRow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tapPromptText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
