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
import { GameDef } from '../../games/registry';
import { BreathingPlayButton } from './BreathingPlayButton';

interface GameCard3DProps {
  item: GameDef;
  index: number;
  onLaunch: (game: GameDef) => void;
}

/**
 * 3D Game Card Component dengan Golden Rules:
 * 1. Staggered Entrance: Muncul memantul dari bawah dengan jeda index * 100ms via pure withSpring
 * 2. 3D Card: Tebal border bawah (borderBottomWidth: 6) dengan warna tepi gelap (item.edge)
 * 3. Multisensory Press: Scale down 0.98, tactile haptic, pop SFX
 * 4. Breathing 'Main 🚀' Button terintegrasi dengan swoosh sound & 3D push-in effect
 */
export const GameCard3D: React.FC<GameCard3DProps> = ({
  item,
  index,
  onLaunch,
}) => {
  // Staggered Entrance Physics
  const entranceY = useSharedValue(55);
  const entranceOpacity = useSharedValue(0);
  const entranceScale = useSharedValue(0.92);

  // Card Press Physics
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const cardShadow = useSharedValue(1);

  useEffect(() => {
    // Staggered delay: 100ms antar kartu
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

  const handleCardPressIn = () => {
    cardScale.value = withSpring(0.975, { damping: 12, stiffness: 220 });
    cardTranslateY.value = withSpring(2, { damping: 12, stiffness: 220 });
    cardShadow.value = withSpring(0.5, { damping: 12, stiffness: 220 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.sound.sfx('pop');
  };

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1.0, { damping: 10, stiffness: 160 });
    cardTranslateY.value = withSpring(0, { damping: 10, stiffness: 160 });
    cardShadow.value = withSpring(1.0, { damping: 10, stiffness: 160 });
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: entranceOpacity.value,
      transform: [
        { translateY: entranceY.value + cardTranslateY.value },
        { scale: entranceScale.value * cardScale.value },
      ],
      shadowOpacity: 0.16 * cardShadow.value,
      elevation: 4 * cardShadow.value,
    };
  });

  return (
    <Animated.View style={[styles.outerShadowWrapper, animatedCardStyle]}>
      <Pressable
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        onPress={() => onLaunch(item)}
        style={[styles.cardContainer, { borderBottomColor: item.edge }]}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.desc}`}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFFDF7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* 3D Emoji Badge */}
          <View
            style={[
              styles.emojiBox,
              { backgroundColor: item.color + '22', borderBottomColor: item.edge },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF60', '#00000015']}
              style={styles.emojiGradient}
            >
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </LinearGradient>
          </View>

          {/* Card Information */}
          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.desc}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.featurePill, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.featurePillText, { color: item.edge }]}>
                  ⭐ 30 Soal Bertingkat
                </Text>
              </View>
            </View>
          </View>

          {/* 3D Breathing Play Button */}
          <View style={styles.btnCol}>
            <BreathingPlayButton
              label="Main 🚀"
              color={item.color}
              edge={item.edge}
              onPress={() => onLaunch(item)}
            />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerShadowWrapper: {
    shadowColor: '#2D3748',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 14,
  },
  cardContainer: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EFE7D2',
    // 3D Card: Tebal border bawah
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
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  featurePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  featurePillText: {
    fontFamily: fonts.heavy,
    fontSize: 10.5,
  },
  btnCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

