import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { container } from '../../core/di/container';
import { colors, fonts } from '../../core/theme';
import { encouragement, randomHint, randomPraise } from '../../data/content/feedback';
import { Celebration } from '../components/common/Celebration';
import { BigButton, Stars } from '../components/common/ui';
import { MascotCici, Mood } from '../components/play/MascotCici';
import { useAppStore } from '../stores/useAppStore';

export const GAME_LEVEL_ID = 0; // sesi game dicatat di level 0

export function useGameSession(total: number) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongThisRound, setWrongThisRound] = useState(0);
  const [mood, setMood] = useState<Mood>('idle');
  const [moodToken, setMoodToken] = useState(0);
  const [message, setMessage] = useState('Ayo kita mulai! Dengarkan Cici ya! 🐱');
  const [finished, setFinished] = useState(false);
  const rewarded = useRef(false);
  const addStars = useAppStore((s: any) => s.addStars);

  const stars = score / total >= 0.8 ? 3 : score / total >= 0.5 ? 2 : 1;

  const say = (m: string, md: Mood) => {
    setMessage(m);
    setMood(md);
    setMoodToken((t) => t + 1);
  };

  /** Dipanggil saat jawaban benar. Mengembalikan true bila sesi selesai. */
  const correct = useCallback(() => {
    const first = wrongThisRound === 0;
    const newScore = score + (first ? 1 : 0);
    setScore(newScore);
    container.sound.sfx('pop');
    say(randomPraise(), 'happy');
    const next = round + 1;
    setTimeout(() => {
      if (next >= total) setFinished(true);
      else {
        setRound(next);
        setWrongThisRound(0);
        say('Dengarkan Cici lagi ya! 🎧', 'idle');
      }
    }, 1100);
  }, [round, score, total, wrongThisRound]);

  const wrong = useCallback(() => {
    setWrongThisRound((w) => w + 1);
    container.sound.sfx('boop');
    say(randomHint(), 'hint');
  }, []);

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true;
      addStars(stars);
      container.sound.sfx('clap');
    }
  }, [finished, stars, addStars]);

  const restart = () => {
    rewarded.current = false;
    setRound(0);
    setScore(0);
    setWrongThisRound(0);
    setFinished(false);
    say('Ayo main lagi! 🎉', 'happy');
  };

  return { round, score, total, mood, moodToken, message, finished, stars, correct, wrong, restart, wrongThisRound, say };
}

type Session = ReturnType<typeof useGameSession>;

export function GameShell({ title, emoji, color, session, onExit, children }: { title: string; emoji: string; color: string; session: Session; onExit: () => void; children: React.ReactNode }) {
  useEffect(() => () => container.sound.stop(), []);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <BigButton label="⬅ Kembali" small color="#FFFFFF" edge="#DDD" onPress={onExit} />
        <Text style={styles.title}>
          {emoji} {title}
        </Text>
        <Text style={styles.counter}>
          {Math.min(session.round + 1, session.total)}/{session.total}
        </Text>
      </View>
      {session.finished ? (
        <View style={styles.finish}>
          <Text style={styles.finishTitle}>Selesai! 🎉</Text>
          <Stars count={session.stars} size={56} />
          <Text style={styles.finishText}>
            Benar langsung: {session.score} dari {session.total}
          </Text>
          <Text style={styles.finishText}>{session.stars === 3 ? encouragement.high : session.stars === 2 ? encouragement.mid : encouragement.low}</Text>
          <Text style={styles.finishText}>🐱 +{session.stars} bintang untukmu!</Text>
          <View style={{ gap: 12, marginTop: 20, alignSelf: 'stretch', paddingHorizontal: 32 }}>
            <BigButton label="🔁 Main Lagi" color={colors.mint} edge={colors.mintDark} onPress={session.restart} />
            <BigButton label="🏠 Pilih Game Lain" onPress={onExit} />
          </View>
          <Celebration visible />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingVertical: 8 }}>
            <MascotCici mood={session.mood} moodToken={session.moodToken} message={session.message} />
          </View>
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontFamily: fonts.black, fontSize: 20, color: colors.ink, flex: 1, textAlign: 'center' },
  counter: { fontFamily: fonts.black, fontSize: 18, color: colors.ink, minWidth: 44, textAlign: 'right' },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  finishTitle: { fontFamily: fonts.black, fontSize: 40, color: colors.ink },
  finishText: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink, textAlign: 'center' },
});

