import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { container } from '../../../core/di/container';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

/** 🚂 Susun gerbong suku kata sesuai kata yang diucapkan Cici. */
export function KeretaKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession('kereta', 30);
  const recordLetter = useAppStore((s) => s.recordLetter);
  const [word, setWord] = useState<WordItem>(() => pickWord());
  const [placed, setPlaced] = useState<number[]>([]);
  const [cards, setCards] = useState<{ s: string; id: number }[]>([]);
  const [wob, setWob] = useState({ id: -1, token: 0 });

  useEffect(() => {
    if (session.finished) return;
    const w = pickWord();
    setWord(w);
    setPlaced([]);
    setCards(w.syllables.map((s, id) => ({ s, id })).sort(() => Math.random() - 0.5));
    const t = setTimeout(() => container.sound.hear(w.word.toLowerCase()), 500);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const tap = (c: { s: string; id: number }) => {
    if (placed.includes(c.id) || placed.length >= word.syllables.length) return;
    const expected = placed.length;
    if (c.id === expected) {
      c.s.split('').forEach((l) => recordLetter(l, true));
      container.sound.speak(c.s.toLowerCase());
      const next = [...placed, c.id];
      setPlaced(next);
      if (next.length === word.syllables.length) session.correct();
    } else {
      recordLetter(word.syllables[expected][0], false, c.s[0]);
      setWob((w) => ({ id: c.id, token: w.token + 1 }));
      session.wrong();
    }
  };

  return (
    <GameShell title="Kereta Kata Cici" emoji="🚂" color={colors.coral} session={session} onExit={onExit}>
      <Text style={styles.emoji}>{word.emoji}</Text>
      <View style={styles.train}>
        <Text style={styles.engine}>🚂</Text>
        {word.syllables.map((s, i) => (
          <View key={i} style={[styles.wagon, placed.length > i && styles.wagonFull]}>
            <Text style={styles.wagonText}>{placed.length > i ? word.syllables[i] : '?'}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cards}>
        {cards.map((c, i) => {
          const [bg, edge] = bubblePalette[(i + 2) % bubblePalette.length];
          const used = placed.includes(c.id);
          return (
            <Wobble key={c.id + word.word} token={wob.id === c.id ? wob.token : 0}>
              <Pressable disabled={used} onPress={() => tap(c)} style={[styles.card, { backgroundColor: used ? '#EEE' : bg, borderBottomColor: used ? '#CCC' : edge }]}>
                <Text style={styles.cardText}>{used ? '' : c.s}</Text>
              </Pressable>
            </Wobble>
          );
        })}
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} onPress={() => container.sound.hear(word.word.toLowerCase())} />
        <BigButton label="🐢 Cici Pelan-Pelan" color={colors.peach} edge={colors.peachDark} onPress={() => container.sound.hearSlow(word.syllables.map((s) => s.toLowerCase()))} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 72, textAlign: 'center' },
  train: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, flexWrap: 'wrap' },
  engine: { fontSize: 50 },
  wagon: { minWidth: 76, height: 64, borderRadius: 14, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.inkSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  wagonFull: { borderStyle: 'solid', borderColor: colors.mintDark, backgroundColor: '#E7FFF3' },
  wagonText: { fontFamily: fonts.black, fontSize: 28, color: colors.ink },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', padding: 12, flex: 1 },
  card: { minWidth: 90, height: 72, borderRadius: 22, borderBottomWidth: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  cardText: { fontFamily: fonts.black, fontSize: 32, color: colors.ink },
});

