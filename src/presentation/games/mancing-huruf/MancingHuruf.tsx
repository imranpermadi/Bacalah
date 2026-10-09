import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

/** 🎣 Cici memancing huruf yang sesuai dengan suara yang diperdengarkan. */
export function MancingHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('mancing', 30);
  const { q, answer, hear, wobble, info } = useLetterRound(session, 4);
  const [caught, setCaught] = React.useState<string | null>(null);
  React.useEffect(() => setCaught(null), [session.round]);

  return (
    <GameShell title="Mancing Huruf" emoji="🎣" color={colors.mint} session={session} onExit={onExit}>
      <View style={styles.top}>
        <Text style={styles.rod}>🎣</Text>
        <Text style={styles.hint}>Pancing huruf yang kamu dengar!</Text>
      </View>
      <View style={styles.pond}>
        {q.options.map((l, i) => {
          const [bg, edge] = bubblePalette[(i + 1) % bubblePalette.length];
          return (
            <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
              <Float axis="x" amplitude={18} duration={1500 + i * 300} delay={i * 150}>
                <Pressable
                  onPress={() => answer(l) && setCaught(l)}
                  style={[styles.fish, { backgroundColor: bg, borderBottomColor: edge }, caught === l && { transform: [{ translateY: -50 }] }]}
                >
                  <Text style={styles.fishEmoji}>🐟</Text>
                  <Text style={styles.fishLetter}>{l}</Text>
                </Pressable>
              </Float>
            </Wobble>
          );
        })}
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        {caught ? <Text style={styles.reveal}>{info.emoji} {info.word}</Text> : null}
        <BigButton label="🔊 Dengar Cici lagi" color={colors.sunny} edge={colors.sunnyDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingVertical: 4 },
  rod: { fontSize: 44 },
  hint: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  pond: { flex: 1, backgroundColor: '#BDE9FF', marginHorizontal: 12, borderRadius: 28, justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 },
  fish: { flexDirection: 'row', alignItems: 'center', borderRadius: 40, borderBottomWidth: 5, paddingHorizontal: 22, paddingVertical: 8 },
  fishEmoji: { fontSize: 36, marginRight: 10 },
  fishLetter: { fontFamily: fonts.black, fontSize: 42, color: colors.ink },
  reveal: { fontFamily: fonts.black, fontSize: 24, textAlign: 'center', color: colors.ink },
});

