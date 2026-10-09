import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { container } from '../../../core/di/container';
import { colors, fonts } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { DictationGenerator } from '../../../domain/services/DictationGenerator';
import { AlphabetMasteryEngine } from '../../../domain/services/AlphabetMasteryEngine';
import { BubbleKeyboard } from '../../components/play/BubbleKeyboard';
import { HearButtons } from '../../components/common/ui';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';
import { Dimensions } from 'react-native';

/** 🧩 Isi huruf yang hilang pada kata bergambar. */
export function TekaTekiHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession(6);
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
      session.correct();
    } else {
      setWob((w) => ({ letter: l, token: w.token + 1 }));
      session.wrong();
    }
  };

  return (
    <GameShell title="Teka-Teki Huruf" emoji="🧩" color={colors.peach} session={session} onExit={onExit}>
      <View style={styles.center}>
        <Text style={styles.emoji}>{word.emoji}</Text>
        <View style={styles.row}>
          {word.word.split('').map((c, i) => (
            <View key={i} style={[styles.box, i === hole && !filled && styles.hole]}>
              <Text style={styles.ch}>{i === hole && !filled ? '?' : c}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ paddingBottom: 12, gap: 12 }}>
        <BubbleKeyboard letters={options} onPress={press} highlightLetter={session.wrongThisRound >= 2 ? word.word[hole] : null} wobbleLetter={wob.letter} wobbleToken={wob.token} width={Dimensions.get('window').width} />
        <HearButtons text={word.word.toLowerCase()} slowParts={word.syllables.map((s) => s.toLowerCase())} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 100 },
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  box: { width: 46, height: 58, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 3, borderColor: colors.line, borderBottomWidth: 5, alignItems: 'center', justifyContent: 'center' },
  hole: { backgroundColor: '#FFF3B0', borderColor: colors.sunnyDark },
  ch: { fontFamily: fonts.black, fontSize: 30, color: colors.ink },
});

