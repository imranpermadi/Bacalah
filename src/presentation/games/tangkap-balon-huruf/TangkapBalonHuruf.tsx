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

function TactileBalloon({
  letter,
  bg,
  edge,
  onPress,
}: {
  letter: string;
  bg: string;
  edge: string;
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
        onPress={onPress}
      >
        <View style={[styles.balloon, { backgroundColor: bg, borderBottomColor: edge }]}>
          <View style={styles.balloonHighlight} />
          <Text style={styles.letter}>{letter}</Text>
        </View>
        <View style={styles.string} />
      </Pressable>
    </Animated.View>
  );
}

/** 🎈 Cici menyebut bunyi huruf, anak memecahkan balon huruf yang cocok. */
export function TangkapBalonHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('balon', 30);
  const { q, answer, hear, wobble } = useLetterRound(session, 5);
  const [popped, setPopped] = useState<string | null>(null);

  const tap = (l: string) => {
    if (answer(l)) setPopped(l);
  };
  React.useEffect(() => setPopped(null), [session.round]);

  return (
    <GameShell title="Tangkap Balon Huruf" emoji="🎈" color={colors.sky} session={session} onExit={onExit}>
      <View style={styles.skyCard}>
        <LinearGradient
          colors={['#E0F2FE', '#BAE6FD']}
          style={styles.skyGradient}
        >
          {q.options.map((l, i) => {
            const [bg, edge] = bubblePalette[i % bubblePalette.length];
            if (popped === l) return <Text key={l} style={styles.pop}>💥</Text>;
            return (
              <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
                <Float delay={i * 200} amplitude={10} duration={1100 + i * 150}>
                  <TactileBalloon
                    letter={l}
                    bg={bg}
                    edge={edge}
                    onPress={() => tap(l)}
                  />
                </Float>
              </Wobble>
            );
          })}
        </LinearGradient>
      </View>
      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici lagi" color={colors.mint} edge={colors.mintDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  skyCard: {
    flex: 1,
    marginHorizontal: 12,
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
  skyGradient: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'space-around',
    padding: 12,
  },
  balloon: {
    width: 96,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  balloonHighlight: {
    position: 'absolute',
    top: 14,
    left: 20,
    width: 22,
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-30deg' }],
  },
  letter: { fontFamily: fonts.black, fontSize: 52, color: colors.ink },
  string: { width: 2, height: 26, backgroundColor: colors.inkSoft, alignSelf: 'center', opacity: 0.7 },
  pop: { fontSize: 72, width: 96, textAlign: 'center' },
});
