import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { DictationGenerator } from '../../../domain/services/DictationGenerator';
import { AlphabetMasteryEngine } from '../../../domain/services/AlphabetMasteryEngine';
import { BubbleKeyboard } from '../../components/play/BubbleKeyboard';
import { ToyBlockAudioButtons } from '../../components/play/ToyBlockAudioButtons';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

const { width } = Dimensions.get('window');

/** 🧩 Isi huruf yang hilang pada kata bergambar. */
export function TekaTekiHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('teka', 30);
  const recordLetter = useAppStore((s) => s.recordLetter);
  const [word, setWord] = useState<WordItem>(() => pickWord(1));
  const [hole, setHole] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [filled, setFilled] = useState(false);
  const [wob, setWob] = useState({ letter: null as string | null, token: 0 });

  useEffect(() => {
    if (session.finished) return;
    const w = pickWord(1);
    const weights = useAppStore.getState().weights;
    const idxs = w.word.split('').map((_, i) => i);
    const h = AlphabetMasteryEngine.weightedPick(idxs, (i) => weights[w.word[i]] ?? 1);
    setWord(w);
    setHole(h);
    setFilled(false);
    setOptions(DictationGenerator.choices(w.word[h], 4, weights));
    const t = setTimeout(() => container.sound.hear(w.word.toLowerCase()), 500);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const press = (l: string) => {
    if (filled) return;
    const target = word.word[hole];
    const ok = l === target;
    recordLetter(target, ok, l);
    if (ok) {
      setFilled(true);
      container.sound.sfx('tada_magic');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      session.correct();
    } else {
      setWob((w) => ({ letter: l, token: w.token + 1 }));
      container.sound.sfx('error_buzz');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      session.wrong();
    }
  };

  return (
    <GameShell title="Teka-Teki Huruf" emoji="🧩" color={colors.peach} session={session} onExit={onExit}>
      <View style={styles.center}>
        <View style={styles.puzzleCard3D}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFBF5']}
            style={styles.cardGradient}
          >
            <Text style={styles.emoji}>{word.emoji}</Text>
            <View style={styles.row}>
              {word.word.split('').map((c, i) => (
                <View key={i} style={[styles.box, i === hole && !filled && styles.hole, i === hole && filled && styles.holeFilled]}>
                  <Text style={[styles.ch, i === hole && filled && { color: '#15803D' }]}>
                    {i === hole && !filled ? '?' : c}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <BubbleKeyboard
          letters={options}
          onPress={press}
          wobbleLetter={wob.letter}
          wobbleToken={wob.token}
          disabled={filled}
          width={width}
        />
        <ToyBlockAudioButtons
          onHear={() => container.sound.hear(word.word.toLowerCase())}
          onSlow={() => container.sound.hearSlow(word.syllables.map((s) => s.toLowerCase()))}
        />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  puzzleCard3D: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 6,
    borderBottomColor: '#FDBA74',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
  emoji: { fontSize: 80 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  box: {
    width: 56,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hole: {
    borderStyle: 'dashed',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  holeFilled: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderBottomColor: '#22C55E',
  },
  ch: { fontFamily: fonts.black, fontSize: 34, color: colors.ink },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
});
