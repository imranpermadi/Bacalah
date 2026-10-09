import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

/**
 * 🍕 Pabrik Pemotong Suku Kata Cici
 * Gameplay diperbarui:
 * - Kata disajikan sebagai balok roti/kue suku kata yang besar dan jelas.
 * - Tombol gunting ✂️ besar (64x64 px) dengan hitSlop lebar sehingga responsif dan anti-meleset.
 * - Saat digunting: animasi kartu suku kata membelah diri dengan haptic getar dan suara Cici melafalkan suku kata!
 */
export function PotongSukuKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession('potong', 30);
  const recordLetter = useAppStore((s) => s.recordLetter);

  const [wordItem, setWordItem] = useState<WordItem>(() => pickWord());
  const [cutSyllables, setCutSyllables] = useState<number[]>([]); // indeks celah yang sudah dipotong

  // Reanimated values for slice effect
  const sliceSpread = useSharedValue(0);

  useEffect(() => {
    if (session.finished) return;
    const w = pickWord();
    setWordItem(w);
    setCutSyllables([]);
    sliceSpread.set(0);

    const t = setTimeout(() => {
      container.sound.hearSlow(w.syllables.map((s) => s.toLowerCase()));
    }, 450);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  // Jumlah celah pemotongan yang dibutuhkan = jumlah suku kata - 1
  const totalCutsNeeded = Math.max(1, wordItem.syllables.length - 1);

  const handleCutGap = (gapIndex: number) => {
    if (cutSyllables.includes(gapIndex)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    container.sound.sfx('pop');

    // Trigger slice bounce animation
    sliceSpread.set(
      withSequence(
        withTiming(12, { duration: 120 }),
        withSpring(6, { dampingRatio: 0.8 })
      )
    );

    const nextCuts = [...cutSyllables, gapIndex];
    setCutSyllables(nextCuts);

    // Lafalkan suku kata yang terpotong
    const cutSyl = wordItem.syllables[gapIndex] || wordItem.syllables[0];
    container.sound.hear(cutSyl.toLowerCase());

    // Cek apakah seluruh suku kata sudah terpotong
    if (nextCuts.length >= totalCutsNeeded) {
      wordItem.word.split('').forEach((l) => recordLetter(l, true));
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      session.correct(`potong-${wordItem.word}`);

      setTimeout(() => {
        container.sound.hear(wordItem.word.toLowerCase());
      }, 500);
    }
  };

  const animatedSliceStyle = useAnimatedStyle(() => ({
    columnGap: 8 + sliceSpread.get(),
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
        {/* Visual Header */}
        <View style={styles.topCard}>
          <Text style={styles.wordEmoji}>{wordItem.emoji}</Text>
          <Text style={styles.instructionTitle}>
            Ketuk tombol ✂️ di bawah untuk memotong kata menjadi suku kata!
          </Text>
          <Text style={styles.instructionSub}>
            Kata: <Text style={{ fontFamily: fonts.black, color: colors.ink }}>{wordItem.word.toUpperCase()}</Text> ({wordItem.syllables.length} Suku Kata)
          </Text>
        </View>

        {/* Interactive Syllable Slicing Stage */}
        <Animated.View style={[styles.stageRow, animatedSliceStyle]}>
          {wordItem.syllables.map((syl, i) => {
            const isLast = i === wordItem.syllables.length - 1;
            const isCut = cutSyllables.includes(i);

            return (
              <React.Fragment key={i}>
                {/* Balok Suku Kata */}
                <View
                  style={[
                    styles.syllableBlock,
                    isCut && styles.syllableBlockCut,
                    raised(isCut ? '#15803D' : colors.line),
                  ]}
                >
                  <Text style={[styles.syllableText, isCut && { color: '#166534' }]}>
                    {syl.toUpperCase()}
                  </Text>
                  <Text style={styles.sylOrderBadge}>Bagian {i + 1}</Text>
                </View>

                {/* Tombol Gunting Lebar & Mudah Ditekan */}
                {!isLast && (
                  <View style={styles.cutterContainer}>
                    <Pressable
                      onPress={() => handleCutGap(i)}
                      hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
                      style={[
                        styles.cutterBtn,
                        isCut && styles.cutterBtnDone,
                        raised(isCut ? '#16A34A' : colors.coralDark),
                      ]}
                    >
                      <Text style={styles.cutterIcon}>{isCut ? '✨' : '✂️'}</Text>
                    </Pressable>
                    <Text style={styles.cutterHint}>{isCut ? 'TERPOTONG' : 'POTONG'}</Text>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </Animated.View>

        {/* Audio Helper Controls */}
        <View style={styles.audioControls}>
          <BigButton
            label="🐢 Dengar Pelan-Pelan (Per Suku Kata)"
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
    padding: 18,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
    gap: 4,
  },
  wordEmoji: { fontSize: 72 },
  instructionTitle: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  instructionSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 18,
  },
  syllableBlock: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FDE68A',
    minWidth: 95,
  },
  syllableBlockCut: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  syllableText: {
    fontFamily: fonts.black,
    fontSize: 34,
    color: '#0F172A',
    letterSpacing: 2,
  },
  sylOrderBadge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 4,
  },
  cutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  cutterBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cutterBtnDone: {
    backgroundColor: '#22C55E',
  },
  cutterIcon: {
    fontSize: 28,
  },
  cutterHint: {
    fontFamily: fonts.black,
    fontSize: 10,
    color: colors.coral,
  },
  audioControls: {
    width: '100%',
    gap: 8,
  },
});
