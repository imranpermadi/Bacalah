import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../core/di/container';
import { colors, fonts, radius } from '../../core/theme';
import { encouragement, randomHint, randomPraise } from '../../data/content/feedback';
import { Celebration } from '../components/common/Celebration';
import { BintangKemenangan } from '../components/common/BintangKemenangan';
import { StaggeredEntrance } from '../components/motion/StaggeredEntrance';
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
      try {
        container.sound.sfx('tada_magic');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
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
    try {
      container.sound.sfx('error_buzz');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
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

function TactileHeaderButton({
  label,
  onPress,
}: {
  label: string;
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
        onPress={() => {
          container.sound.sfx('pop');
          onPress();
        }}
        style={styles.headerBtnWrapper}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.headerBtnGradient}
        >
          <Text style={styles.headerBtnText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

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
      {/* 3D Header Bar */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <View style={styles.headerLeft}>
          <TactileHeaderButton label="🏠 Beranda" onPress={handleBackToHome} />
          <TactileHeaderButton label="🎮 Games" onPress={onExit} />
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
          <View style={styles.counterBadge}>
            <Text style={styles.counter}>
              {Math.min(session.round + 1, session.total)}/{session.total}
            </Text>
          </View>
        </View>
      </View>

      {session.finished ? (
        <View style={styles.finish}>
          {/* Victory Star Pop Out */}
          <BintangKemenangan size={80} label={`+${session.stars} ⭐ BINTANG!`} />

          {/* 1. Header Trophy & Stars */}
          <StaggeredEntrance index={0}>
            <View style={styles.finishCard3D}>
              <LinearGradient
                colors={['#FFFFFF', '#FFFDF5']}
                style={styles.finishCardGradient}
              >
                <Text style={styles.finishTitle}>Selesai! 🎉</Text>
                <Stars count={session.stars} size={52} />
                <Text style={styles.finishScore}>
                  Benar langsung: {session.score} dari {session.total}
                </Text>
                <Text style={styles.finishPraise}>
                  {session.stars === 3
                    ? encouragement.high
                    : session.stars === 2
                    ? encouragement.mid
                    : encouragement.low}
                </Text>
                <View style={styles.starsRewardBadge}>
                  <Text style={styles.starsRewardText}>
                    🐱 +{session.stars} bintang telah ditambahkan ke rapormu!
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </StaggeredEntrance>

          {/* 2. Action Buttons */}
          <StaggeredEntrance index={1}>
            <View style={styles.finishActions}>
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
          </StaggeredEntrance>

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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerRight: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  headerBtnWrapper: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerBtnGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontFamily: fonts.black,
    fontSize: 12,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  resumeBadge: {
    fontFamily: fonts.heavy,
    fontSize: 11,
    color: colors.inkSoft,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counter: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'right',
  },
  finish: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  finishCard3D: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 6,
    borderBottomColor: '#FDBA74',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  finishCardGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  finishTitle: {
    fontFamily: fonts.black,
    fontSize: 34,
    color: colors.ink,
  },
  finishScore: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.ink,
    marginTop: 4,
  },
  finishPraise: {
    fontFamily: fonts.heavy,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  starsRewardBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginTop: 4,
  },
  starsRewardText: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: '#D97706',
    textAlign: 'center',
  },
  finishActions: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 16,
  },
});
