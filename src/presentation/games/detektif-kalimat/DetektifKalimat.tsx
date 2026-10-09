import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { SENTENCES } from '../../../data/content/curriculum';
import { ReadingSentence } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

/**
 * 🕵️ Detektif Kalimat (Kata yang Hilang)
 * Tampilan diperbarui: Huruf pilihan kata ekstra besar (Font 28px, Bold Tebal),
 * kontras tajam, tombol lebar, dan ramah anak.
 */
export function DetektifKalimat({ onExit }: { onExit: () => void }) {
  const session = useGameSession('detektif-kalimat', 30);

  const [currentSentence, setCurrentSentence] = useState<ReadingSentence>(SENTENCES[0]);
  const [blankSentenceText, setBlankSentenceText] = useState('');
  const [options, setOptions] = useState<{ word: string; emoji: string }[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wobbleWord, setWobbleWord] = useState<string | null>(null);
  const [wobbleToken, setWobbleToken] = useState(0);

  useEffect(() => {
    if (session.finished) return;
    const st = SENTENCES[session.round % SENTENCES.length] || SENTENCES[0];
    setCurrentSentence(st);

    // Ganti kata jawaban di dalam kalimat dengan tanda misteri [ ? ]
    const regex = new RegExp(`\\b${st.answer}\\b`, 'i');
    const blank = st.text.replace(regex, '[  ❓  ]');
    setBlankSentenceText(blank);

    // Buat 4 opsi kata (1 benar + 3 pengecoh)
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
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      session.correct(`detektif-${currentSentence.id}`);
    } else {
      setWobbleWord(word);
      setWobbleToken((t) => t + 1);
      container.sound.sfx('boop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        {/* Mystery Sentence Card */}
        <View style={styles.mysteryCard}>
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
        </View>

        <Text style={styles.instruction}>
          Pilih kata bertulisan besar yang tepat untuk mengisi kalimat:
        </Text>

        {/* 4 Large Word Option Cards */}
        <View style={styles.cardsGrid}>
          {options.map((opt) => {
            const isPicked = selectedWord === opt.word;
            const isWobbling = wobbleWord === opt.word;
            return (
              <View key={opt.word} style={styles.cardWrapper}>
                <Wobble token={isWobbling ? wobbleToken : 0}>
                  <Pressable
                    onPress={() => handleSelect(opt.word)}
                    style={[
                      styles.card,
                      raised(isPicked ? colors.mintDark : '#CBD5E1'),
                      {
                        backgroundColor: isPicked ? '#DCFCE7' : '#FFFFFF',
                        borderColor: isPicked ? '#22C55E' : '#E2E8F0',
                      },
                    ]}
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
                  </Pressable>
                </Wobble>
              </View>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', gap: 10 },
  mysteryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    gap: 10,
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
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
  card: {
    width: '100%',
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2.5,
    minHeight: 105,
  },
  cardEmoji: { fontSize: 38 },
  cardWord: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: '#0F172A',
    letterSpacing: 1.5,
  },
});
