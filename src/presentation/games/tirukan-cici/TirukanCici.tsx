import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';
import { letterInfo, LETTERS } from '../../../data/content/alphabet';
import { OPEN_SYLLABLES, WORDS } from '../../../data/content/curriculum';
import { VoiceResult } from '../../../core/sound/VoiceEvaluatorService';
import { AlphabetMasteryEngine } from '../../../domain/services/AlphabetMasteryEngine';
import { VoiceMicButton } from '../../components/play/VoiceMicButton';
import { useAppStore } from '../../stores/useAppStore';
import { GameShell, useGameSession } from '../GameShell';

interface Item { target: string; speak: string; accepted: string[]; emoji?: string; label: string }

function makeItem(round: number): Item {
  const weights = useAppStore.getState().weights;
  const kind = round % 3; // huruf, suku kata, kata
  if (kind === 0) {
    const l = AlphabetMasteryEngine.weightedPick(LETTERS, (x) => weights[x] ?? 1);
    const info = letterInfo(l);
    return {
      target: info.speak,
      speak: info.speak,
      accepted: [
        info.speak,
        l.toLowerCase(),
        l.toUpperCase(),
        `huruf ${info.speak}`,
        `huruf ${l.toLowerCase()}`,
      ],
      label: l,
      emoji: info.emoji,
    };
  }
  if (kind === 1) {
    const s = OPEN_SYLLABLES[Math.floor(Math.random() * OPEN_SYLLABLES.length)];
    return {
      target: s.toLowerCase(),
      speak: s.toLowerCase(),
      accepted: [s.toLowerCase(), s.toUpperCase()],
      label: s,
    };
  }
  const w = WORDS[Math.floor(Math.random() * WORDS.length)];
  return {
    target: w.word.toLowerCase(),
    speak: w.word.toLowerCase(),
    accepted: [w.word.toLowerCase(), w.word.toUpperCase()],
    label: w.word,
    emoji: w.emoji,
  };
}

/** 🎤 Tirukan Cici (Voice Challenge): bintang 1–3 berdasarkan kemiripan lafal. */
export function TirukanCici({ onExit }: { onExit: () => void }) {
  const session = useGameSession('tirukan', 30);
  const [item, setItem] = useState<Item>(() => makeItem(0));

  useEffect(() => {
    if (session.finished) return;
    const it = makeItem(session.round);
    setItem(it);
    const t = setTimeout(() => container.sound.hear(it.speak), 500);
    return () => clearTimeout(t);
  }, [session.round, session.finished]);

  const onResult = (r: VoiceResult) => {
    if (r.stars >= 2 || session.wrongThisRound >= 2) {
      session.correct();
    } else {
      session.wrong();
    }
  };

  return (
    <GameShell title="Tirukan Cici" emoji="🎤" color={colors.lavender} session={session} onExit={onExit}>
      <View style={styles.center}>
        <View style={styles.wordCard3D}>
          <LinearGradient
            colors={['#FFFFFF', '#FAF5FF']}
            style={styles.cardGradient}
          >
            {item.emoji ? <Text style={styles.emoji}>{item.emoji}</Text> : null}
            <Text style={styles.word}>{item.label}</Text>
            <View style={styles.hintBadge}>
              <Text style={styles.sub}>Dengar Cici, lalu tirukan ya! 🎙️</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
      <View style={{ paddingBottom: 28 }}>
        <VoiceMicButton target={item.target} speakText={item.speak} accepted={item.accepted} onResult={onResult} />
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
  wordCard3D: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderBottomWidth: 6,
    borderBottomColor: '#C084FC',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradient: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emoji: { fontSize: 84 },
  word: {
    fontFamily: fonts.black,
    fontSize: 58,
    color: colors.ink,
    letterSpacing: 2,
    textAlign: 'center',
  },
  hintBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 6,
  },
  sub: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: '#7E22CE',
  },
});
