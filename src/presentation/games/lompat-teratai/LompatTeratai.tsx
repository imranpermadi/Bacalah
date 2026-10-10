import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '../../../core/theme';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

const TRACK = 30;

function Cici({ pos }: { pos: number }) {
  const a = useAnimatedStyle(() => ({
    left: withSpring(`${Math.min(88, (pos / TRACK) * 88)}%` as any, { damping: 8, stiffness: 180 }),
  }));
  return <Animated.Text style={[styles.cici, a]}>🐱</Animated.Text>;
}

function TactileLilyPad({
  letter,
  onPress,
}: {
  letter: string;
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
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
          pressY.value = withSpring(4, { damping: 14, stiffness: 350 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
          pressY.value = withSpring(0, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
        style={styles.pad}
      >
        <Text style={styles.padLeaf}>🪷</Text>
        <Text style={styles.padLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** 🏃 Bantu Cici melompati teratai berhuruf yang benar untuk menyeberangi kolam. */
export function LompatTeratai({ onExit }: { onExit: () => void }) {
  const session = useGameSession('teratai', TRACK);
  const { q, answer, hear, wobble } = useLetterRound(session, 3);

  return (
    <GameShell title="Lompat Teratai" emoji="🏃" color={colors.mint} session={session} onExit={onExit}>
      <View style={styles.pondCard}>
        <LinearGradient
          colors={['#E0F2FE', '#BAE6FD']}
          style={styles.pondGradient}
        >
          <View style={styles.questionBadge}>
            <Text style={styles.q}>Lompat ke teratai huruf yang Cici ucapkan! 🐸</Text>
          </View>

          <View style={styles.pads}>
            {q.options.map((l, i) => (
              <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
                <Float amplitude={6} duration={1200 + i * 200} delay={i * 250}>
                  <TactileLilyPad
                    letter={l}
                    onPress={() => answer(l)}
                  />
                </Float>
              </Wobble>
            ))}
          </View>

          <View style={styles.track}>
            <Cici pos={session.round + (session.wrongThisRound === 0 && session.mood === 'happy' ? 1 : 0)} />
            <Text style={styles.flag}>🏁</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici lagi" color={colors.sunny} edge={colors.sunnyDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  pondCard: {
    flex: 1,
    margin: 12,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7DD3FC',
    borderBottomWidth: 6,
    borderBottomColor: '#38BDF8',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pondGradient: {
    flex: 1,
    justifyContent: 'space-around',
    padding: 16,
  },
  questionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  q: { fontFamily: fonts.black, fontSize: 15, textAlign: 'center', color: '#0369A1' },
  pads: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  pad: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderBottomWidth: 6,
    borderBottomColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  padLeaf: {
    position: 'absolute',
    top: -12,
    fontSize: 22,
  },
  padLetter: {
    fontFamily: fonts.black,
    fontSize: 48,
    color: '#064E3B',
    marginTop: 4,
  },
  track: {
    height: 60,
    backgroundColor: '#86EFAC',
    borderRadius: radius.lg,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderBottomWidth: 4,
    borderBottomColor: '#4ADE80',
    position: 'relative',
  },
  cici: { position: 'absolute', fontSize: 40 },
  flag: { position: 'absolute', right: 10, fontSize: 34 },
});
