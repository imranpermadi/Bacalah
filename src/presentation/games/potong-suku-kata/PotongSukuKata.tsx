import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { ToyBlockAudioButtons } from '../../components/play/ToyBlockAudioButtons';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

function TactileScissorButton({
  isCutWrong,
  isSuggested,
  onPress,
}: {
  isCutWrong: boolean;
  isSuggested: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
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
    </Animated.View>
  );
}

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

  // Wobble shared value with pure spring physics
  const wobbleX = useSharedValue(0);

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
    wobbleX.value = 0;

    const t = setTimeout(() => {
      container.sound.hear(w.word.toLowerCase());
    }, 450);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const letters = useMemo(() => wordItem.word.toUpperCase().split(''), [wordItem]);
  const totalCutsNeeded = wordItem.syllables.length - 1;

  const handleCutGap = (gapIndex: number) => {
    if (successfulCuts.includes(gapIndex)) return;

    const isCorrect = correctCutIndices.includes(gapIndex);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      container.sound.sfx('pop');

      const nextCuts = [...successfulCuts, gapIndex];
      setSuccessfulCuts(nextCuts);
      setWrongCutIndex(null);

      const sortedCuts = [0, ...nextCuts.sort((a, b) => a - b), letters.length];
      const cutPos = sortedCuts.indexOf(gapIndex);
      const sylText = wordItem.word.slice(sortedCuts[cutPos - 1], gapIndex);
      if (sylText) {
        container.sound.hear(sylText.toLowerCase());
      }

      setHintMessage(`Bagus! Potongan "${sylText.toUpperCase()}" tepat! ✨`);

      if (nextCuts.length >= totalCutsNeeded) {
        wordItem.word.split('').forEach((l) => recordLetter(l, true));
        container.sound.sfx('tada_magic');
        session.correct(`potong-${wordItem.word}`);
        setHintMessage(`Hore! ${wordItem.word.toUpperCase()} berhasil dipotong: ${wordItem.syllables.join(' - ')}! 🌟`);

        setTimeout(() => {
          container.sound.hear(wordItem.word.toLowerCase());
        }, 550);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      container.sound.sfx('error_buzz');
      session.wrong();

      setWrongCutIndex(gapIndex);
      wobbleX.value = withSequence(
        withSpring(-10, { damping: 4, stiffness: 500 }),
        withSpring(10, { damping: 4, stiffness: 500 }),
        withSpring(-6, { damping: 5, stiffness: 450 }),
        withSpring(6, { damping: 5, stiffness: 450 }),
        withSpring(0, { damping: 8, stiffness: 400 })
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
        {/* Top Instruction Card: 3D Gradient Surface */}
        <View style={styles.topCard3D}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFBF5']}
            style={styles.topCardGradient}
          >
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
          </LinearGradient>
        </View>

        {/* Word Puzzle Slicing Area */}
        <View style={styles.puzzleArea}>
          <View style={styles.letterStrip}>
            {letters.map((char, index) => {
              const gapIndex = index + 1;
              const isLastLetter = index === letters.length - 1;
              const isCutDone = successfulCuts.includes(gapIndex);
              const isCutWrong = wrongCutIndex === gapIndex;
              const isSuggested = session.wrongThisRound >= 2 && correctCutIndices.includes(gapIndex);

              return (
                <View key={index} style={styles.letterSegment}>
                  <View
                    style={[
                      styles.letterTile,
                      raised(colors.sunnyDark),
                      isCutDone && styles.letterTileSliced,
                    ]}
                  >
                    <Text style={styles.letterChar}>{char}</Text>
                  </View>

                  {!isLastLetter && (
                    <Animated.View style={[styles.cutterSlot, isCutWrong && wobbleStyle]}>
                      {isCutDone ? (
                        <View style={styles.slicedDivider}>
                          <Text style={styles.slicedIcon}>✨✂️✨</Text>
                          <View style={styles.cutLine} />
                        </View>
                      ) : (
                        <TactileScissorButton
                          isCutWrong={isCutWrong}
                          isSuggested={isSuggested}
                          onPress={() => handleCutGap(gapIndex)}
                        />
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

        {/* Audio Helper Controls: Thick 3D Toy Blocks */}
        <View style={styles.audioControls}>
          <ToyBlockAudioButtons
            onHear={() => container.sound.hear(wordItem.word.toLowerCase())}
            onSlow={() => container.sound.hearSlow(wordItem.syllables.map((s) => s.toLowerCase()))}
          />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  topCard3D: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
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
  topCardGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  wordEmoji: { fontSize: 56 },
  instructionTitle: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  instructionSub: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  hintBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  hintText: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
  },
  puzzleArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  letterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  letterSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterTile: {
    width: 48,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.sunny,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTileSliced: {
    backgroundColor: '#BBF7D0',
    borderColor: '#22C55E',
  },
  letterChar: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.ink,
  },
  cutterSlot: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scissorBtn: {
    width: 28,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scissorBtnWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  scissorBtnSuggested: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  scissorEmoji: {
    fontSize: 16,
  },
  slicedDivider: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slicedIcon: {
    fontSize: 10,
  },
  cutLine: {
    width: 2,
    height: 36,
    backgroundColor: '#22C55E',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  progressLabel: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.inkSoft,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#22C55E',
  },
  audioControls: {
    width: '100%',
    paddingBottom: 16,
  },
});
