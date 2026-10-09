import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { SENTENCES } from '../../../data/content/curriculum';
import { ReadingSentence } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

/**
 * 🕵️ Detektif Kalimat (Kata yang Hilang)
 * Tingkat Kesulitan Tinggi: Melengkapi kalimat rumpang dengan memilih kata yang tepat dari 4 opsi kata yang mirip.
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

    // Ganti kata jawaban di dalam kalimat dengan [ ... ]
    const regex = new RegExp(`\\b${st.answer}\\b`, 'i');
    const blank = st.text.replace(regex, '[ . . . ]');
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
  };

  const handleSelect = (word: string) => {
    if (selectedWord) return; // hindari double tap
    const isCorrect = word.toLowerCase() === currentSentence.answer.toLowerCase();

    if (isCorrect) {
      setSelectedWord(word);
      container.sound.sfx('chime');
      session.correct(`detektif-${currentSentence.id}`);
    } else {
      setWobbleWord(word);
      setWobbleToken((t) => t + 1);
      container.sound.sfx('boop');
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
          <Text style={styles.mysteryEmoji}>{currentSentence.emoji}</Text>
          <Text style={styles.badge}>🔍 Cari Kata yang Hilang:</Text>
          <Text style={styles.sentenceText}>
            {selectedWord
              ? currentSentence.text
              : blankSentenceText}
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
          Ketuk kartu kata yang tepat untuk melengkapi kalimat:
        </Text>

        {/* 4 Word Cards Grid */}
        <View style={styles.cardsGrid}>
          {options.map((opt) => {
            const isPicked = selectedWord === opt.word;
            const isWobbling = wobbleWord === opt.word;
            return (
              <Wobble key={opt.word} token={isWobbling ? wobbleToken : 0}>
                <Pressable
                  onPress={() => handleSelect(opt.word)}
                  style={[
                    styles.card,
                    raised(isPicked ? colors.mintDark : colors.line),
                    {
                      backgroundColor: isPicked ? colors.mint : '#FFFFFF',
                      borderColor: isPicked ? colors.mintDark : colors.line,
                    },
                  ]}
                >
                  <Text style={styles.cardEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.cardWord, isPicked && { color: colors.ink }]}>
                    {opt.word}
                  </Text>
                </Pressable>
              </Wobble>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  mysteryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    gap: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  mysteryEmoji: { fontSize: 60 },
  badge: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.peachDark,
    backgroundColor: '#FFF0EA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  sentenceText: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 30,
    marginVertical: 4,
  },
  instruction: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  cardsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    minHeight: 90,
  },
  cardEmoji: { fontSize: 32 },
  cardWord: {
    fontFamily: fonts.black,
    fontSize: 20,
    color: colors.ink,
  },
});

