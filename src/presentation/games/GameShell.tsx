import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { container } from '../../core/di/container';
import { colors, fonts, radius } from '../../core/theme';
import { encouragement, randomHint, randomPraise } from '../../data/content/feedback';
import { Celebration } from '../components/common/Celebration';
import { BigButton, Stars } from '../components/common/ui';
import { MascotCici, Mood } from '../components/play/MascotCici';
import { useAppStore } from '../stores/useAppStore';

export const GAME_LEVEL_ID = 0;

export function useGameSession(gameIdOrTotal: string | number = 'game', totalParam: number = 30) {
  const gameId = typeof gameIdOrTotal === 'string' ? gameIdOrTotal : 'game';
  const total = typeof gameIdOrTotal === 'number' ? gameIdOrTotal : totalParam;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongThisRound, setWrongThisRound] = useState(0);
  const [mood, setMood] = useState<Mood>('idle');
  const [moodToken, setMoodToken] = useState(0);
  const [message, setMessage] = useState('Ayo kita mulai! Dengarkan Cici ya! 🐱');
  const [finished, setFinished] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const rewarded = useRef(false);

  const addStars = useAppStore((s) => s.addStars);
  const getGameSessionState = useAppStore((s) => s.getGameSessionState);
  const recordGameRound = useAppStore((s) => s.recordGameRound);
  const resetGameSession = useAppStore((s) => s.resetGameSession);

  // Load saved progress on mount
  useEffect(() => {
    let mounted = true;
    getGameSessionState(gameId).then((prog) => {
      if (mounted && prog && prog.currentRound > 0 && prog.currentRound < total) {
        setRound(prog.currentRound);
        setScore(prog.score);
        setHasResumed(true);
        setMessage(`Melanjutkan ronde ke-${prog.currentRound + 1} dari ${total}! Semangat! 🚀`);
      }
    });
    return () => {
      mounted = false;
    };
  }, [gameId, total, getGameSessionState]);

  const stars = score / total >= 0.8 ? 3 : score / total >= 0.5 ? 2 : 1;

  const say = (m: string, md: Mood) => {
    setMessage(m);
    setMood(md);
    setMoodToken((t) => t + 1);
  };

  /** Dipanggil saat jawaban benar. Mengembalikan true bila sesi selesai. */
  const correct = useCallback(
    (questionId: string = `q-${round}`) => {
      const first = wrongThisRound === 0;
      const newScore = score + (first ? 1 : 0);
      setScore(newScore);
      container.sound.sfx('pop');
      say(randomPraise(), 'happy');
      const next = round + 1;

      // Simpan progres ke store & SQLite
      recordGameRound(gameId, next, newScore, questionId).catch(() => {});

      setTimeout(() => {
        if (next >= total) {
          setFinished(true);
          resetGameSession(gameId).catch(() => {});
        } else {
          setRound(next);
          setWrongThisRound(0);
          say('Dengarkan Cici lagi ya! 🎧', 'idle');
        }
      }, 1000);
    },
    [round, score, total, wrongThisRound, gameId, recordGameRound, resetGameSession]
  );

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
    setHasResumed(false);
    resetGameSession(gameId).catch(() => {});
    say('Ayo main lagi dari ronde pertama! 🎉', 'happy');
  };

  return {
    round,
    score,
    total,
    mood,
    moodToken,
    message,
    finished,
    stars,
    correct,
    wrong,
    restart,
    wrongThisRound,
    say,
    hasResumed,
  };
}

type Session = ReturnType<typeof useGameSession>;

export function GameShell({
  title,
  emoji,
  color,
  session,
  onExit,
  children,
}: {
  title: string;
  emoji: string;
  color: string;
  session: Session;
  onExit: () => void;
  children: React.ReactNode;
}) {
  const navigation = useNavigation<any>();
  useEffect(() => () => container.sound.stop(), []);

  const handleBackToHome = () => {
    container.sound.sfx('pop');
    onExit();
    try {
      navigation.navigate('Belajar');
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleBackToHome} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>🏠 Beranda</Text>
          </Pressable>
          <Pressable onPress={onExit} style={styles.exitBtn}>
            <Text style={styles.exitBtnText}>🎮 Games</Text>
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>
            {emoji} {title}
          </Text>
          {session.hasResumed ? (
            <Text style={styles.resumeBadge}>▶ Ronde {session.round + 1}</Text>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.counter}>
            {Math.min(session.round + 1, session.total)}/{session.total}
          </Text>
        </View>
      </View>

      {session.finished ? (
        <View style={styles.finish}>
          <Text style={styles.finishTitle}>Selesai! 🎉</Text>
          <Stars count={session.stars} size={56} />
          <Text style={styles.finishText}>
            Benar langsung: {session.score} dari {session.total}
          </Text>
          <Text style={styles.finishText}>
            {session.stars === 3
              ? encouragement.high
              : session.stars === 2
              ? encouragement.mid
              : encouragement.low}
          </Text>
          <Text style={styles.finishText}>🐱 +{session.stars} bintang untukmu!</Text>
          <View style={{ gap: 12, marginTop: 20, alignSelf: 'stretch', paddingHorizontal: 32 }}>
            <BigButton
              label="🔁 Main Lagi (30 Soal Baru)"
              color={colors.mint}
              edge={colors.mintDark}
              onPress={session.restart}
            />
            <BigButton
              label="🏠 Kembali ke Beranda"
              color={colors.sky}
              edge={colors.skyDark}
              onPress={handleBackToHome}
            />
            <BigButton label="🎮 Pilih Game Lain" small onPress={onExit} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerRight: {
    minWidth: 46,
    alignItems: 'flex-end',
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  homeBtnText: {
    fontFamily: fonts.black,
    fontSize: 12,
    color: colors.ink,
  },
  exitBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  exitBtnText: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.inkSoft,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
  },
  resumeBadge: {
    fontFamily: fonts.heavy,
    fontSize: 11,
    color: colors.inkSoft,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: 2,
  },
  counter: {
    fontFamily: fonts.black,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'right',
  },
  finish: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  finishTitle: { fontFamily: fonts.black, fontSize: 36, color: colors.ink },
  finishText: {
    fontFamily: fonts.heavy,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
});
