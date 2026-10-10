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
import { EducationalStory } from '../../../data/content/storiesData';
import { BreathingPlayButton } from '../games/BreathingPlayButton';

interface StoryCard3DProps {
  story: EducationalStory;
  index: number;
  onOpen: (story: EducationalStory) => void;
}

/**
 * 3D Story Card Component dengan Golden Rules:
 * 1. Staggered Entrance: Muncul bertahap 100ms per kartu via withSpring
 * 2. 3D Card: Tebal border bawah (borderBottomWidth: 6) dengan warna tema cerita
 * 3. Multisensory Press: Scale down 0.98, tactile haptic, pop SFX
 * 4. Breathing Read Button: Animasi bernapas 1-2%, 3D push-in, swoosh audio
 */
export const StoryCard3D: React.FC<StoryCard3DProps> = ({
  story,
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
        onPress={() => onOpen(story)}
        style={[styles.cardContainer, { borderBottomColor: story.themeColor }]}
        accessibilityRole="button"
        accessibilityLabel={`${story.title}, ${story.category}`}
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
                backgroundColor: story.themeColor + '20',
                borderBottomColor: story.themeColor,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF60', '#00000015']}
              style={styles.emojiGradient}
            >
              <Text style={styles.emojiText}>{story.coverEmoji}</Text>
            </LinearGradient>
          </View>

          {/* Story Details */}
          <View style={styles.infoCol}>
            <View style={styles.categoryPillRow}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: story.themeColor + '20' },
                ]}
              >
                <Text style={[styles.categoryPillText, { color: story.themeColor }]}>
                  {story.category}
                </Text>
              </View>
              <Text style={styles.pageCountText}>
                {story.pages.length} Halaman
              </Text>
            </View>

            <Text style={styles.storyTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.moralText} numberOfLines={1}>
              💡 {story.moral}
            </Text>
          </View>

          {/* 3D Breathing Button */}
          <View style={styles.btnCol}>
            <BreathingPlayButton
              label="Baca 📖"
              color={story.themeColor}
              edge={story.themeColor}
              onPress={() => onOpen(story)}
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
  categoryPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    fontFamily: fonts.heavy,
    fontSize: 11,
  },
  pageCountText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  storyTitle: {
    fontFamily: fonts.black,
    fontSize: 15.5,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  moralText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  btnCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

