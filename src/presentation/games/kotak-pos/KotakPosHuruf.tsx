import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { bubblePalette, colors, fonts, radius } from '../../../core/theme';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

function TactileMailbox({
  letter,
  bg,
  edge,
  locked,
  onPress,
}: {
  letter: string;
  bg: string;
  edge: string;
  locked: boolean;
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
        disabled={locked}
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
        style={[styles.box3D, { backgroundColor: bg, borderBottomColor: edge }]}
      >
        <Text style={styles.slot}>📮</Text>
        <Text style={styles.cap}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** 📦 Masukkan surat huruf kecil ke kotak pos huruf kapital yang tepat (b ≠ d, p ≠ q!). */
export function KotakPosHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('pos', 30);
  const { q, answer, hear, wobble, locked } = useLetterRound(session, 3);

  return (
    <GameShell title="Kotak Pos Huruf" emoji="📦" color={colors.sunny} session={session} onExit={onExit}>
      <View style={styles.letterWrap}>
        <View style={styles.envelopeCard}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFDF5']}
            style={styles.envelopeGradient}
          >
            <View style={styles.envelope}>
              <Text style={styles.env}>✉️</Text>
              <Text style={styles.small}>{q.target.toLowerCase()}</Text>
            </View>
            <Text style={styles.q}>Masukkan surat ke kotak pos huruf besarnya!</Text>
          </LinearGradient>
        </View>
      </View>
      <View style={styles.boxes}>
        {q.options.map((l, i) => {
          const [bg, edge] = bubblePalette[(i + 3) % bubblePalette.length];
          return (
            <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
              <TactileMailbox
                letter={l}
                bg={bg}
                edge={edge}
                locked={locked}
                onPress={() => answer(l)}
              />
            </Wobble>
          );
        })}
      </View>
      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  letterWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  envelopeCard: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
    borderBottomColor: '#FDBA74',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  envelopeGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  envelope: { alignItems: 'center', justifyContent: 'center' },
  env: { fontSize: 110 },
  small: { position: 'absolute', fontFamily: fonts.black, fontSize: 52, color: colors.ink, top: 34 },
  q: { fontFamily: fonts.heavy, fontSize: 15, color: colors.inkSoft, textAlign: 'center' },
  boxes: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
  box3D: {
    width: 96,
    height: 120,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  slot: { fontSize: 30 },
  cap: { fontFamily: fonts.black, fontSize: 52, color: colors.ink },
});
