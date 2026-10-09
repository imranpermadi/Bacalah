import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { container } from '../../../core/di/container';
import { colors, fonts } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

/** Posisi potongan (indeks celah setelah huruf ke-i) dari suku kata. */
const boundaries = (w: WordItem) => {
  const cuts: number[] = [];
  let acc = 0;
  w.syllables.slice(0, -1).forEach((s) => {
    acc += s.length;
    cuts.push(acc);
  });
  return cuts;
};

/** 🍕 Potong kata menjadi suku kata yang benar dengan mengetuk celah di antara huruf. */
export function PotongSukuKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession(5);
  const recordLetter = useAppStore((s) => s.recordLetter);
  const [word, setWord] = useState<WordItem>(() => pickWord());
  const [cut, setCut] = useState<number[]>([]);
  const [wob, setWob] = useState({ gap: -1, token: 0 });

  useEffect(() => {
    if (session.finished) return;
    const w = pickWord();
    setWord(w);
    setCut([]);
    const t = setTimeout(() => container.sound.hearSlow(w.syllables.map((s) => s.toLowerCase())), 500);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const need = boundaries(word);

  const tapGap = (gap: number) => {
    if (cut.includes(gap)) return;
    if (need.includes(gap)) {
      const next = [...cut, gap];
      setCut(next);
      container.sound.sfx('pop');
      if (next.length === need.length) {
        word.word.split('').forEach((l) => recordLetter(l, true));
        session.correct();
        container.sound.hearSlow(word.syllables.map((s) => s.toLowerCase()));
      }
    } else {
      setWob((w) => ({ gap, token: w.token + 1 }));
      session.wrong();
    }
  };

  const letters = word.word.split('');

  return (
    <GameShell title="Potong Suku Kata" emoji="🍕" color={colors.coral} session={session} onExit={onExit}>
      <View style={styles.center}>
        <Text style={styles.emoji}>{word.emoji}</Text>
        <Text style={styles.q}>Ketuk ✂️ di antara huruf untuk memotong suku kata!</Text>
        <View style={styles.row}>
          {letters.map((c, i) => (
            <React.Fragment key={i}>
              <Text style={styles.ch}>{c}</Text>
              {i < letters.length - 1 ? (
                <Wobble token={wob.gap === i + 1 ? wob.token : 0}>
                  <Pressable onPress={() => tapGap(i + 1)} style={[styles.gap, cut.includes(i + 1) && styles.gapCut]}>
                    <Text style={{ fontSize: cut.includes(i + 1) ? 22 : 16 }}>{cut.includes(i + 1) ? '✂️' : '·'}</Text>
                  </Pressable>
                </Wobble>
              ) : null}
            </React.Fragment>
          ))}
        </View>
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        <BigButton label="🐢 Cici Pelan-Pelan" color={colors.peach} edge={colors.peachDark} onPress={() => container.sound.hearSlow(word.syllables.map((s) => s.toLowerCase()))} />
        <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} onPress={() => container.sound.hear(word.word.toLowerCase())} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 90 },
  q: { fontFamily: fonts.heavy, fontSize: 15, color: colors.inkSoft, textAlign: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  ch: { fontFamily: fonts.black, fontSize: 44, color: colors.ink },
  gap: { width: 26, height: 56, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3B0', marginHorizontal: 2 },
  gapCut: { backgroundColor: colors.coral, width: 40 },
});

