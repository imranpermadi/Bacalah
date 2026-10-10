import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '../../../core/theme';
import { container } from '../../../core/di/container';
import { InteractiveComic } from '../../../data/content/comicsData';
import { BreathingPlayButton } from '../games/BreathingPlayButton';

interface ComicCard3DProps {
  comic: InteractiveComic;
  index: number;
  onOpen: (comic: InteractiveComic) => void;
}

/**
 * 3D Comic Card Component dengan Golden Rules:
 * 1. Staggered Entrance: Muncul bertahap 100ms per kartu via withSpring
 * 2. 3D Card: Border bawah tebal (borderBottomWidth: 6) dengan warna aksen komik
 * 3. Multisensory Press: Scale 0.98, tactile haptic, pop SFX
 * 4. Breathing Play/Read Button: Animasi bernapas 1-2%, 3D push-in, swoosh audio
 */
export const ComicCard3D: React.FC<ComicCard3DProps> = ({
  comic,
  index,
  onOpen,
}) => {
  const entranceY = useSharedValue(55);
  const entranceOpacity = useSharedValue(0);
  const entranceScale = useSharedValue(0.92);

  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const cardShadow = useSharedValue(1);

  useEffect(() => {
    const delay = index * 100;
    entranceY.value = withDelay(
      delay,
      withSpring(0, { damping: 14, stiffness: 120 })
    );
    entranceOpacity.value = withDelay(
      delay,
      withSpring(1, { damping: 16, stiffness: 140 })
    );
    entranceScale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 110 })
    );
  }, [entranceOpacity, entranceScale, entranceY, index]);

  const handlePressIn = () => {
    cardScale.value = withSpring(0.975, { damping: 12, stiffness: 220 });
    cardTranslateY.value = withSpring(2, { damping: 12, stiffness: 220 });
    cardShadow.value = withSpring(0.5, { damping: 12, stiffness: 220 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1.0, { damping: 10, stiffness: 160 });
    cardTranslateY.value = withSpring(0, { damping: 10, stiffness: 160 });
    cardShadow.value = withSpring(1.0, { damping: 10, stiffness: 160 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
    transform: [
      { translateY: entranceY.value + cardTranslateY.value },
      { scale: entranceScale.value * cardScale.value },
    ],
    shadowOpacity: 0.16 * cardShadow.value,
    elevation: 4 * cardShadow.value,
  }));

  return (
    <Animated.View style={[styles.outerWrapper, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onOpen(comic)}
        style={[styles.cardContainer, { borderBottomColor: comic.accentColor }]}
        accessibilityRole="button"
        accessibilityLabel={`${comic.title}, ${comic.theme}`}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFFDF7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* 3D Emoji Avatar */}
          <View
            style={[
              styles.emojiBox,
              {
                backgroundColor: comic.accentColor + '20',
                borderBottomColor: comic.accentColor,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF60', '#00000015']}
              style={styles.emojiGradient}
            >
              <Text style={styles.emojiText}>{comic.coverEmoji}</Text>
            </LinearGradient>
          </View>

          {/* Comic Details */}
          <View style={styles.infoCol}>
            <View style={styles.themePillRow}>
              <View
                style={[
                  styles.themePill,
                  { backgroundColor: comic.accentColor + '20' },
                ]}
              >
                <Text style={[styles.themePillText, { color: comic.accentColor }]}>
                  {comic.theme}
                </Text>
              </View>
              <Text style={styles.panelCountText}>
                {comic.panels.length} Percakapan
              </Text>
            </View>

            <Text style={styles.comicTitle} numberOfLines={2}>
              {comic.title}
            </Text>
          </View>

          {/* 3D Breathing Button */}
          <View style={styles.btnCol}>
            <BreathingPlayButton
              label="Baca 🎙️"
              color={comic.accentColor}
              edge={comic.accentColor}
              onPress={() => onOpen(comic)}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    shadowColor: '#2D3748',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 14,
  },
  cardContainer: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EFE7D2',
    borderBottomWidth: 6,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  emojiBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF90',
    borderBottomWidth: 3.5,
    overflow: 'hidden',
  },
  emojiGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 30,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  themePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  themePillText: {
    fontFamily: fonts.heavy,
    fontSize: 11,
  },
  panelCountText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  comicTitle: {
    fontFamily: fonts.black,
    fontSize: 15.5,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  btnCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
