import React, { useEffect, useState } from 'react';
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
import { SENTENCES } from '../../../data/content/curriculum';
import { ReadingSentence } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

interface OptionItem {
  word: string;
  emoji: string;
}

function TactileWordCard({
  opt,
  isPicked,
  isWobbling,
  wobbleToken,
  onSelect,
}: {
  opt: OptionItem;
  isPicked: boolean;
  isWobbling: boolean;
  wobbleToken: number;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const pressY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: pressY.value },
    ],
  }));

  return (
    <View style={styles.cardWrapper}>
      <Wobble token={isWobbling ? wobbleToken : 0}>
        <Animated.View style={animStyle}>
          <Pressable
            onPressIn={() => {
              scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
              pressY.value = withSpring(3, { damping: 14, stiffness: 350 });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
              pressY.value = withSpring(0, { damping: 10, stiffness: 200 });
            }}
            onPress={onSelect}
            style={[
              styles.card3D,
              {
                borderColor: isPicked ? '#22C55E' : '#E2E8F0',
                borderBottomColor: isPicked ? '#15803D' : '#CBD5E1',
              },
            ]}
          >
            <LinearGradient
              colors={isPicked ? ['#DCFCE7', '#BBF7D0'] : ['#FFFFFF', '#F8FAFC']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.cardWord,
                  isPicked && { color: '#15803D' },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {opt.word.toUpperCase()}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Wobble>
    </View>
  );
}

/**
 * 🕵️ Detektif Kalimat (Kata yang Hilang)
 * Upgraded with Golden Rules: Tactile 3D cards, spring physics, and multisensory feedback.
 */
export function DetektifKalimat({ onExit }: { onExit: () => void }) {
  const session = useGameSession('detektif-kalimat', 30);

  const [currentSentence, setCurrentSentence] = useState<ReadingSentence>(SENTENCES[0]);
  const [blankSentenceText, setBlankSentenceText] = useState('');
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wobbleWord, setWobbleWord] = useState<string | null>(null);
  const [wobbleToken, setWobbleToken] = useState(0);

  useEffect(() => {
    if (session.finished) return;
    const st = SENTENCES[session.round % SENTENCES.length] || SENTENCES[0];
    setCurrentSentence(st);

    const regex = new RegExp(`\\b${st.answer}\\b`, 'i');
    const blank = st.text.replace(regex, '[  ❓  ]');
    setBlankSentenceText(blank);

    const distractors = [
      { word: 'roti', emoji: '🍞' },
      { word: 'susu', emoji: '🥛' },
      { word: 'kopi', emoji: '☕' },
      { word: 'ikan', emoji: '🐟' },
      { word: 'buku', emoji: '📕' },
      { word: 'sapu', emoji: '🧹' },
      { word: 'mobil', emoji: '🚗' },
      { word: 'langit', emoji: '☁️' },
      { word: 'daun', emoji: '🍃' },
      { word: 'kolam', emoji: '🏊' },
    ].filter((d) => d.word.toLowerCase() !== st.answer.toLowerCase());

    const chosenDistractors = [...distractors].sort(() => Math.random() - 0.5).slice(0, 3);
    const allChoices = [
      { word: st.answer, emoji: st.emoji },
      ...chosenDistractors,
    ].sort(() => Math.random() - 0.5);

    setOptions(allChoices);
    setSelectedWord(null);
    setWobbleWord(null);

    const t = setTimeout(() => {
      container.sound.speak(st.text);
    }, 400);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const hearSentence = () => {
    container.sound.speak(currentSentence.text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelect = (word: string) => {
    if (selectedWord) return;
    const isCorrect = word.toLowerCase() === currentSentence.answer.toLowerCase();

    if (isCorrect) {
      setSelectedWord(word);
      container.sound.sfx('tada_magic');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      session.correct(`detektif-${currentSentence.id}`);
    } else {
      setWobbleWord(word);
      setWobbleToken((t) => t + 1);
      container.sound.sfx('error_buzz');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      session.wrong();
    }
  };

  return (
    <GameShell
      title="Detektif Kalimat"
      emoji="🕵️"
      color={colors.peach}
      session={session}
      onExit={onExit}
    >
      <View style={styles.container}>
        {/* Mystery Sentence Card: 3D Gradient Surface */}
        <View style={styles.mysteryCard3D}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFBF5']}
            style={styles.mysteryGradient}
          >
            <View style={styles.mysteryHeaderRow}>
              <Text style={styles.mysteryEmoji}>{currentSentence.emoji}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔍 Cari Kata yang Hilang:</Text>
              </View>
            </View>

            <Text style={styles.sentenceText}>
              {selectedWord ? currentSentence.text : blankSentenceText}
            </Text>

            <BigButton
              label="🔊 Dengarkan Kalimat Cici"
              small
              color={colors.mint}
              edge={colors.mintDark}
              onPress={hearSentence}
            />
          </LinearGradient>
        </View>

        <Text style={styles.instruction}>
          Pilih kata bertulisan besar yang tepat untuk mengisi kalimat:
        </Text>

        {/* 4 Large Word Option Cards */}
        <View style={styles.cardsGrid}>
          {options.map((opt) => (
            <TactileWordCard
              key={opt.word}
              opt={opt}
              isPicked={selectedWord === opt.word}
              isWobbling={wobbleWord === opt.word}
              wobbleToken={wobbleToken}
              onSelect={() => handleSelect(opt.word)}
            />
          ))}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', gap: 10 },
  mysteryCard3D: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
    borderBottomColor: '#FDBA74',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  mysteryGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  mysteryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mysteryEmoji: { fontSize: 44 },
  badge: {
    backgroundColor: '#FFF0EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  badgeText: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: colors.peachDark,
  },
  sentenceText: {
    fontFamily: fonts.black,
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 34,
    marginVertical: 4,
  },
  instruction: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  cardsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  card3D: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderBottomWidth: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 105,
  },
  cardEmoji: { fontSize: 38 },
  cardWord: {
    fontFamily: fonts.black,
    fontSize: 26,
    color: '#0F172A',
    letterSpacing: 1.5,
  },
});
