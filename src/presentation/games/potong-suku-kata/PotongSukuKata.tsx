import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { BigButton } from '../../components/common/ui';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

const { width } = Dimensions.get('window');

/**
 * ✂️ Game Potong Suku Kata Fleksibel & Menantang
 * - Kata ditampilkan sebagai deretan balok huruf utuh.
 * - Tombol gunting ✂️ tersedia di SETIAP sela antar huruf (anak bebas memilih di mana memotong).
 * - Jika memotong di tempat yang benar: balok membelah menjadi suku kata, suara fonik berbunyi, dan dapat bintang!
 * - Jika memotong di tempat yang salah: gunting bergoyang merah, suara boop, dan Cici memberi petunjuk suku kata yang tepat!
 */
export function PotongSukuKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession('potong', 30);
  const recordLetter = useAppStore((s) => s.recordLetter);

  const [wordItem, setWordItem] = useState<WordItem>(() => pickWord());
  const [successfulCuts, setSuccessfulCuts] = useState<number[]>([]);
  const [wrongCutIndex, setWrongCutIndex] = useState<number | null>(null);
  const [hintMessage, setHintMessage] = useState<string>('');

  // Wobble shared value for incorrect cut
  const wobbleX = useSharedValue(0);

  // Calculate correct cut gap indices
  // For 'BOLA' (['BO', 'LA']), length 4: gap index 2 is correct (between O and L).
  // For 'KELINCI' (['KE', 'LIN', 'CI']), length 7: gap index 2 and 5 are correct.
  const correctCutIndices = useMemo(() => {
    const indices: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < wordItem.syllables.length - 1; i++) {
      cumulative += wordItem.syllables[i].length;
      indices.push(cumulative);
    }
    return indices;
  }, [wordItem]);

  useEffect(() => {
    if (session.finished) return;
    const w = pickWord();
    setWordItem(w);
    setSuccessfulCuts([]);
    setWrongCutIndex(null);
    setHintMessage('');

    const t = setTimeout(() => {
      container.sound.hearSlow(w.syllables.map((s) => s.toLowerCase()));
    }, 450);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const letters = wordItem.word.toUpperCase().split('');
  const totalCutsNeeded = correctCutIndices.length;

  const handleCutGap = (gapIndex: number) => {
    // Gap index corresponds to cut between letters[gapIndex - 1] and letters[gapIndex]
    if (successfulCuts.includes(gapIndex)) return;

    const isCorrect = correctCutIndices.includes(gapIndex);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      container.sound.sfx('pop');

      const nextCuts = [...successfulCuts, gapIndex];
      setSuccessfulCuts(nextCuts);
      setWrongCutIndex(null);

      // Find which syllable was just isolated
      const sortedCuts = [0, ...nextCuts.sort((a, b) => a - b), letters.length];
      const cutPos = sortedCuts.indexOf(gapIndex);
      const sylText = wordItem.word.slice(sortedCuts[cutPos - 1], gapIndex);
      if (sylText) {
        container.sound.hear(sylText.toLowerCase());
      }

      setHintMessage(`Bagus! Potongan "${sylText.toUpperCase()}" tepat! ✨`);

      // Check if all syllable boundaries have been cut
      if (nextCuts.length >= totalCutsNeeded) {
        wordItem.word.split('').forEach((l) => recordLetter(l, true));
        container.sound.sfx('chime');
        session.correct(`potong-${wordItem.word}`);
        setHintMessage(`Hore! ${wordItem.word.toUpperCase()} berhasil dipotong: ${wordItem.syllables.join(' - ')}! 🌟`);

        setTimeout(() => {
          container.sound.hear(wordItem.word.toLowerCase());
        }, 550);
      }
    } else {
      // Incorrect cut!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      container.sound.sfx('boop');
      session.wrong();

      setWrongCutIndex(gapIndex);
      wobbleX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );

      setHintMessage(
        `Ups, potongannya belum pas! Suku katanya adalah: ${wordItem.syllables.join(' - ')}. Coba lagi ya! 🐱`
      );

      setTimeout(() => {
        setWrongCutIndex(null);
      }, 1200);
    }
  };

  const wobbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wobbleX.value }],
  }));

  return (
    <GameShell
      title="Potong Suku Kata"
      emoji="✂️"
      color={colors.coral}
      session={session}
      onExit={onExit}
    >
      <View style={styles.container}>
        {/* Top Instruction Card */}
        <View style={styles.topCard}>
          <Text style={styles.wordEmoji}>{wordItem.emoji}</Text>
          <Text style={styles.instructionTitle}>
            Pilih di mana kamu ingin memotong kata menjadi suku kata!
          </Text>
          <Text style={styles.instructionSub}>
            Target: <Text style={{ fontFamily: fonts.black, color: colors.ink }}>{wordItem.word.toUpperCase()}</Text> ({wordItem.syllables.length} Suku Kata: {wordItem.syllables.length - 1} Kali Potong)
          </Text>
          {hintMessage ? (
            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>{hintMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* Word Puzzle Slicing Area */}
        <View style={styles.puzzleArea}>
          <View style={styles.letterStrip}>
            {letters.map((char, index) => {
              const gapIndex = index + 1; // Gap after this letter
              const isLastLetter = index === letters.length - 1;
              const isCutDone = successfulCuts.includes(gapIndex);
              const isCutWrong = wrongCutIndex === gapIndex;
              const isSuggested = session.wrongThisRound >= 2 && correctCutIndices.includes(gapIndex);

              return (
                <View key={index} style={styles.letterSegment}>
                  {/* Letter Block Tile */}
                  <View
                    style={[
                      styles.letterTile,
                      raised(colors.sunnyDark),
                      isCutDone && styles.letterTileSliced,
                    ]}
                  >
                    <Text style={styles.letterChar}>{char}</Text>
                  </View>

                  {/* Scissor Cutter Button between adjacent letters */}
                  {!isLastLetter && (
                    <Animated.View style={[styles.cutterSlot, isCutWrong && wobbleStyle]}>
                      {isCutDone ? (
                        <View style={styles.slicedDivider}>
                          <Text style={styles.slicedIcon}>✨✂️✨</Text>
                          <View style={styles.cutLine} />
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => handleCutGap(gapIndex)}
                          hitSlop={{ top: 20, bottom: 20, left: 12, right: 12 }}
                          style={[
                            styles.scissorBtn,
                            isCutWrong && styles.scissorBtnWrong,
                            isSuggested && styles.scissorBtnSuggested,
                            raised(isCutWrong ? '#B91C1C' : isSuggested ? '#F59E0B' : colors.line),
                          ]}
                        >
                          <Text style={[styles.scissorEmoji, isCutWrong && { opacity: 0.8 }]}>
                            ✂️
                          </Text>
                        </Pressable>
                      )}
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Sliced Syllables Progress Badge */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Terpotong: {successfulCuts.length} / {totalCutsNeeded} bagian
            </Text>
            <View style={styles.dotsRow}>
              {Array.from({ length: totalCutsNeeded }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i < successfulCuts.length && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Audio Helper Controls */}
        <View style={styles.audioControls}>
          <BigButton
            label="🐢 Dengar Suku Kata (Pelan-Pelan)"
            color={colors.peach}
            edge={colors.peachDark}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              container.sound.hearSlow(wordItem.syllables.map((s) => s.toLowerCase()));
            }}
          />
          <BigButton
            label="🔊 Dengar Kata Lengkap"
            small
            color={colors.mint}
            edge={colors.mintDark}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              container.sound.hear(wordItem.word.toLowerCase());
            }}
          />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
    gap: 4,
  },
  wordEmoji: { fontSize: 68 },
  instructionTitle: {
    fontFamily: fonts.heavy,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  instructionSub: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 2,
  },
  hintBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  hintText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  puzzleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  letterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  letterSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterTile: {
    width: 48,
    height: 64,
    backgroundColor: '#FEF08A',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTileSliced: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  letterChar: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.ink,
  },
  cutterSlot: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scissorBtn: {
    width: 44,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scissorBtnWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  scissorBtnSuggested: {
    backgroundColor: '#FEF9C3',
    borderColor: '#F59E0B',
    borderWidth: 2.5,
  },
  scissorEmoji: {
    fontSize: 22,
  },
  slicedDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  slicedIcon: {
    fontSize: 13,
  },
  cutLine: {
    width: 2,
    height: 36,
    backgroundColor: '#22C55E',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  progressDotActive: {
    backgroundColor: '#16A34A',
  },
  audioControls: {
    width: '100%',
    gap: 10,
  },
});
