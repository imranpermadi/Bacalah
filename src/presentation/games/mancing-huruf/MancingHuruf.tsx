import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { bubblePalette, colors, fonts, radius } from '../../../core/theme';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

function TactileFish({
  letter,
  bg,
  edge,
  isCaught,
  onPress,
}: {
  letter: string;
  bg: string;
  edge: string;
  isCaught: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pressY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: isCaught ? withSpring(-50, { damping: 6, stiffness: 220 }) : pressY.value },
    ],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
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
          styles.fish,
          { backgroundColor: bg, borderBottomColor: edge },
        ]}
      >
        <Text style={styles.fishEmoji}>🐟</Text>
        <Text style={styles.fishLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** 🎣 Cici memancing huruf yang sesuai dengan suara yang diperdengarkan. */
export function MancingHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('mancing', 30);
  const { q, answer, hear, wobble, info } = useLetterRound(session, 4);
  const [caught, setCaught] = useState<string | null>(null);

  React.useEffect(() => setCaught(null), [session.round]);

  return (
    <GameShell title="Mancing Huruf" emoji="🎣" color={colors.mint} session={session} onExit={onExit}>
      <View style={styles.top}>
        <Text style={styles.rod}>🎣</Text>
        <View style={styles.hintBadge}>
          <Text style={styles.hint}>Pancing ikan huruf yang kamu dengar!</Text>
        </View>
      </View>

      <View style={styles.pondCard}>
        <LinearGradient
          colors={['#E0F2FE', '#BAE6FD']}
          style={styles.pondGradient}
        >
          {q.options.map((l, i) => {
            const [bg, edge] = bubblePalette[(i + 1) % bubblePalette.length];
            return (
              <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
                <Float axis="x" amplitude={18} duration={1500 + i * 300} delay={i * 150}>
                  <TactileFish
                    letter={l}
                    bg={bg}
                    edge={edge}
                    isCaught={caught === l}
                    onPress={() => {
                      if (answer(l)) setCaught(l);
                    }}
                  />
                </Float>
              </Wobble>
            );
          })}
        </LinearGradient>
      </View>

      <View style={{ padding: 16, gap: 8 }}>
        {caught ? (
          <View style={styles.revealBadge}>
            <Text style={styles.reveal}>{info.emoji} {info.word}</Text>
          </View>
        ) : null}
        <BigButton label="🔊 Dengar Cici lagi" color={colors.sunny} edge={colors.sunnyDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingVertical: 6, gap: 4 },
  rod: { fontSize: 44 },
  hintBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hint: { fontFamily: fonts.heavy, fontSize: 14, color: colors.ink },
  pondCard: {
    flex: 1,
    marginHorizontal: 14,
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  fish: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 5,
    paddingHorizontal: 22,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  fishEmoji: { fontSize: 36, marginRight: 10 },
  fishLetter: { fontFamily: fonts.black, fontSize: 42, color: colors.ink },
  revealBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    alignItems: 'center',
  },
  reveal: { fontFamily: fonts.black, fontSize: 24, textAlign: 'center', color: '#15803D' },
});
