import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { bubblePalette, colors, fonts, radius } from '../../../core/theme';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { ToyBlockAudioButtons } from '../../components/play/ToyBlockAudioButtons';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';
import { pickWord } from '../useLetterRound';

function TactileSyllableCard({
  item,
  bg,
  edge,
  used,
  onPress,
}: {
  item: { s: string; id: number };
  bg: string;
  edge: string;
  used: boolean;
  onPress: () => void;
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
    <Animated.View style={animStyle}>
      <Pressable
        disabled={used}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
          pressY.value = withSpring(3, { damping: 14, stiffness: 350 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
          pressY.value = withSpring(0, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: used ? '#E2E8F0' : bg,
            borderBottomColor: used ? '#CBD5E1' : edge,
            borderBottomWidth: used ? 2 : 5,
          },
          used && styles.cardUsed,
        ]}
      >
        <Text style={[styles.cardText, used && { color: '#94A3B8' }]}>
          {used ? '' : item.s}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = [...placed, c.id];
      setPlaced(next);
      if (next.length === word.syllables.length) {
        container.sound.sfx('tada_magic');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        session.correct();
      }
    } else {
      recordLetter(word.syllables[expected][0], false, c.s[0]);
      container.sound.sfx('error_buzz');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
              <TactileSyllableCard
                item={c}
                bg={bg}
                edge={edge}
                used={used}
                onPress={() => tap(c)}
              />
            </Wobble>
          );
        })}
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <ToyBlockAudioButtons
          onHear={() => container.sound.hear(word.word.toLowerCase())}
          onSlow={() => container.sound.hearSlow(word.syllables.map((s) => s.toLowerCase()))}
        />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 72, textAlign: 'center', marginVertical: 4 },
  train: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  engine: { fontSize: 50 },
  wagon: {
    minWidth: 76,
    height: 64,
    borderRadius: 14,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
  },
  wagonFull: {
    borderStyle: 'solid',
    borderColor: '#86EFAC',
    borderBottomWidth: 5,
    borderBottomColor: colors.mintDark,
    backgroundColor: '#DCFCE7',
  },
  wagonText: { fontFamily: fonts.black, fontSize: 28, color: colors.ink },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    padding: 12,
    flex: 1,
  },
  card: {
    minWidth: 90,
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardUsed: {
    opacity: 0.4,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardText: { fontFamily: fonts.black, fontSize: 32, color: colors.ink },
});
